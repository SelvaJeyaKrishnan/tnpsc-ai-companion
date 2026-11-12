import os
import time
from collections import defaultdict
from threading import Lock
from typing import Optional
from fastapi import HTTPException, Request, status

# Configuration via environment variables with hardened production defaults
RATE_LIMIT_LOGIN_MAX = int(os.getenv("RATE_LIMIT_LOGIN_MAX", "50"))
RATE_LIMIT_LOGIN_WINDOW = int(os.getenv("RATE_LIMIT_LOGIN_WINDOW", "60"))

RATE_LIMIT_REGISTER_MAX = int(os.getenv("RATE_LIMIT_REGISTER_MAX", "100"))
RATE_LIMIT_REGISTER_WINDOW = int(os.getenv("RATE_LIMIT_REGISTER_WINDOW", "60"))

RATE_LIMIT_AI_MAX = int(os.getenv("RATE_LIMIT_AI_MAX", "60"))
RATE_LIMIT_AI_WINDOW = int(os.getenv("RATE_LIMIT_AI_WINDOW", "60"))

RATE_LIMIT_ROOM_MAX = int(os.getenv("RATE_LIMIT_ROOM_MAX", "15"))
RATE_LIMIT_ROOM_WINDOW = int(os.getenv("RATE_LIMIT_ROOM_WINDOW", "60"))

TRUST_PROXY_HEADERS = os.getenv("TRUST_PROXY_HEADERS", "false").lower() in ("true", "1", "yes")


class InMemoryRateLimiter:
    """
    Thread-safe sliding-window rate limiter with automatic stale key expiration.

    SCOPE & ARCHITECTURAL LIMITATION:
    - Designed for single-worker and local/staging deployment instances.
    - Rate limit state is held in-memory per Python process.
    - In a horizontally scaled multi-worker (uvicorn --workers > 1) or multi-instance
      production deployment (e.g. Kubernetes, Cloud Run), a shared distributed storage
      backend (such as Redis with atomic token bucket scripts) must be substituted to
      maintain synchronized cross-worker counters.
    """
    def __init__(self, requests_limit: int, window_seconds: int, name: str = "RateLimiter"):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.name = name
        self.hits = defaultdict(list)
        self.lock = Lock()
        self._last_cleanup = time.time()

    def check(self, key: str):
        now = time.time()
        with self.lock:
            # Periodic cleanup of expired keys every 60 seconds to avoid memory growth
            if now - self._last_cleanup > 60:
                self._purge_stale_keys(now)
                self._last_cleanup = now

            timestamps = self.hits[key]
            valid_timestamps = [t for t in timestamps if now - t < self.window_seconds]

            if len(valid_timestamps) >= self.requests_limit:
                retry_after = int(self.window_seconds - (now - valid_timestamps[0]))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded for {self.name}. Please wait {max(1, retry_after)} seconds before retrying.",
                    headers={"Retry-After": str(max(1, retry_after))}
                )

            valid_timestamps.append(now)
            self.hits[key] = valid_timestamps

    def _purge_stale_keys(self, now: float):
        """Purge entries that have no hits in the active window."""
        stale_keys = [k for k, v in self.hits.items() if not v or (now - v[-1] >= self.window_seconds)]
        for k in stale_keys:
            del self.hits[k]

    def reset(self):
        """Reset all rate limit counters (used in testing)."""
        with self.lock:
            self.hits.clear()
            self._last_cleanup = time.time()


# Pre-configured domain limiters
login_limiter = InMemoryRateLimiter(
    requests_limit=RATE_LIMIT_LOGIN_MAX,
    window_seconds=RATE_LIMIT_LOGIN_WINDOW,
    name="Login"
)

register_limiter = InMemoryRateLimiter(
    requests_limit=RATE_LIMIT_REGISTER_MAX,
    window_seconds=RATE_LIMIT_REGISTER_WINDOW,
    name="Registration"
)

ai_limiter = InMemoryRateLimiter(
    requests_limit=RATE_LIMIT_AI_MAX,
    window_seconds=RATE_LIMIT_AI_WINDOW,
    name="AI Tutor"
)

room_limiter = InMemoryRateLimiter(
    requests_limit=RATE_LIMIT_ROOM_MAX,
    window_seconds=RATE_LIMIT_ROOM_WINDOW,
    name="Study Room Creation"
)


def get_client_ip(request: Request) -> str:
    """
    Safely resolves the client IP address.
    Only respects X-Forwarded-For if TRUST_PROXY_HEADERS is explicitly enabled,
    preventing clients from spoofing their IP via synthetic headers.
    """
    if TRUST_PROXY_HEADERS:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            # First IP in comma-separated chain is the client
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


# Helper dependencies
def check_login_rate_limit(request: Request):
    client_ip = get_client_ip(request)
    login_limiter.check(f"ip:{client_ip}")


def check_register_rate_limit(request: Request):
    client_ip = get_client_ip(request)
    register_limiter.check(f"ip:{client_ip}")


def check_ai_rate_limit(user_id: int, request: Request):
    # Prefer rate limiting by authenticated user_id; fallback to client IP
    key = f"user:{user_id}" if user_id else f"ip:{get_client_ip(request)}"
    ai_limiter.check(key)


def check_room_rate_limit(user_id: int, request: Request):
    key = f"user:{user_id}" if user_id else f"ip:{get_client_ip(request)}"
    room_limiter.check(key)

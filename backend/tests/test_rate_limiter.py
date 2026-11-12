import time
from concurrent.futures import ThreadPoolExecutor
from fastapi import HTTPException
from fastapi.testclient import TestClient
import pytest
from app.auth import create_access_token
from app.main import app
from app.rate_limiter import InMemoryRateLimiter, ai_limiter, get_client_ip, login_limiter, register_limiter

client = TestClient(app)


def test_rate_limiter_unit_below_and_exceeding_limit():
    """Verify in-memory rate limiter allows requests under limit and returns 429 when exceeded."""
    limiter = InMemoryRateLimiter(requests_limit=3, window_seconds=2, name="TestLimiter")

    # 1. Requests below limit should pass
    limiter.check("client_1")
    limiter.check("client_1")
    limiter.check("client_1")

    # 2. 4th request exceeds limit
    with pytest.raises(HTTPException) as exc_info:
        limiter.check("client_1")

    assert exc_info.value.status_code == 429
    assert "Rate limit exceeded" in exc_info.value.detail
    assert "Retry-After" in exc_info.value.headers

    # 3. Different client should NOT be blocked
    limiter.check("client_2")

    # 4. Wait for window to expire and verify reset
    time.sleep(2.1)
    limiter.check("client_1")  # Should succeed after reset


def test_rate_limiter_concurrent_thread_safety():
    """Verify thread-safe sliding window under concurrent multi-threaded requests."""
    limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=5, name="ConcurrentLimiter")

    successful_hits = 0
    blocked_hits = 0

    def make_hit():
        nonlocal successful_hits, blocked_hits
        try:
            limiter.check("concurrent_client")
            successful_hits += 1
        except HTTPException as e:
            if e.status_code == 429:
                blocked_hits += 1

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(make_hit) for _ in range(25)]
        for f in futures:
            f.result()

    assert successful_hits == 10
    assert blocked_hits == 15


def test_rate_limiter_stale_key_cleanup():
    """Verify automatic cleanup of stale keys so memory does not leak."""
    limiter = InMemoryRateLimiter(requests_limit=2, window_seconds=1, name="CleanupLimiter")
    limiter.check("stale_client_a")
    limiter.check("stale_client_b")
    assert len(limiter.hits) == 2

    time.sleep(1.2)
    # Trigger cleanup
    limiter._last_cleanup = 0  # Force cleanup trigger on next check
    limiter.check("new_client")
    assert "stale_client_a" not in limiter.hits
    assert "stale_client_b" not in limiter.hits
    assert "new_client" in limiter.hits


def test_api_login_rate_limiting_integration():
    """Verify that hammering /api/auth/login triggers HTTP 429."""
    # Reset login limiter for test isolation
    login_limiter.reset()

    # Trigger requests up to limit
    for _ in range(login_limiter.requests_limit):
        res = client.post("/api/auth/login", json={"username": "random_test_user", "password": "WrongPassword"})
        assert res.status_code == 401

    # Next request must be blocked by rate limiter with 429
    res_blocked = client.post("/api/auth/login", json={"username": "random_test_user", "password": "WrongPassword"})
    assert res_blocked.status_code == 429
    assert "Retry-After" in res_blocked.headers

    # Reset limiter after test so subsequent tests are unaffected
    login_limiter.reset()


def test_api_ai_tutor_rate_limiting_integration():
    """Verify that /api/ai/tutor enforces rate limits per user/client."""
    ai_limiter.reset()

    # Register an actual user to obtain valid JWT
    import uuid
    u_id = uuid.uuid4().hex[:6]
    reg_res = client.post("/api/auth/register", json={
        "username": f"ai_limit_{u_id}",
        "email": f"ai_limit_{u_id}@example.com",
        "password": "Password123!",
        "full_name": "AI Limit Tester"
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "message": "What is Article 21?",
        "subject": "Indian Polity",
        "target_exam": "Group 4"
    }

    # Request up to limit
    for _ in range(ai_limiter.requests_limit):
        res = client.post("/api/ai/tutor", json=payload, headers=headers)
        assert res.status_code == 200

    # Next request must return 429
    res_blocked = client.post("/api/ai/tutor", json=payload, headers=headers)
    assert res_blocked.status_code == 429
    assert "Retry-After" in res_blocked.headers

    # Reset limiter after test
    ai_limiter.reset()


def test_client_ip_spoofing_protection():
    """Verify that unverified X-Forwarded-For headers are not trusted unless configured."""
    from unittest.mock import MagicMock
    req = MagicMock()
    req.headers = {"x-forwarded-for": "10.99.99.99, 1.2.3.4"}
    req.client.host = "192.168.1.100"

    # TRUST_PROXY_HEADERS defaults to False in dev
    ip = get_client_ip(req)
    assert ip == "192.168.1.100", f"Expected untrusted proxy to fallback to client.host, got {ip}"

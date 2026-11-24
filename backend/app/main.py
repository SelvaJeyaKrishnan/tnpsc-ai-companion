import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger, setup_logging
from app.database import Base, SessionLocal, engine
from app import exam_models
from app.routers import ai, analytics, auth, exams, goals, mock_tests, notifications, official_resources, recommendations, rooms, scheduler, sessions, streaks, study_materials
from app.seed_data import init_seed_data

# Initialize structured logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting TNPSC AI Companion API in {settings.app_env} mode")
    # Verify database connection and schema readiness safely without running DDL
    try:
        with engine.connect() as conn:
            from sqlalchemy import inspect
            inspector = inspect(conn)
            tables = inspector.get_table_names()
            if not tables:
                msg = (
                    "CRITICAL DATABASE WARNING: No tables found in target database. "
                    "Run 'alembic upgrade head' to apply the required schema migrations."
                )
                logger.warning(msg)
                if settings.is_production:
                    logger.error("Production startup detected uninitialized database schema!")
            else:
                logger.info(f"Database schema verified ({len(tables)} tables present).")

        # Controlled development seeding only if explicitly requested (NEVER in production)
        if not settings.is_production and settings.seed_dev_data:
            logger.info("SEED_DEV_DATA=true detected; seeding development records...")
            with SessionLocal() as db_session:
                init_seed_data(db_session)
    except Exception as e:
        logger.error(f"Database readiness verification encountered an error: {e}")

    yield
    logger.info("Shutting down TNPSC AI Companion API")


tags_metadata = [
    {
        "name": "auth",
        "description": "Authentication and aspirant account management (Registration, Login, Current User Profile).",
    },
    {
        "name": "study-sessions",
        "description": "Tracking focus sessions, stopwatch timing, and Pomodoro cycle logs.",
    },
    {
        "name": "streaks",
        "description": "Daily study streak tracking, milestone badges, and achievement unlocks.",
    },
    {
        "name": "analytics",
        "description": "Aggregated productivity analytics, daily/weekly charts, and subject distribution.",
    },
    {
        "name": "mock-tests",
        "description": "Real exam simulation engine, question palette navigation, autosave, and scorecards.",
    },
    {
        "name": "ai-tutor",
        "description": "Syllabus-grounded AI mentor with Samacheer Kalvi citations and doubt resolution.",
    },
    {
        "name": "study-planner",
        "description": "Automated exam schedule generation, syllabus tracking, and daily task management.",
    },
    {
        "name": "official-resources",
        "description": "Exam-wise official TNPSC learning resource library, verified scheme, syllabus, PYQs, and keys.",
    },
    {
        "name": "group-study-rooms",
        "description": "Virtual study rooms, live participant status, and peer focus collaboration.",
    },
    {
        "name": "system",
        "description": "Application health checks and environment status.",
    },
]

app = FastAPI(
    title="TNPSC AI Companion API",
    description="Production-grade RESTful API for the TNPSC AI Study Companion platform.",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=tags_metadata,
)

# Register standardized global error handlers
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.loca\.lt",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_and_tracing_middleware(request: Request, call_next):
    # Extract or generate correlation request ID
    request_id = request.headers.get("X-Request-ID") or f"req_{uuid.uuid4().hex[:12]}"
    request.state.request_id = request_id

    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000

    # Inject tracing headers
    response.headers["X-Request-ID"] = request_id

    # Log request lifecycle (safe: excludes query secrets and passwords)
    if not request.url.path.startswith("/health"):
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} "
            f"-> status={response.status_code} duration={duration_ms:.2f}ms"
        )
    return response


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    return response


# Mount productivity, auth and platform routers
app.include_router(auth.router)
app.include_router(auth.user_router)
app.include_router(sessions.router)
app.include_router(streaks.router)
app.include_router(analytics.router)
app.include_router(rooms.router)
app.include_router(scheduler.router)
app.include_router(ai.router)
app.include_router(mock_tests.router)
app.include_router(goals.router)
app.include_router(recommendations.router)
app.include_router(study_materials.router)
app.include_router(official_resources.router)
app.include_router(notifications.router)
app.include_router(exams.router)


@app.get("/", tags=["system"])
async def root():
    return {
        "name": "TNPSC AI Companion API",
        "version": "0.2.0",
        "status": "running",
    }


@app.get("/health", tags=["system"])
async def health():
    db_status = "connected"
    try:
        db = SessionLocal()
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        logger.error(f"Health check database ping failed: {str(e)}")
        db_status = "unavailable"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "environment": settings.app_env,
        "database": db_status,
        "version": "1.0.0"
    }

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict
from app.database import Base, SessionLocal, engine
from app.routers import ai, analytics, auth, rooms, scheduler, sessions, streaks
from app.seed_data import init_seed_data


class Settings(BaseSettings):
    app_env: str = "development"
    cors_origins: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()


# Ensure tables and seed data are initialized
Base.metadata.create_all(bind=engine)
db_init = SessionLocal()
try:
    init_seed_data(db_init)
finally:
    db_init.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="TNPSC AI Companion API",
    description="Backend API for the TNPSC AI learning platform and productivity suite.",
    version="0.2.0",
    lifespan=lifespan
)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.loca\.lt",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
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


@app.get("/", tags=["system"])
async def root():
    return {
        "name": "TNPSC AI Companion API",
        "version": "0.2.0",
        "status": "running",
    }


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "environment": settings.app_env}

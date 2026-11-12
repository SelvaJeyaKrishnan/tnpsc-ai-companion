import os
import uuid
from datetime import timedelta
import pytest
from fastapi.testclient import TestClient
from app.auth import create_access_token
from app.main import app

client = TestClient(app)


def test_production_auth_strictness_without_token(monkeypatch):
    """Verify that in production (APP_ENV=production), requests without a token receive 401."""
    monkeypatch.setenv("APP_ENV", "production")

    endpoints = [
        ("GET", "/api/auth/me"),
        ("GET", "/api/user"),
        ("GET", "/api/sessions"),
        ("GET", "/api/sessions/recent"),
        ("POST", "/api/sessions"),
        ("GET", "/api/streaks"),
        ("GET", "/api/streaks/achievements"),
        ("GET", "/api/analytics"),
        ("GET", "/api/scheduler/plan"),
        ("POST", "/api/scheduler/generate"),
        ("POST", "/api/scheduler/rebalance"),
        ("POST", "/api/rooms"),
    ]

    for method, path in endpoints:
        if method == "GET":
            res = client.get(path)
        else:
            res = client.post(path, json={})
        assert res.status_code == 401, f"Expected 401 for unauthenticated {method} {path} in production, got {res.status_code}"


def test_invalid_token_rejected_with_401():
    """Verify that malformed or tampered tokens return 401."""
    headers = {"Authorization": "Bearer not-a-valid-jwt-token"}
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 401
    assert "detail" in res.json()


def test_expired_token_rejected_with_401():
    """Verify that expired tokens return 401."""
    expired_token = create_access_token(
        user_id=1,
        username="test_expired",
        expires_delta=timedelta(seconds=-60)
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 401
    assert "expired" in res.json().get("detail", "").lower()


def test_user_data_isolation_and_cross_user_protection():
    """Verify that User A cannot see or mutate User B's sessions, tasks or plans."""
    suffix_a = uuid.uuid4().hex[:6]
    suffix_b = uuid.uuid4().hex[:6]

    # Register User A
    reg_a = client.post("/api/auth/register", json={
        "username": f"alice_{suffix_a}",
        "email": f"alice_{suffix_a}@example.com",
        "password": "Password123!",
        "full_name": "Alice Aspirant",
        "target_exam": "Group 4"
    })
    assert reg_a.status_code == 200
    token_a = reg_a.json()["access_token"]
    user_a_id = reg_a.json()["user"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register User B
    reg_b = client.post("/api/auth/register", json={
        "username": f"bob_{suffix_b}",
        "email": f"bob_{suffix_b}@example.com",
        "password": "Password456!",
        "full_name": "Bob Aspirant",
        "target_exam": "Group 2"
    })
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]
    user_b_id = reg_b.json()["user"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A creates a study session
    sess_payload = {
        "session_type": "countdown",
        "subject": "General Tamil (பொதுத்தமிழ்)",
        "topic": "பகுதி-அ: இலக்கணம்",
        "duration_seconds": 1800,
        "started_at": "2026-11-12T10:00:00Z",
        "ended_at": "2026-11-12T10:30:00Z",
        "completed": True
    }
    create_sess = client.post("/api/sessions", json=sess_payload, headers=headers_a)
    assert create_sess.status_code == 200
    sess_id = create_sess.json()["id"]

    # Verify User A sees this session
    sessions_a = client.get("/api/sessions", headers=headers_a).json()
    assert any(s["id"] == sess_id for s in sessions_a)

    # Verify User B does NOT see User A's session
    sessions_b = client.get("/api/sessions", headers=headers_b).json()
    assert not any(s["id"] == sess_id for s in sessions_b)

    # User A has their own study plan
    plan_a = client.get("/api/scheduler/plan", headers=headers_a).json()
    assert len(plan_a["tasks"]) > 0
    task_a_id = plan_a["tasks"][0]["id"]

    # User B attempts to complete User A's task -> must receive 404
    cross_patch = client.patch(f"/api/scheduler/tasks/{task_a_id}", json={"status": "completed"}, headers=headers_b)
    assert cross_patch.status_code == 404


def test_public_endpoints_accessible_without_token():
    """Verify that public resources (health, syllabus, active rooms list, AI tutor) remain accessible."""
    # Health check
    assert client.get("/health").status_code == 200

    # Syllabus
    syl = client.get("/api/scheduler/syllabus?exam=Group 4")
    assert syl.status_code == 200
    assert syl.json()["exam"] == "Group 4"

    # Active public rooms
    rooms = client.get("/api/rooms")
    assert rooms.status_code == 200

    # Public AI tutor doubt assistance
    ai_res = client.post("/api/ai/tutor", json={
        "message": "What is the capital of Tamil Nadu and state animal?",
        "subject": "General Studies"
    })
    assert ai_res.status_code == 200
    assert len(ai_res.json()["reply"]) > 10


def test_default_demo_account_disabled_in_production(monkeypatch):
    """Verify that in production (APP_ENV=production), login with the default karthik account is blocked with 403."""
    monkeypatch.setenv("APP_ENV", "production")

    # Attempt login with karthik username
    res_user = client.post("/api/auth/login", json={
        "username": "karthik",
        "password": "AnyPasswordOrOriginal123"
    })
    assert res_user.status_code == 403
    assert "disabled in production" in res_user.json()["detail"]

    # Attempt login with karthik email
    res_email = client.post("/api/auth/login", json={
        "username": "karthik.tnpsc@example.com",
        "password": "AnyPasswordOrOriginal123"
    })
    assert res_email.status_code == 403
    assert "disabled in production" in res_email.json()["detail"]

    # Normal user registration and login continue to work in production
    unique_suffix = uuid.uuid4().hex[:6]
    test_user = f"real_aspirant_{unique_suffix}"
    test_pwd = "StrongPassword789!"
    reg_res = client.post("/api/auth/register", json={
        "username": test_user,
        "email": f"{test_user}@example.com",
        "password": test_pwd,
        "full_name": "Real Aspirant",
        "target_exam": "Group 4"
    })
    assert reg_res.status_code == 200

    login_res = client.post("/api/auth/login", json={
        "username": test_user,
        "password": test_pwd
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()


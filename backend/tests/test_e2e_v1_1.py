import time
import uuid
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from app.auth import create_access_token
from app.database import SessionLocal
from app.main import app
from app.models import StudyPlan, StudySession, StudyTask, User
from app.services.streak_service import get_user_local_date

client = TestClient(app)


def test_auth_and_user_isolation():
    """Verify registration, login, token handling, protected endpoint rejections, and user data isolation."""
    # 1. Access protected endpoint WITHOUT authentication
    res_unauth = client.get("/api/auth/me")
    assert res_unauth.status_code == 401, f"Expected 401 for unauthenticated request, got {res_unauth.status_code}"

    # 2. Access with invalid / malformed token
    res_bad_token = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.payload"})
    assert res_bad_token.status_code == 401

    # 3. Access with expired token
    expired_token = create_access_token(user_id=9999, username="expired_user", expires_delta=timedelta(seconds=-10))
    res_expired = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res_expired.status_code == 401

    # 4. Create two independent test accounts: User A and User B
    suffix_a = uuid.uuid4().hex[:6]
    suffix_b = uuid.uuid4().hex[:6]

    user_a_payload = {
        "username": f"user_a_{suffix_a}",
        "email": f"usera_{suffix_a}@example.com",
        "password": "PasswordA123!",
        "full_name": "Aspirant Alpha",
        "target_exam": "Group 4"
    }
    user_b_payload = {
        "username": f"user_b_{suffix_b}",
        "email": f"userb_{suffix_b}@example.com",
        "password": "PasswordB456!",
        "full_name": "Aspirant Beta",
        "target_exam": "Group 2"
    }

    # Register User A
    reg_a = client.post("/api/auth/register", json=user_a_payload)
    assert reg_a.status_code == 200
    token_a = reg_a.json()["access_token"]
    user_a_id = reg_a.json()["user"]["id"]

    # Register User B
    reg_b = client.post("/api/auth/register", json=user_b_payload)
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]
    user_b_id = reg_b.json()["user"]["id"]

    # Duplicate registration rejection
    dup_res = client.post("/api/auth/register", json=user_a_payload)
    assert dup_res.status_code == 400

    # Login with valid and invalid credentials
    login_ok = client.post("/api/auth/login", json={"username": user_a_payload["username"], "password": "PasswordA123!"})
    assert login_ok.status_code == 200
    login_bad = client.post("/api/auth/login", json={"username": user_a_payload["username"], "password": "WrongPassword"})
    assert login_bad.status_code == 401

    # Profile retrieval
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    me_a = client.get("/api/auth/me", headers=headers_a)
    assert me_a.status_code == 200
    assert me_a.json()["id"] == user_a_id

    me_b = client.get("/api/auth/me", headers=headers_b)
    assert me_b.status_code == 200
    assert me_b.json()["id"] == user_b_id

    # 5. Study Session Creation & Data Isolation
    now = datetime.now(timezone.utc)
    session_a_payload = {
        "session_type": "countdown",
        "subject": "General Tamil (பொதுத்தமிழ்)",
        "topic": "பகுதி-அ: இலக்கணம்",
        "duration_seconds": 1500,
        "started_at": (now - timedelta(minutes=25)).isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "notes": "User A unique session note"
    }
    client.post("/api/sessions", json=session_a_payload, headers=headers_a)

    session_b_payload = {
        "session_type": "pomodoro",
        "subject": "Indian Polity & Constitution",
        "topic": "Fundamental Rights Articles 12-35",
        "duration_seconds": 3000,
        "started_at": (now - timedelta(minutes=50)).isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "pomodoro_cycles": 2,
        "notes": "User B unique session note"
    }
    client.post("/api/sessions", json=session_b_payload, headers=headers_b)

    # Verify User A cannot see User B's sessions
    sessions_a = client.get("/api/sessions", headers=headers_a).json()
    assert all("User B unique session note" not in (s.get("notes") or "") for s in sessions_a)
    assert any("User A unique session note" in (s.get("notes") or "") for s in sessions_a)

    # Verify User B cannot see User A's sessions
    sessions_b = client.get("/api/sessions", headers=headers_b).json()
    assert all("User A unique session note" not in (s.get("notes") or "") for s in sessions_b)
    assert any("User B unique session note" in (s.get("notes") or "") for s in sessions_b)

    # 6. Study Planner Task Isolation
    plan_a = client.get("/api/scheduler/plan", headers=headers_a).json()
    task_a_id = plan_a["tasks"][0]["id"]

    # User B tries to update User A's task -> must be rejected with 404
    hack_res = client.patch(f"/api/scheduler/tasks/{task_a_id}", json={"status": "completed"}, headers=headers_b)
    assert hack_res.status_code == 404

    # User A updates own task -> success
    own_res = client.patch(f"/api/scheduler/tasks/{task_a_id}", json={"status": "completed"}, headers=headers_a)
    assert own_res.status_code == 200
    assert own_res.json()["status"] == "completed"

    # 7. Private Study Room Access Control
    room_payload = {
        "name": "Secret Group 1 Strategy Room",
        "description": "Invite only for mock tests",
        "is_private": True,
        "pass_code": "SecretPass123",
        "duration_minutes": 60
    }
    created_room = client.post("/api/rooms", json=room_payload, headers=headers_a).json()
    room_code = created_room["room_code"]

    # User B tries to get details of User A's private room without passcode -> 403 Forbidden
    unauth_room = client.get(f"/api/rooms/{room_code}", headers=headers_b)
    assert unauth_room.status_code == 403

    # User B tries to join with wrong passcode -> 400 Bad Request
    bad_join = client.post(f"/api/rooms/{room_code}/join", json={"pass_code": "WrongPass"}, headers=headers_b)
    assert bad_join.status_code == 400

    # User B joins with correct passcode -> 200 OK
    good_join = client.post(f"/api/rooms/{room_code}/join", json={"pass_code": "SecretPass123"}, headers=headers_b)
    assert good_join.status_code == 200
    assert good_join.json()["participants_count"] == 2

    # Now User B is an authorized member and can read room details
    auth_room = client.get(f"/api/rooms/{room_code}", headers=headers_b)
    assert auth_room.status_code == 200


def test_ai_tutor_capabilities():
    """Verify AI Tutor endpoint handles English, Tamil, Aptitude, validation, and model attribution."""
    # 1. Empty message should be rejected
    empty_res = client.post("/api/ai/tutor", json={"message": "   ", "subject": "Indian Polity"})
    assert empty_res.status_code in [400, 422]

    # 2. English Polity question
    polity_res = client.post("/api/ai/tutor", json={
        "message": "Explain Article 32 Writs under the Indian Constitution for TNPSC",
        "subject": "Indian Polity",
        "target_exam": "Group 4"
    })
    assert polity_res.status_code == 200
    p_data = polity_res.json()
    assert "reply" in p_data
    assert "Habeas Corpus" in p_data["reply"] or "writs" in p_data["reply"].lower()
    assert len(p_data["sources"]) > 0
    assert p_data["model"] in ["gemini-1.5-flash", "tnpsc-grounded-curriculum-engine-v1"]

    # 3. Tamil literature question
    tamil_res = client.post("/api/ai/tutor", json={
        "message": "திருக்குறள் அன்புடைமை அதிகாரம் முக்கியத்துவம் என்ன?",
        "subject": "General Tamil",
        "target_exam": "Group 4"
    })
    assert tamil_res.status_code == 200
    t_data = tamil_res.json()
    assert "திருக்குறள்" in t_data["reply"] or "இலக்கியம்" in t_data["reply"]

    # 4. Aptitude question
    apt_res = client.post("/api/ai/tutor", json={
        "message": "What is the formula for the difference between CI and SI for 2 years in TNPSC Aptitude?",
        "subject": "Aptitude & Mental Ability",
        "target_exam": "Group 4"
    })
    assert apt_res.status_code == 200
    a_data = apt_res.json()
    assert "SI" in a_data["reply"] or "Interest" in a_data["reply"]


def test_syllabi_across_all_groups():
    """Verify syllabus retrieval across Group 1, Group 2, Group 2A, and Group 4."""
    for exam in ["Group 1", "Group 2", "Group 2A", "Group 4"]:
        res = client.get(f"/api/scheduler/syllabus?exam={exam}")
        assert res.status_code == 200
        syl = res.json()
        assert syl["exam"] == exam
        assert len(syl["subjects"]) >= 3
        # Verify topics and subtopics exist
        for subj in syl["subjects"]:
            assert "name" in subj
            assert len(subj["topics"]) > 0
            for t in subj["topics"]:
                assert "name" in t
                assert len(t["subtopics"]) > 0


def test_timezone_and_anti_duplicate_streak():
    """Verify Asia/Kolkata timezone awareness and session counting."""
    suffix = uuid.uuid4().hex[:6]
    user_payload = {
        "username": f"streak_user_{suffix}",
        "email": f"streak_{suffix}@example.com",
        "password": "Password123!",
        "full_name": "Streak Tester",
        "target_exam": "Group 4",
        "timezone": "Asia/Kolkata",
        "daily_goal_minutes": 60
    }
    reg = client.post("/api/auth/register", json=user_payload).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Log 3 separate 20-minute sessions on the same local date
    now = datetime.now(timezone.utc)
    for i in range(3):
        sess = {
            "session_type": "countdown",
            "subject": "General Tamil (பொதுத்தமிழ்)",
            "topic": "இலக்கணம்",
            "duration_seconds": 1200,
            "started_at": (now - timedelta(minutes=60 - i * 20)).isoformat(),
            "ended_at": (now - timedelta(minutes=40 - i * 20)).isoformat(),
            "completed": True
        }
        client.post("/api/sessions", json=sess, headers=headers)

    streak_res = client.get("/api/streaks", headers=headers).json()
    assert streak_res["total_sessions"] == 3
    assert streak_res["total_seconds"] == 3600
    assert streak_res["today_seconds"] == 3600
    assert streak_res["goal_completed"] is True  # 3600s = 60 mins meets 60m goal

    # First session badge unlocked
    ach_res = client.get("/api/streaks/achievements", headers=headers).json()
    first_badge = next((a for a in ach_res if a["badge_key"] == "first_session"), None)
    assert first_badge is not None
    assert first_badge["unlocked"] is True


def test_group_study_websocket():
    """Verify study room WebSocket authorization and messaging."""
    suffix = uuid.uuid4().hex[:6]
    creator = client.post("/api/auth/register", json={
        "username": f"creator_{suffix}",
        "email": f"creator_{suffix}@example.com",
        "password": "Password123!",
        "full_name": "Room Creator"
    }).json()
    token = creator["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create public room
    room = client.post("/api/rooms", json={
        "name": "Public Hall",
        "is_private": False,
        "duration_minutes": 45
    }, headers=headers).json()
    room_code = room["room_code"]

    # Connect WebSocket
    with client.websocket_connect(f"/api/rooms/{room_code}/ws") as websocket:
        init_data = websocket.receive_json()
        assert init_data["type"] == "ROOM_STATE"
        assert init_data["payload"]["room_code"] == room_code

        # Send status update
        websocket.send_json({
            "action": "UPDATE_STATUS",
            "user_id": creator["user"]["id"],
            "is_focusing": False,
            "subject": "General Tamil",
            "topic": "இலக்கியம்"
        })
        update_data = websocket.receive_json()
        assert update_data["type"] == "ROOM_STATE"

    # Create private room
    priv_room = client.post("/api/rooms", json={
        "name": "Secure Vault",
        "is_private": True,
        "pass_code": "VaultPass1",
        "duration_minutes": 30
    }, headers=headers).json()
    priv_code = priv_room["room_code"]

    # Unauthorized WebSocket to private room without token or pass_code should be closed with code 4003
    with pytest.raises(Exception):
        with client.websocket_connect(f"/api/rooms/{priv_code}/ws") as bad_ws:
            bad_ws.receive_json()

    # Authorized WebSocket with token should succeed
    with client.websocket_connect(f"/api/rooms/{priv_code}/ws?token={token}") as good_ws:
        priv_state = good_ws.receive_json()
        assert priv_state["type"] == "ROOM_STATE"

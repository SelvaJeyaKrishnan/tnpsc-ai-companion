import uuid
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_user_profile():
    res = client.get("/api/user")
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "karthik"
    assert "target_exam" in data

    # Update profile
    update_res = client.put("/api/user", json={"target_exam": "Group 2", "daily_goal_minutes": 150})
    assert update_res.status_code == 200
    assert update_res.json()["target_exam"] == "Group 2"
    assert update_res.json()["daily_goal_minutes"] == 150


def test_auth_registration_login_and_me():
    unique_suffix = uuid.uuid4().hex[:6]
    test_username = f"aspirant_{unique_suffix}"
    test_email = f"aspirant_{unique_suffix}@example.com"
    test_password = "SecurePassword123!"

    # 1. Register new user
    register_payload = {
        "username": test_username,
        "email": test_email,
        "password": test_password,
        "full_name": "Test Aspirant",
        "target_exam": "Group 4"
    }
    reg_res = client.post("/api/auth/register", json=register_payload)
    assert reg_res.status_code == 200
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["username"] == test_username
    token = reg_data["access_token"]

    # 2. Duplicate registration should be rejected
    dup_res = client.post("/api/auth/register", json=register_payload)
    assert dup_res.status_code == 400

    # 3. Login with correct credentials
    login_res = client.post("/api/auth/login", json={
        "username": test_username,
        "password": test_password
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data

    # 4. Login with incorrect password should be rejected
    bad_login = client.post("/api/auth/login", json={
        "username": test_username,
        "password": "WrongPassword!"
    })
    assert bad_login.status_code == 401

    # 5. Fetch /api/auth/me with Bearer token
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["username"] == test_username
    assert me_res.json()["email"] == test_email


def test_create_and_fetch_study_sessions():
    now = datetime.now(timezone.utc)
    started = now - timedelta(minutes=25)

    payload = {
        "session_type": "countdown",
        "subject": "General Tamil (பொதுத்தமிழ்)",
        "topic": "பகுதி-அ: இலக்கணம்",
        "duration_seconds": 1500,
        "started_at": started.isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "notes": "Completed sandhi rules review."
    }

    res = client.post("/api/sessions", json=payload)
    assert res.status_code == 200
    session_data = res.json()
    assert session_data["subject"] == "General Tamil (பொதுத்தமிழ்)"
    assert session_data["duration_seconds"] == 1500

    # Test recent sessions
    recent_res = client.get("/api/sessions/recent")
    assert recent_res.status_code == 200
    assert len(recent_res.json()) >= 1


def test_pomodoro_session_tracking():
    now = datetime.now(timezone.utc)
    started = now - timedelta(minutes=50)

    payload = {
        "session_type": "pomodoro",
        "subject": "Indian Polity & Constitution",
        "topic": "Fundamental Rights Articles 12-35",
        "duration_seconds": 3000,
        "started_at": started.isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "pomodoro_cycles": 2,
        "focus_minutes": 25,
        "short_break_minutes": 5,
        "long_break_minutes": 15
    }

    res = client.post("/api/sessions", json=payload)
    assert res.status_code == 200
    assert res.json()["session_type"] == "pomodoro"


def test_streaks_and_achievements():
    streak_res = client.get("/api/streaks")
    assert streak_res.status_code == 200
    streak_data = streak_res.json()
    assert "current_streak" in streak_data
    assert "today_seconds" in streak_data
    assert "weekly_consistency" in streak_data
    assert len(streak_data["weekly_consistency"]) == 7

    ach_res = client.get("/api/streaks/achievements")
    assert ach_res.status_code == 200
    ach_data = ach_res.json()
    assert len(ach_data) >= 5
    # First session badge should be unlocked now
    first_badge = next((a for a in ach_data if a["badge_key"] == "first_session"), None)
    assert first_badge is not None
    assert first_badge["unlocked"] is True


def test_analytics_endpoints():
    for p in ["today", "week", "month", "all"]:
        res = client.get(f"/api/analytics?period={p}")
        assert res.status_code == 200
        data = res.json()
        assert "total_study_seconds" in data
        assert "total_study_hours" in data
        assert "subject_distribution" in data
        assert "most_productive_hours" in data
        assert "weekly_trend" in data
        assert len(data["most_productive_hours"]) == 24


def test_study_rooms():
    # Create room
    create_payload = {
        "name": "TNPSC Group 4 Morning Revision",
        "description": "Silent focus session for General Tamil & Polity",
        "is_private": False,
        "duration_minutes": 60
    }
    create_res = client.post("/api/rooms", json=create_payload)
    assert create_res.status_code == 200
    room_data = create_res.json()
    room_code = room_data["room_code"]
    assert len(room_code) >= 6

    # List rooms
    list_res = client.get("/api/rooms")
    assert list_res.status_code == 200
    assert any(r["room_code"] == room_code for r in list_res.json())

    # Get room details
    detail_res = client.get(f"/api/rooms/{room_code}")
    assert detail_res.status_code == 200
    assert detail_res.json()["name"] == "TNPSC Group 4 Morning Revision"
    assert detail_res.json()["remaining_seconds"] > 0

    # Join room
    join_res = client.post(f"/api/rooms/{room_code}/join", json={
        "subject": "Aptitude & Mental Ability",
        "topic": "Simplification & HCF"
    })
    assert join_res.status_code == 200
    assert join_res.json()["participants_count"] >= 1


def test_study_planner_and_syllabus():
    # Fetch syllabus
    syl_res = client.get("/api/scheduler/syllabus?exam=Group 4")
    assert syl_res.status_code == 200
    syl = syl_res.json()
    assert syl["exam"] == "Group 4"
    assert len(syl["subjects"]) >= 5

    # Get current plan
    plan_res = client.get("/api/scheduler/plan")
    assert plan_res.status_code == 200
    plan = plan_res.json()
    assert "tasks" in plan
    assert len(plan["tasks"]) > 0

    # Update task
    first_task = plan["tasks"][0]
    task_id = first_task["id"]
    patch_res = client.patch(f"/api/scheduler/tasks/{task_id}", json={"status": "completed"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "completed"

    # Test auto rebalance
    rebalance_res = client.post("/api/scheduler/rebalance")
    assert rebalance_res.status_code == 200
    assert "reassigned_count" in rebalance_res.json()


def test_ai_tutor_endpoint():
    # English query
    tutor_payload = {
        "message": "What are the Fundamental Rights in Indian Polity articles 12 to 35?",
        "subject": "Indian Polity",
        "target_exam": "Group 4"
    }
    res = client.post("/api/ai/tutor", json=tutor_payload)
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 20
    assert "sources" in data
    assert len(data["sources"]) > 0
    assert "suggested_topics" in data
    assert "model" in data

    # Tamil query
    tamil_payload = {
        "message": "பொதுத்தமிழில் திருக்குறள் பற்றி குறிப்பு தருக",
        "subject": "General Tamil",
        "target_exam": "Group 4"
    }
    t_res = client.post("/api/ai/tutor", json=tamil_payload)
    assert t_res.status_code == 200
    t_data = t_res.json()
    assert "reply" in t_data
    assert len(t_data["reply"]) > 20

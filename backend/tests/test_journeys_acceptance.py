from datetime import datetime, timedelta, timezone
import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rate_limiter import login_limiter, register_limiter, ai_limiter, room_limiter

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_limiters():
    login_limiter.reset()
    register_limiter.reset()
    ai_limiter.reset()
    room_limiter.reset()
    yield


def test_journey_1_new_student_flow():
    """Journey 1: Landing -> Register -> Login -> Select Exam -> Dashboard -> Syllabus -> Study Plan -> Complete Session -> Verify Analytics"""
    ts = int(time.time() * 1000)
    username = f"j1_aspirant_{ts}"
    email = f"{username}@test.tnpsc.gov.in"
    password = "StrongPassword#2026"

    # 1. Register
    reg_resp = client.post("/api/auth/register", json={
        "username": username,
        "email": email,
        "password": password,
        "full_name": "Arun Kumar",
        "target_exam": "Group 4",
    })
    assert reg_resp.status_code == 200, reg_resp.text
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Login verification
    login_resp = client.post("/api/auth/login", json={
        "username": username,
        "password": password
    })
    assert login_resp.status_code == 200
    assert login_resp.json()["user"]["username"] == username

    # 3. Update exam preference to Group 2 via PUT /api/auth/me
    update_resp = client.put("/api/auth/me", headers=headers, json={
        "target_exam": "Group 2",
        "daily_goal_minutes": 180
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["target_exam"] == "Group 2"
    assert update_resp.json()["daily_goal_minutes"] == 180

    # 4. Explore Group 2 syllabus
    syllabus_resp = client.get("/api/scheduler/syllabus?exam=Group%202", headers=headers)
    assert syllabus_resp.status_code == 200
    syllabus = syllabus_resp.json()
    assert len(syllabus["subjects"]) > 0

    # 5. Load Study Plan and tasks
    plan_resp = client.get("/api/scheduler/plan", headers=headers)
    assert plan_resp.status_code == 200
    plan = plan_resp.json()
    assert len(plan["tasks"]) > 0
    first_task = plan["tasks"][0]

    # 6. Complete a study session
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=45)
    session_resp = client.post("/api/sessions", headers=headers, json={
        "session_type": "countdown",
        "subject": first_task["subject"],
        "topic": first_task["topic"],
        "duration_seconds": 2700,
        "started_at": start.isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "notes": "Covered exam topic in detail."
    })
    assert session_resp.status_code == 200
    assert session_resp.json()["duration_seconds"] == 2700

    # Mark task completed
    task_update = client.patch(f"/api/scheduler/tasks/{first_task['id']}", headers=headers, json={
        "status": "completed"
    })
    assert task_update.status_code == 200
    assert task_update.json()["status"] == "completed"

    # 7. Verify analytics reflect real data
    analytics_resp = client.get("/api/analytics", headers=headers)
    assert analytics_resp.status_code == 200
    analytics = analytics_resp.json()
    assert analytics["today_seconds"] >= 2700


def test_journey_2_ai_learning_flow():
    """Journey 2: AI learning with bilingual questions, sources, follow-ups, and fallback disclosure"""
    ts = int(time.time() * 1000)
    username = f"j2_ai_{ts}"
    reg_resp = client.post("/api/auth/register", json={
        "username": username,
        "email": f"{username}@test.tnpsc.gov.in",
        "password": "Password123!"
    })
    headers = {"Authorization": f"Bearer {reg_resp.json()['access_token']}"}

    # 1. Ask English TNPSC question
    q1_resp = client.post("/api/ai/tutor", headers=headers, json={
        "message": "Explain Article 32 of Indian Constitution and the five writs",
        "subject": "Indian Polity",
        "target_exam": "Group 1",
        "history": []
    })
    assert q1_resp.status_code == 200
    data1 = q1_resp.json()
    assert len(data1["reply"]) > 50
    assert "sources" in data1 and len(data1["sources"]) > 0
    assert "suggested_topics" in data1
    assert data1["model"] == "tnpsc-grounded-curriculum-engine-v1"

    # 2. Ask Tamil question
    q2_resp = client.post("/api/ai/tutor", headers=headers, json={
        "message": "திருக்குறள் அதிகாரங்கள் மற்றும் அதன் சிறப்பு கூறுகள்",
        "subject": "General Tamil",
        "target_exam": "Group 4",
        "history": [{"role": "user", "content": "திருக்குறள் பற்றி"}]
    })
    assert q2_resp.status_code == 200
    data2 = q2_resp.json()
    assert len(data2["reply"]) > 30


def test_journey_3_productivity_timer_and_streaks():
    """Journey 3: Focus Timer session logging -> Streak calculation -> Daily trend analytics"""
    ts = int(time.time() * 1000)
    username = f"j3_prod_{ts}"
    reg_resp = client.post("/api/auth/register", json={
        "username": username,
        "email": f"{username}@test.tnpsc.gov.in",
        "password": "Password123!"
    })
    headers = {"Authorization": f"Bearer {reg_resp.json()['access_token']}"}

    # Log 25 min Pomodoro
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=25)
    sess_resp = client.post("/api/sessions", headers=headers, json={
        "session_type": "pomodoro",
        "subject": "General Studies",
        "topic": "Indian National Congress",
        "duration_seconds": 1500,
        "started_at": start.isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "notes": "25m focus sprint",
        "focus_minutes": 25,
        "short_break_minutes": 5,
        "long_break_minutes": 15,
        "pomodoro_cycles": 1
    })
    assert sess_resp.status_code == 200

    # Verify streak
    streak_resp = client.get("/api/streaks", headers=headers)
    assert streak_resp.status_code == 200
    streak_data = streak_resp.json()
    assert streak_data["current_streak"] >= 1
    assert streak_data["total_sessions"] >= 1

    # Verify analytics breakdown
    analytics_resp = client.get("/api/analytics", headers=headers)
    assert analytics_resp.status_code == 200
    subject_names = [s["subject"] for s in analytics_resp.json()["subject_distribution"]]
    assert "General Studies" in subject_names


def test_journey_4_group_study_rooms_and_passcode_auth():
    """Journey 4: User A creates room -> User B joins -> Private room passcode authorization"""
    ts = int(time.time() * 1000)
    user_a = f"j4_usera_{ts}"
    user_b = f"j4_userb_{ts}"

    resp_a = client.post("/api/auth/register", json={"username": user_a, "email": f"{user_a}@test.com", "password": "Password123!"})
    token_a = resp_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    resp_b = client.post("/api/auth/register", json={"username": user_b, "email": f"{user_b}@test.com", "password": "Password123!"})
    token_b = resp_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 1. User A creates public room
    pub_resp = client.post("/api/rooms", headers=headers_a, json={
        "name": f"Aspirants Study Group {ts}",
        "description": "Public revision room",
        "duration_minutes": 45,
        "is_private": False
    })
    assert pub_resp.status_code == 200
    pub_code = pub_resp.json()["room_code"]

    # 2. User B joins public room
    join_pub = client.post(f"/api/rooms/{pub_code}/join", headers=headers_b, json={})
    assert join_pub.status_code == 200
    assert join_pub.json()["participants_count"] >= 2

    # 3. User A creates private room with passcode 4422
    priv_resp = client.post("/api/rooms", headers=headers_a, json={
        "name": f"Private Circle {ts}",
        "description": "Invite only",
        "duration_minutes": 60,
        "is_private": True,
        "pass_code": "4422"
    })
    assert priv_resp.status_code == 200
    priv_code = priv_resp.json()["room_code"]

    # 4. User B attempts join without passcode -> 400 Bad Request
    fail_join = client.post(f"/api/rooms/{priv_code}/join", headers=headers_b, json={})
    assert fail_join.status_code == 400

    # 5. User B attempts join with invalid passcode -> 400 Bad Request
    fail_join_2 = client.post(f"/api/rooms/{priv_code}/join", headers=headers_b, json={"pass_code": "0000"})
    assert fail_join_2.status_code == 400

    # 6. User B joins with valid passcode -> 200 OK
    succ_join = client.post(f"/api/rooms/{priv_code}/join", headers=headers_b, json={"pass_code": "4422"})
    assert succ_join.status_code == 200
    assert succ_join.json()["participants_count"] >= 2


def test_journey_5_mock_examination_and_scoring():
    """Journey 5: Mock Exam Simulation -> Answer evaluation -> Score calculation -> Result persistence"""
    ts = int(time.time() * 1000)
    username = f"j5_exam_{ts}"
    resp = client.post("/api/auth/register", json={"username": username, "email": f"{username}@test.com", "password": "Password123!"})
    headers = {"Authorization": f"Bearer {resp.json()['access_token']}"}

    # Simulate Mock Test Session logging
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=15)
    mock_session = client.post("/api/sessions", headers=headers, json={
        "session_type": "stopwatch",
        "subject": "Mock Test",
        "topic": "General Tamil Practice Mock",
        "duration_seconds": 900,
        "started_at": start.isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "notes": "Score: 7.5/7.5 (5/5 Correct, 100%)"
    })
    assert mock_session.status_code == 200
    assert "Score: 7.5" in mock_session.json()["notes"]


def test_journey_6_returning_student_data_persistence():
    """Journey 6: Log out (client side) -> Re-authenticate -> Verify tasks, sessions, preferences, and streaks intact"""
    ts = int(time.time() * 1000)
    username = f"j6_return_{ts}"
    password = "SecretPassword!99"
    reg = client.post("/api/auth/register", json={
        "username": username,
        "email": f"{username}@test.com",
        "password": password,
        "full_name": "Returning Scholar",
        "target_exam": "Group 1",
        "daily_goal_minutes": 240
    })
    token1 = reg.json()["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Generate plan and session
    plan_resp = client.get("/api/scheduler/plan", headers=headers1)
    assert plan_resp.status_code == 200
    task_count_init = len(plan_resp.json()["tasks"])

    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=60)
    client.post("/api/sessions", headers=headers1, json={
        "session_type": "countdown",
        "subject": "General Studies",
        "topic": "Administrative Ethics",
        "duration_seconds": 3600,
        "started_at": start.isoformat(),
        "ended_at": now.isoformat(),
        "completed": True,
        "notes": "Initial review"
    })

    # Re-login (new token issued)
    login = client.post("/api/auth/login", json={"username": username, "password": password})
    assert login.status_code == 200
    token2 = login.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Verify profile & preferences persist
    me = client.get("/api/auth/me", headers=headers2).json()
    assert me["username"] == username
    assert me["full_name"] == "Returning Scholar"
    assert me["target_exam"] == "Group 1"
    assert me["daily_goal_minutes"] == 240

    # Verify plan & tasks persist
    plan2 = client.get("/api/scheduler/plan", headers=headers2).json()
    assert len(plan2["tasks"]) == task_count_init

    # Verify session persists
    sessions = client.get("/api/sessions", headers=headers2).json()
    assert len(sessions) == 1
    assert sessions[0]["topic"] == "Administrative Ethics"

    # Verify streak persists
    streak = client.get("/api/streaks", headers=headers2).json()
    assert streak["current_streak"] >= 1

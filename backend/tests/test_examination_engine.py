from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.auth import get_current_user
from app.models import User
from app.exam_models import (
    Exam, ExamConfiguration, Subject, SyllabusTopic, Question, QuestionOption,
    ExamTest, TestQuestion, TestAttempt, AttemptAnswer, TestResult,
)
from app.main import app

@pytest.fixture
def exam_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()
    user = User(username="exam_tester", email="exam_tester@example.com",
                password_hash="x", full_name="Exam Tester")
    db.add(user)
    db.commit()
    db.refresh(user)

    def override_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_db
    app.dependency_overrides[get_current_user] = lambda: user
    with TestClient(app) as client:
        yield client, db, user
    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()

def seed_test(db):
    exam = Exam(code="GROUP4_TEST", name="Group 4")
    db.add(exam); db.flush()
    config = ExamConfiguration(exam_id=exam.id, version=1, positive_marks=1.5, negative_marks=0.5)
    db.add(config); db.flush()
    subject = Subject(exam_id=exam.id, name="General Tamil", code="TAMIL")
    db.add(subject); db.flush()
    topic = SyllabusTopic(subject_id=subject.id, name="Grammar")
    db.add(topic); db.flush()
    question = Question(topic_id=topic.id, prompt="Which is a vowel?", status="verified",
                        explanation="A is a vowel.")
    db.add(question); db.flush()
    correct = QuestionOption(question_id=question.id, text="A", position=1, is_correct=True)
    wrong = QuestionOption(question_id=question.id, text="B", position=2, is_correct=False)
    db.add_all([correct, wrong])
    test = ExamTest(exam_id=exam.id, configuration_id=config.id, title="Tamil basics",
                    test_type="topic", duration_minutes=20, is_published=True)
    db.add(test); db.flush()
    db.add(TestQuestion(test_id=test.id, question_id=question.id, position=1))
    db.commit()
    return test, question, correct, wrong

def test_attempt_flow_hides_answer_until_submission(exam_client):
    client, db, user = exam_client
    test, question, correct, wrong = seed_test(db)
    started = client.post(f"/api/exams/tests/{test.id}/attempts")
    assert started.status_code == 200
    attempt_id = started.json()["attempt_id"]

    state = client.get(f"/api/exams/attempts/{attempt_id}")
    assert state.status_code == 200
    question_payload = state.json()["questions"][0]
    assert "correct_option_id" not in question_payload
    assert "is_correct" not in str(question_payload)

    saved = client.put(f"/api/exams/attempts/{attempt_id}/answers", json={
        "question_id": question.id, "selected_option_id": correct.id, "marked_for_review": True
    })
    assert saved.status_code == 200

    submitted = client.post(f"/api/exams/attempts/{attempt_id}/submit")
    assert submitted.status_code == 200
    assert submitted.json()["result"]["score"] == 1.5
    assert submitted.json()["result"]["correct"] == 1

    review = client.get(f"/api/exams/attempts/{attempt_id}/review")
    assert review.status_code == 200
    assert review.json()["review"][0]["correct_option_id"] == correct.id

    repeated = client.post(f"/api/exams/attempts/{attempt_id}/submit")
    assert repeated.status_code == 200
    assert repeated.json()["result"]["score"] == 1.5

def test_attempt_rejects_option_from_another_question(exam_client):
    client, db, user = exam_client
    test, question, correct, wrong = seed_test(db)
    other = Question(prompt="Other question", status="verified")
    db.add(other); db.flush()
    foreign_option = QuestionOption(question_id=other.id, text="X", position=1, is_correct=True)
    db.add(foreign_option); db.commit()
    attempt_id = client.post(f"/api/exams/tests/{test.id}/attempts").json()["attempt_id"]
    response = client.put(f"/api/exams/attempts/{attempt_id}/answers", json={
        "question_id": question.id, "selected_option_id": foreign_option.id
    })
    assert response.status_code == 400

def test_attempt_isolation_returns_not_found(exam_client):
    client, db, user = exam_client
    response = client.get("/api/exams/attempts/999999")
    assert response.status_code == 404

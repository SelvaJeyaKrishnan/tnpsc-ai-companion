import json
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload
from app.auth import get_current_user
from app.database import get_db
from app.exam_models import Exam, ExamConfiguration, ExamTest, TestAttempt, TestQuestion, Question, QuestionOption, AttemptAnswer, TestResult
from app.models import User

router = APIRouter(prefix="/api/exams", tags=["examinations"])

class AnswerUpdate(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None
    marked_for_review: bool = False

def _owned_attempt(db, attempt_id, user_id):
    attempt = db.query(TestAttempt).filter_by(id=attempt_id, user_id=user_id).first()
    if not attempt:
        raise HTTPException(404, "Attempt not found")
    return attempt

@router.get("")
def list_exams(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return [{"id": e.id, "code": e.code, "name": e.name, "description": e.description}
            for e in db.query(Exam).filter_by(is_active=True).order_by(Exam.name).all()]

@router.get("/tests")
def list_tests(exam_id: Optional[int] = None, test_type: Optional[str] = None,
               subject_id: Optional[int] = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(ExamTest).filter_by(is_published=True)
    if exam_id: q = q.filter(ExamTest.exam_id == exam_id)
    if test_type: q = q.filter(ExamTest.test_type == test_type)
    if subject_id: q = q.filter(ExamTest.subject_id == subject_id)
    return [{"id": t.id, "exam_id": t.exam_id, "title": t.title, "test_type": t.test_type,
             "duration_minutes": t.duration_minutes, "question_count": len(t.questions)}
            for t in q.order_by(ExamTest.id.desc()).all()]

@router.post("/tests/{test_id}/attempts")
def start_attempt(test_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    test = db.query(ExamTest).options(joinedload(ExamTest.questions)).filter_by(id=test_id, is_published=True).first()
    if not test: raise HTTPException(404, "Published test not found")
    if not test.questions:
        raise HTTPException(409, "This test has no questions")
    for test_question in test.questions:
        question = test_question.question
        if not question.is_active or question.status not in {"reviewed", "verified"}:
            raise HTTPException(409, "This test contains a question that is not approved for delivery")
        if len(question.options) < 2 or sum(1 for option in question.options if option.is_correct) != 1:
            raise HTTPException(409, "This test contains a question with an invalid answer key")
    config = db.query(ExamConfiguration).filter_by(id=test.configuration_id, is_active=True).first()
    if not config: raise HTTPException(409, "Test scoring configuration is unavailable")
    now = datetime.now(timezone.utc)
    attempt = TestAttempt(user_id=user.id, test_id=test.id, started_at=now,
        expires_at=now + timedelta(minutes=test.duration_minutes), config_version=config.version,
        scoring_snapshot=json.dumps({"positive": config.positive_marks, "negative": config.negative_marks,
                                     "unanswered": config.unanswered_marks}))
    db.add(attempt); db.commit(); db.refresh(attempt)
    return {"attempt_id": attempt.id, "status": attempt.status, "started_at": attempt.started_at,
            "expires_at": attempt.expires_at, "duration_minutes": test.duration_minutes}

@router.get("/attempts/{attempt_id}")
def get_attempt(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = _owned_attempt(db, attempt_id, user.id)
    test = db.query(ExamTest).options(joinedload(ExamTest.questions).joinedload(TestQuestion.question).joinedload(Question.options)).filter_by(id=attempt.test_id).first()
    answers = {a.question_id: a for a in db.query(AttemptAnswer).filter_by(attempt_id=attempt.id).all()}
    items = []
    for tq in test.questions:
        q = tq.question
        saved = answers.get(q.id)
        items.append({"question_id": q.id, "position": tq.position, "prompt": q.prompt, "language": q.language,
            "options": [{"id": o.id, "text": o.text} for o in q.options],
            "selected_option_id": saved.selected_option_id if saved else None,
            "marked_for_review": saved.marked_for_review if saved else False})
    return {"attempt_id": attempt.id, "status": attempt.status, "expires_at": attempt.expires_at, "questions": items}

@router.put("/attempts/{attempt_id}/answers")
def save_answer(attempt_id: int, payload: AnswerUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = _owned_attempt(db, attempt_id, user.id)
    now = datetime.now(timezone.utc)
    expiry = attempt.expires_at if attempt.expires_at.tzinfo else attempt.expires_at.replace(tzinfo=timezone.utc)
    if attempt.status != "in_progress" or now >= expiry:
        raise HTTPException(409, "Attempt is no longer accepting answers")
    membership = db.query(TestQuestion).filter_by(test_id=attempt.test_id, question_id=payload.question_id).first()
    if not membership: raise HTTPException(400, "Question does not belong to this test")
    if payload.selected_option_id is not None:
        option = db.query(QuestionOption).filter_by(id=payload.selected_option_id, question_id=payload.question_id).first()
        if not option: raise HTTPException(400, "Selected option does not belong to this question")
    answer = db.query(AttemptAnswer).filter_by(attempt_id=attempt.id, question_id=payload.question_id).first()
    if not answer:
        answer = AttemptAnswer(attempt_id=attempt.id, question_id=payload.question_id); db.add(answer)
    answer.selected_option_id = payload.selected_option_id
    answer.marked_for_review = payload.marked_for_review
    answer.updated_at = now
    db.commit()
    return {"saved": True, "question_id": payload.question_id, "updated_at": now}

@router.post("/attempts/{attempt_id}/submit")
def submit_attempt(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = _owned_attempt(db, attempt_id, user.id)
    existing = db.query(TestResult).filter_by(attempt_id=attempt.id).first()
    if existing:
        return {"attempt_id": attempt.id, "status": "submitted", "result": {"score": existing.score, "max_marks": existing.max_marks,
            "correct": existing.correct_count, "wrong": existing.wrong_count, "unanswered": existing.unanswered_count,
            "accuracy": existing.accuracy, "percentage": existing.percentage}}
    if attempt.status != "in_progress": raise HTTPException(409, "Attempt cannot be submitted")
    now = datetime.now(timezone.utc)
    config = json.loads(attempt.scoring_snapshot)
    test_questions = db.query(TestQuestion).filter_by(test_id=attempt.test_id).all()
    answers = {a.question_id: a for a in db.query(AttemptAnswer).filter_by(attempt_id=attempt.id).all()}
    correct = wrong = unanswered = 0
    for tq in test_questions:
        answer = answers.get(tq.question_id)
        selected = answer.selected_option_id if answer else None
        if selected is None: unanswered += 1
        else:
            option = db.query(QuestionOption).filter_by(id=selected, question_id=tq.question_id).first()
            if option and option.is_correct: correct += 1
            else: wrong += 1
    total = len(test_questions)
    score = correct * config["positive"] - wrong * config["negative"] + unanswered * config["unanswered"]
    max_marks = total * config["positive"]
    started = attempt.started_at if attempt.started_at.tzinfo else attempt.started_at.replace(tzinfo=timezone.utc)
    expiry = attempt.expires_at if attempt.expires_at.tzinfo else attempt.expires_at.replace(tzinfo=timezone.utc)
    elapsed = max(0, int((min(now, expiry) - started).total_seconds()))
    result = TestResult(attempt_id=attempt.id, score=score, max_marks=max_marks, correct_count=correct,
        wrong_count=wrong, unanswered_count=unanswered, accuracy=(correct / max(1, correct + wrong)) * 100,
        percentage=(score / max_marks * 100) if max_marks else 0, duration_seconds=elapsed)
    attempt.status = "submitted"; attempt.submitted_at = now
    db.add(result); db.commit()
    return {"attempt_id": attempt.id, "status": "submitted", "result": {"score": score, "max_marks": max_marks,
        "correct": correct, "wrong": wrong, "unanswered": unanswered, "accuracy": result.accuracy,
        "percentage": result.percentage}}


@router.get("/attempts/{attempt_id}/result")
def get_result(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = _owned_attempt(db, attempt_id, user.id)
    if attempt.status != "submitted":
        raise HTTPException(409, "Submit the attempt before viewing its result")
    result = db.query(TestResult).filter_by(attempt_id=attempt.id).first()
    if not result:
        raise HTTPException(404, "Result not found")
    return {"attempt_id": attempt.id, "score": result.score, "max_marks": result.max_marks,
            "correct": result.correct_count, "wrong": result.wrong_count,
            "unanswered": result.unanswered_count, "accuracy": result.accuracy,
            "percentage": result.percentage, "duration_seconds": result.duration_seconds}

@router.get("/attempts/{attempt_id}/review")
def review_attempt(attempt_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    attempt = _owned_attempt(db, attempt_id, user.id)
    if attempt.status != "submitted":
        raise HTTPException(409, "Answer review is available after submission")
    test = db.query(ExamTest).options(joinedload(ExamTest.questions).joinedload(TestQuestion.question).joinedload(Question.options)).filter_by(id=attempt.test_id).first()
    answers = {a.question_id: a for a in db.query(AttemptAnswer).filter_by(attempt_id=attempt.id).all()}
    review = []
    for tq in test.questions:
        q = tq.question
        saved = answers.get(q.id)
        correct_option = next((o.id for o in q.options if o.is_correct), None)
        review.append({"question_id": q.id, "prompt": q.prompt,
            "options": [{"id": o.id, "text": o.text} for o in q.options],
            "selected_option_id": saved.selected_option_id if saved else None,
            "correct_option_id": correct_option, "explanation": q.explanation})
    return {"attempt_id": attempt.id, "review": review}

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.database import get_db
from app.models import PomodoroSession, StudySession, User
from app.schemas import PomodoroLogCreate, StudySessionCreate, StudySessionResponse
from app.services.streak_service import update_user_streak

router = APIRouter(prefix="/api/sessions", tags=["study-sessions"])


@router.post("", response_model=StudySessionResponse)
def record_study_session(
    payload: StudySessionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = StudySession(
        user_id=user.id,
        session_type=payload.session_type,
        subject=payload.subject,
        topic=payload.topic,
        duration_seconds=payload.duration_seconds,
        started_at=payload.started_at,
        ended_at=payload.ended_at,
        completed=payload.completed,
        notes=payload.notes
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # If it was pomodoro, record pomodoro session record too
    if payload.session_type == "pomodoro":
        pom = PomodoroSession(
            user_id=user.id,
            study_session_id=session.id,
            focus_duration_minutes=payload.focus_minutes or 25,
            short_break_minutes=payload.short_break_minutes or 5,
            long_break_minutes=payload.long_break_minutes or 15,
            cycles_completed=payload.pomodoro_cycles or 1,
            completed=payload.completed
        )
        db.add(pom)
        db.commit()

    # Update streak & check achievements
    update_user_streak(db, user, session)

    return session


@router.get("", response_model=List[StudySessionResponse])
def get_study_sessions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == user.id)
        .order_by(StudySession.ended_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return sessions


@router.get("/recent", response_model=List[StudySessionResponse])
def get_recent_sessions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == user.id)
        .order_by(StudySession.ended_at.desc())
        .limit(5)
        .all()
    )
    return sessions

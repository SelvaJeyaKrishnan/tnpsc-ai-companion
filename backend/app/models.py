from datetime import datetime, timezone
import json
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    full_name = Column(String(100), nullable=False)
    target_exam = Column(String(50), default="Group 4")  # Group 1, Group 2/2A, Group 4
    timezone = Column(String(50), default="Asia/Kolkata")
    daily_goal_minutes = Column(Integer, default=120)
    created_at = Column(DateTime, default=utc_now)

    sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="user", cascade="all, delete-orphan")
    streak = relationship("DailyStreak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    achievements = relationship("Achievement", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("StudyTask", back_populates="user", cascade="all, delete-orphan")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_type = Column(String(20), nullable=False)  # countdown, stopwatch, pomodoro
    subject = Column(String(100), nullable=False, index=True)
    topic = Column(String(150), nullable=False)
    duration_seconds = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime, nullable=False)
    ended_at = Column(DateTime, nullable=False)
    completed = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="sessions")
    pomodoro_record = relationship("PomodoroSession", back_populates="study_session", uselist=False)

    __table_args__ = (
        Index("ix_study_sessions_user_ended", "user_id", "ended_at"),
    )


class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    study_session_id = Column(Integer, ForeignKey("study_sessions.id"), nullable=True)
    focus_duration_minutes = Column(Integer, default=25)
    short_break_minutes = Column(Integer, default=5)
    long_break_minutes = Column(Integer, default=15)
    cycles_completed = Column(Integer, default=1)
    completed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="pomodoro_sessions")
    study_session = relationship("StudySession", back_populates="pomodoro_record")


class DailyStreak(Base):
    __tablename__ = "daily_streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_studied_date = Column(String(10), nullable=True)  # YYYY-MM-DD
    total_sessions = Column(Integer, default=0)
    total_seconds = Column(Integer, default=0)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="streak")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    badge_key = Column(String(50), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(50), default="award")
    unlocked_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="achievements")


class StudyRoom(Base):
    __tablename__ = "study_rooms"

    id = Column(Integer, primary_key=True, index=True)
    room_code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    is_private = Column(Boolean, default=False)
    pass_code = Column(String(20), nullable=True)
    created_by = Column(String(100), nullable=False)
    duration_minutes = Column(Integer, default=50)
    started_at = Column(DateTime, default=utc_now)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

    participants = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")


class RoomParticipant(Base):
    __tablename__ = "room_participants"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("study_rooms.id"), nullable=False, index=True)
    user_id = Column(Integer, nullable=False)
    username = Column(String(100), nullable=False)
    is_focusing = Column(Boolean, default=True)
    current_subject = Column(String(100), default="General Studies")
    current_topic = Column(String(150), default="Focus Session")
    completed_sessions = Column(Integer, default=0)
    total_minutes = Column(Integer, default=0)
    joined_at = Column(DateTime, default=utc_now)
    last_seen = Column(DateTime, default=utc_now)

    room = relationship("StudyRoom", back_populates="participants")


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    exam_type = Column(String(50), default="Group 4")
    target_exam_date = Column(String(10), nullable=False)  # YYYY-MM-DD
    daily_study_hours = Column(Float, default=4.0)
    priority_weak_subjects_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="study_plans")
    tasks = relationship("StudyTask", back_populates="plan", cascade="all, delete-orphan")

    @property
    def priority_weak_subjects(self):
        try:
            return json.loads(self.priority_weak_subjects_json)
        except Exception:
            return []

    @priority_weak_subjects.setter
    def priority_weak_subjects(self, value):
        self.priority_weak_subjects_json = json.dumps(value)


class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("study_plans.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject = Column(String(100), nullable=False)
    topic = Column(String(150), nullable=False)
    date_scheduled = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    duration_minutes = Column(Integer, default=45)
    priority = Column(String(20), default="medium")  # high, medium, low
    status = Column(String(20), default="pending")  # pending, in_progress, completed, missed
    is_revision = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    plan = relationship("StudyPlan", back_populates="tasks")
    user = relationship("User", back_populates="tasks")

    __table_args__ = (
        Index("ix_study_tasks_user_date", "user_id", "date_scheduled"),
    )

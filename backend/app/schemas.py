from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# User schemas
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    target_exam: str = "Group 4"
    timezone: str = "Asia/Kolkata"
    daily_goal_minutes: int = 120


class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    target_exam: str = "Group 4"
    timezone: str = "Asia/Kolkata"
    daily_goal_minutes: int = 120


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    target_exam: Optional[str] = None
    timezone: Optional[str] = None
    daily_goal_minutes: Optional[int] = None


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Study Session schemas
class StudySessionCreate(BaseModel):
    session_type: str = Field(..., description="countdown, stopwatch, pomodoro")
    subject: str
    topic: str
    duration_seconds: int = Field(..., ge=1)
    started_at: datetime
    ended_at: datetime
    completed: bool = True
    notes: Optional[str] = None
    # If Pomodoro:
    pomodoro_cycles: Optional[int] = None
    focus_minutes: Optional[int] = None
    short_break_minutes: Optional[int] = None
    long_break_minutes: Optional[int] = None


class StudySessionResponse(BaseModel):
    id: int
    user_id: int
    session_type: str
    subject: str
    topic: str
    duration_seconds: int
    started_at: datetime
    ended_at: datetime
    completed: bool
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Pomodoro Session schemas
class PomodoroLogCreate(BaseModel):
    subject: str
    topic: str
    focus_duration_minutes: int = 25
    short_break_minutes: int = 5
    long_break_minutes: int = 15
    cycles_completed: int = 1
    total_seconds: int
    started_at: datetime
    ended_at: datetime
    completed: bool = True


# Streak schemas
class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int
    last_studied_date: Optional[str]
    total_sessions: int
    total_seconds: int
    today_seconds: int
    daily_goal_minutes: int
    goal_completed: bool
    weekly_consistency: List[Dict[str, Any]]
    calendar_dates: List[str]


# Achievement schemas
class AchievementResponse(BaseModel):
    badge_key: str
    title: str
    description: str
    icon: str
    unlocked: bool
    unlocked_at: Optional[datetime] = None


# Analytics schemas
class SubjectBreakdown(BaseModel):
    subject: str
    seconds: int
    percentage: float
    sessions_count: int


class HourlyProductivity(BaseModel):
    hour: int
    label: str
    seconds: int


class DailyTrend(BaseModel):
    date: str
    day_name: str
    seconds: int
    sessions_count: int
    target_met: bool


class AnalyticsSummaryResponse(BaseModel):
    total_study_seconds: int
    total_study_hours: float
    today_seconds: int
    weekly_seconds: int
    monthly_seconds: int
    completed_pomodoros: int
    average_daily_minutes: float
    consistency_percentage: float
    subject_distribution: List[SubjectBreakdown]
    most_productive_hours: List[HourlyProductivity]
    weekly_trend: List[DailyTrend]
    filter_period: str


# Study Room schemas
class RoomCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False
    pass_code: Optional[str] = None
    duration_minutes: int = 50


class RoomJoin(BaseModel):
    pass_code: Optional[str] = None
    subject: Optional[str] = "General Studies"
    topic: Optional[str] = "TNPSC Revision"


class ParticipantResponse(BaseModel):
    user_id: int
    username: str
    is_focusing: bool
    current_subject: str
    current_topic: str
    completed_sessions: int
    total_minutes: int
    joined_at: datetime


class RoomResponse(BaseModel):
    id: int
    room_code: str
    name: str
    description: Optional[str] = None
    is_private: bool
    created_by: str
    duration_minutes: int
    started_at: datetime
    is_active: bool
    participants_count: int
    participants: List[ParticipantResponse] = []

    model_config = ConfigDict(from_attributes=True)


# Study Planner & Syllabus schemas
class SyllabusTopic(BaseModel):
    id: str
    name: str
    subtopics: List[str] = []


class SyllabusSubject(BaseModel):
    id: str
    name: str
    category: str
    topics: List[SyllabusTopic]


class ExamSyllabusResponse(BaseModel):
    exam: str
    title: str
    subjects: List[SyllabusSubject]


class PlanGenerateRequest(BaseModel):
    exam_type: str = "Group 4"
    target_exam_date: str  # YYYY-MM-DD
    daily_study_hours: float = 4.0
    weak_subjects: List[str] = []
    preferred_subjects: List[str] = []


class StudyTaskUpdate(BaseModel):
    status: Optional[str] = None  # completed, missed, pending
    notes: Optional[str] = None


class StudyTaskResponse(BaseModel):
    id: int
    plan_id: Optional[int]
    subject: str
    topic: str
    date_scheduled: str
    duration_minutes: int
    priority: str
    status: str
    is_revision: bool
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StudyPlanResponse(BaseModel):
    id: int
    title: str
    exam_type: str
    target_exam_date: str
    daily_study_hours: float
    priority_weak_subjects: List[str]
    tasks: List[StudyTaskResponse] = []
    total_tasks: int
    completed_tasks: int
    progress_percentage: float

    model_config = ConfigDict(from_attributes=True)


# AI Chat schemas
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str


class AiChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    subject: Optional[str] = "General Studies"
    target_exam: Optional[str] = "Group 4"
    history: List[ChatMessage] = []


class AiChatResponse(BaseModel):
    reply: str
    sources: List[str] = []
    suggested_topics: List[str] = []
    model: str = "tnpsc-curated-llm-engine"


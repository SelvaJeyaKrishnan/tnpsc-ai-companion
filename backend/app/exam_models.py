from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True)
    code = Column(String(40), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True, nullable=False)

class ExamConfiguration(Base):
    __tablename__ = "exam_configurations"
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    positive_marks = Column(Float, nullable=False, default=1.0)
    negative_marks = Column(Float, nullable=False, default=0.0)
    unanswered_marks = Column(Float, nullable=False, default=0.0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    __table_args__ = (UniqueConstraint("exam_id", "version", name="uq_exam_config_version"),)

class Subject(Base):
    __tablename__ = "exam_subjects"
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(120), nullable=False)
    code = Column(String(60), nullable=False)
    __table_args__ = (UniqueConstraint("exam_id", "code", name="uq_exam_subject_code"),)

class SyllabusTopic(Base):
    __tablename__ = "syllabus_topics"
    id = Column(Integer, primary_key=True)
    subject_id = Column(Integer, ForeignKey("exam_subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("syllabus_topics.id", ondelete="SET NULL"))
    name = Column(String(180), nullable=False)
    code = Column(String(80))
    is_active = Column(Boolean, default=True, nullable=False)

class Question(Base):
    __tablename__ = "exam_questions"
    id = Column(Integer, primary_key=True)
    topic_id = Column(Integer, ForeignKey("syllabus_topics.id", ondelete="SET NULL"), index=True)
    prompt = Column(Text, nullable=False)
    explanation = Column(Text)
    language = Column(String(10), default="en", nullable=False)
    difficulty = Column(String(20), default="medium", nullable=False)
    status = Column(String(20), default="draft", nullable=False, index=True)
    source_type = Column(String(30), default="practice", nullable=False)
    source_reference = Column(String(255))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    options = relationship("QuestionOption", cascade="all, delete-orphan", order_by="QuestionOption.position")

class QuestionOption(Base):
    __tablename__ = "question_options"
    id = Column(Integer, primary_key=True)
    question_id = Column(Integer, ForeignKey("exam_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    position = Column(Integer, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)
    __table_args__ = (UniqueConstraint("question_id", "position", name="uq_question_option_position"),)

class ExamTest(Base):
    __tablename__ = "exam_tests"
    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    configuration_id = Column(Integer, ForeignKey("exam_configurations.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("exam_subjects.id"))
    topic_id = Column(Integer, ForeignKey("syllabus_topics.id"))
    title = Column(String(180), nullable=False)
    test_type = Column(String(30), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    instructions = Column(Text)
    is_published = Column(Boolean, default=False, nullable=False)
    questions = relationship("TestQuestion", cascade="all, delete-orphan", order_by="TestQuestion.position")

class TestQuestion(Base):
    __tablename__ = "test_questions"
    id = Column(Integer, primary_key=True)
    test_id = Column(Integer, ForeignKey("exam_tests.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("exam_questions.id"), nullable=False)
    position = Column(Integer, nullable=False)
    __table_args__ = (UniqueConstraint("test_id", "position", name="uq_test_question_position"), UniqueConstraint("test_id", "question_id", name="uq_test_question")) 

class TestAttempt(Base):
    __tablename__ = "test_attempts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    test_id = Column(Integer, ForeignKey("exam_tests.id"), nullable=False, index=True)
    status = Column(String(20), default="in_progress", nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    submitted_at = Column(DateTime(timezone=True))
    config_version = Column(Integer, nullable=False)
    scoring_snapshot = Column(Text, nullable=False)
    answers = relationship("AttemptAnswer", cascade="all, delete-orphan")
    result = relationship("TestResult", uselist=False, cascade="all, delete-orphan")

class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("test_attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("exam_questions.id"), nullable=False)
    selected_option_id = Column(Integer, ForeignKey("question_options.id"))
    marked_for_review = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    __table_args__ = (UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question"),)

class TestResult(Base):
    __tablename__ = "test_results"
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer, ForeignKey("test_attempts.id", ondelete="CASCADE"), unique=True, nullable=False)
    score = Column(Float, nullable=False)
    max_marks = Column(Float, nullable=False)
    correct_count = Column(Integer, nullable=False)
    wrong_count = Column(Integer, nullable=False)
    unanswered_count = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    percentage = Column(Float, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

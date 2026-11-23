"""Create examination engine tables.

Revision ID: b81d2f4a9c10
Revises: 6e19ca999c2f
"""
from alembic import op
from app.exam_models import Exam, ExamConfiguration, Subject, SyllabusTopic, Question, QuestionOption, ExamTest, TestQuestion, TestAttempt, AttemptAnswer, TestResult
from app.database import Base

revision = "b81d2f4a9c10"
down_revision = "6e19ca999c2f"
branch_labels = None
depends_on = None

TABLES = [Exam.__table__, ExamConfiguration.__table__, Subject.__table__, SyllabusTopic.__table__,
          Question.__table__, QuestionOption.__table__, ExamTest.__table__, TestQuestion.__table__,
          TestAttempt.__table__, AttemptAnswer.__table__, TestResult.__table__]

def upgrade():
    bind = op.get_bind()
    for table in TABLES:
        table.create(bind=bind, checkfirst=True)

def downgrade():
    bind = op.get_bind()
    for table in reversed(TABLES):
        table.drop(bind=bind, checkfirst=True)

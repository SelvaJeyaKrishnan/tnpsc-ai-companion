from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.database import get_db
from app.models import StudyPlan, StudyTask, User
from app.schemas import (
    ExamSyllabusResponse,
    PlanGenerateRequest,
    StudyPlanResponse,
    StudyTaskResponse,
    StudyTaskUpdate,
)
from app.seed_data import TNPSC_SYLLABUS
from app.services.scheduler_service import (
    generate_ai_study_plan,
    get_plan_summary,
    rebalance_missed_tasks,
)

router = APIRouter(prefix="/api/scheduler", tags=["study-planner"])


@router.get("/syllabus", response_model=ExamSyllabusResponse)
def get_exam_syllabus(exam: str = Query("Group 4")):
    if exam == "Group 2A" or exam == "Group 2 / 2A":
        data = TNPSC_SYLLABUS["Group 2"]
        return ExamSyllabusResponse(
            exam="Group 2A",
            title="TNPSC Group 2A (Combined Civil Services-II Non-Interview)",
            subjects=data["subjects"]
        )
    if exam not in TNPSC_SYLLABUS:
        exam = "Group 4"
    data = TNPSC_SYLLABUS[exam]
    return ExamSyllabusResponse(
        exam=exam,
        title=data["title"],
        subjects=data["subjects"]
    )


@router.get("/plan", response_model=StudyPlanResponse)
def get_current_plan(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = (
        db.query(StudyPlan)
        .filter(StudyPlan.user_id == user.id)
        .order_by(StudyPlan.created_at.desc())
        .first()
    )
    if not plan:
        # Generate initial default plan
        plan = generate_ai_study_plan(
            db=db,
            user=user,
            exam_type=user.target_exam or "Group 4",
            daily_study_hours=4.0,
            weak_subjects=["General Tamil (பொதுத்தமிழ்)", "Aptitude & Mental Ability"]
        )

    return get_plan_summary(db, plan)


@router.post("/generate", response_model=StudyPlanResponse)
def generate_new_plan(
    payload: PlanGenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = generate_ai_study_plan(
        db=db,
        user=user,
        exam_type=payload.exam_type,
        target_exam_date=payload.target_exam_date,
        daily_study_hours=payload.daily_study_hours,
        weak_subjects=payload.weak_subjects,
        preferred_subjects=payload.preferred_subjects
    )
    return get_plan_summary(db, plan)


@router.patch("/tasks/{task_id}", response_model=StudyTaskResponse)
def update_task_status(
    task_id: int,
    payload: StudyTaskUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = (
        db.query(StudyTask)
        .filter(StudyTask.id == task_id, StudyTask.user_id == user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.status:
        task.status = payload.status
        if payload.status == "completed":
            task.completed_at = datetime.now(timezone.utc)
        else:
            task.completed_at = None

    db.commit()
    db.refresh(task)
    return task


@router.post("/rebalance")
def auto_rebalance_schedule(
    plan_id: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not plan_id:
        active_plan = (
            db.query(StudyPlan)
            .filter(StudyPlan.user_id == user.id)
            .order_by(StudyPlan.created_at.desc())
            .first()
        )
        if not active_plan:
            raise HTTPException(status_code=404, detail="No active plan found to rebalance")
        plan_id = active_plan.id
    else:
        active_plan = (
            db.query(StudyPlan)
            .filter(StudyPlan.id == plan_id, StudyPlan.user_id == user.id)
            .first()
        )
        if not active_plan:
            raise HTTPException(status_code=404, detail="Study plan not found for current user")

    reassigned_count = rebalance_missed_tasks(db, user, plan_id)
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    return {
        "message": f"Successfully rebalanced {reassigned_count} missed tasks.",
        "reassigned_count": reassigned_count,
        "plan": get_plan_summary(db, plan)
    }

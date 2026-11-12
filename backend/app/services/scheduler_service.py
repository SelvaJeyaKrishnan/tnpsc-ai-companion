from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import StudyPlan, StudyTask, User
from app.seed_data import TNPSC_SYLLABUS
from app.services.streak_service import get_user_local_date


def generate_ai_study_plan(
    db: Session,
    user: User,
    exam_type: str = "Group 4",
    target_exam_date: str = "",
    daily_study_hours: float = 4.0,
    weak_subjects: Optional[List[str]] = None,
    preferred_subjects: Optional[List[str]] = None
) -> StudyPlan:
    if weak_subjects is None:
        weak_subjects = []
    if preferred_subjects is None:
        preferred_subjects = []

    # Get local date
    now_utc = datetime.now(timezone.utc)
    today_str = get_user_local_date(now_utc, user.timezone)
    today_dt = datetime.strptime(today_str, "%Y-%m-%d").date()

    if not target_exam_date:
        target_exam_date = (today_dt + timedelta(days=90)).strftime("%Y-%m-%d")

    target_dt = datetime.strptime(target_exam_date, "%Y-%m-%d").date()
    days_remaining = max(7, (target_dt - today_dt).days)

    syllabus = TNPSC_SYLLABUS.get(exam_type, TNPSC_SYLLABUS["Group 4"])
    subjects = syllabus["subjects"]

    # Deactivate existing active plans for this user if needed or append
    plan = StudyPlan(
        user_id=user.id,
        title=f"{exam_type} AI Precision Study & Revision Roadmap",
        exam_type=exam_type,
        target_exam_date=target_exam_date,
        daily_study_hours=daily_study_hours
    )
    plan.priority_weak_subjects = weak_subjects
    db.add(plan)
    db.commit()
    db.refresh(plan)

    # Flatten syllabus topics with weights
    weighted_topics = []
    for s in subjects:
        subj_name = s["name"]
        is_weak = any(w.lower() in subj_name.lower() for w in weak_subjects)
        weight = 3 if is_weak else 1

        for top in s["topics"]:
            weighted_topics.append({
                "subject": subj_name,
                "topic": top["name"],
                "priority": "high" if is_weak else "medium",
                "weight": weight
            })

    # Distribute topics across the plan horizon (e.g. next 14 to 30 days)
    horizon_days = min(days_remaining, 30)
    tasks_per_day = max(2, int((daily_study_hours * 60) // 45))

    topic_idx = 0
    total_topics = len(weighted_topics)

    created_tasks = []
    for day_offset in range(horizon_days):
        current_date = today_dt + timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")

        # Every 4th day is a Spaced Revision Day for previous topics!
        is_revision_day = (day_offset > 0 and day_offset % 4 == 0)

        for slot in range(tasks_per_day):
            if is_revision_day and slot == 0 and created_tasks:
                # Pick an earlier task for spaced revision
                prior_task = created_tasks[max(0, len(created_tasks) - 5)]
                task = StudyTask(
                    plan_id=plan.id,
                    user_id=user.id,
                    subject=prior_task.subject,
                    topic=f"[Revision] {prior_task.topic}",
                    date_scheduled=date_str,
                    duration_minutes=45,
                    priority="high",
                    status="pending",
                    is_revision=True
                )
            else:
                curr_item = weighted_topics[topic_idx % total_topics]
                topic_idx += 1
                task = StudyTask(
                    plan_id=plan.id,
                    user_id=user.id,
                    subject=curr_item["subject"],
                    topic=curr_item["topic"],
                    date_scheduled=date_str,
                    duration_minutes=45,
                    priority=curr_item["priority"],
                    status="pending",
                    is_revision=False
                )

            db.add(task)
            created_tasks.append(task)

    db.commit()
    return plan


def rebalance_missed_tasks(db: Session, user: User, plan_id: int):
    now_utc = datetime.now(timezone.utc)
    today_str = get_user_local_date(now_utc, user.timezone)
    today_dt = datetime.strptime(today_str, "%Y-%m-%d").date()

    # Find tasks in the past that are still pending
    missed_tasks = (
        db.query(StudyTask)
        .filter(
            StudyTask.plan_id == plan_id,
            StudyTask.user_id == user.id,
            StudyTask.status == "pending",
            StudyTask.date_scheduled < today_str
        )
        .all()
    )

    reassigned_count = 0
    for idx, t in enumerate(missed_tasks):
        # Push into upcoming days starting today
        target_day = today_dt + timedelta(days=(idx // 2))
        t.date_scheduled = target_day.strftime("%Y-%m-%d")
        t.priority = "high"
        reassigned_count += 1

    db.commit()
    return reassigned_count


def get_plan_summary(db: Session, plan: StudyPlan) -> dict:
    tasks = (
        db.query(StudyTask)
        .filter(StudyTask.plan_id == plan.id)
        .order_by(StudyTask.date_scheduled.asc(), StudyTask.id.asc())
        .all()
    )

    total = len(tasks)
    completed = len([t for t in tasks if t.status == "completed"])
    pct = round((completed / total) * 100, 1) if total > 0 else 0

    return {
        "id": plan.id,
        "title": plan.title,
        "exam_type": plan.exam_type,
        "target_exam_date": plan.target_exam_date,
        "daily_study_hours": plan.daily_study_hours,
        "priority_weak_subjects": plan.priority_weak_subjects,
        "tasks": [
            {
                "id": t.id,
                "plan_id": t.plan_id,
                "subject": t.subject,
                "topic": t.topic,
                "date_scheduled": t.date_scheduled,
                "duration_minutes": t.duration_minutes,
                "priority": t.priority,
                "status": t.status,
                "is_revision": t.is_revision,
                "completed_at": t.completed_at
            }
            for t in tasks
        ],
        "total_tasks": total,
        "completed_tasks": completed,
        "progress_percentage": pct
    }

from datetime import datetime, timedelta, timezone
from typing import Optional
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.models import PomodoroSession, StudySession, User
from app.services.streak_service import get_user_local_date


def get_analytics_summary(
    db: Session,
    user: User,
    period: str = "week",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    try:
        user_tz = ZoneInfo(user.timezone)
    except Exception:
        if "kolkata" in user.timezone.lower() or "calcutta" in user.timezone.lower():
            user_tz = timezone(timedelta(hours=5, minutes=30))
        else:
            user_tz = timezone.utc

    now_utc = datetime.now(timezone.utc)
    today_str = get_user_local_date(now_utc, user.timezone)
    today_dt = datetime.strptime(today_str, "%Y-%m-%d").date()

    all_sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == user.id)
        .order_by(StudySession.started_at.asc())
        .all()
    )

    # Determine filter boundaries in user local date
    if period == "today":
        filter_start = today_str
        filter_end = today_str
    elif period == "week":
        filter_start = (today_dt - timedelta(days=6)).strftime("%Y-%m-%d")
        filter_end = today_str
    elif period == "month":
        filter_start = (today_dt - timedelta(days=29)).strftime("%Y-%m-%d")
        filter_end = today_str
    elif period == "custom" and start_date and end_date:
        filter_start = start_date
        filter_end = end_date
    else:  # all
        filter_start = "2000-01-01"
        filter_end = "2099-12-31"

    # Filtered sessions
    filtered_sessions = []
    total_study_seconds = 0
    today_seconds = 0
    weekly_seconds = 0
    monthly_seconds = 0

    week_cutoff = (today_dt - timedelta(days=6)).strftime("%Y-%m-%d")
    month_cutoff = (today_dt - timedelta(days=29)).strftime("%Y-%m-%d")

    subject_map = {}
    hourly_map = {h: 0 for h in range(24)}
    day_map = {}

    for s in all_sessions:
        s_date = get_user_local_date(s.ended_at, user.timezone)
        # Global rollups
        total_study_seconds += s.duration_seconds
        if s_date == today_str:
            today_seconds += s.duration_seconds
        if s_date >= week_cutoff:
            weekly_seconds += s.duration_seconds
        if s_date >= month_cutoff:
            monthly_seconds += s.duration_seconds

        # Check if in current filter
        if filter_start <= s_date <= filter_end:
            filtered_sessions.append(s)

            # Subject breakdown
            subj = s.subject or "Uncategorized"
            if subj not in subject_map:
                subject_map[subj] = {"seconds": 0, "count": 0}
            subject_map[subj]["seconds"] += s.duration_seconds
            subject_map[subj]["count"] += 1

            # Hourly distribution (local hour of started_at)
            local_started = s.started_at.replace(tzinfo=timezone.utc).astimezone(user_tz)
            h = local_started.hour
            hourly_map[h] = hourly_map.get(h, 0) + s.duration_seconds

            # Day distribution
            day_map[s_date] = day_map.get(s_date, 0) + s.duration_seconds

    # Filtered total
    filtered_total_seconds = sum(s.duration_seconds for s in filtered_sessions)
    total_hours = round(total_study_seconds / 3600.0, 2)

    # Subject distribution list
    subject_distribution = []
    for subj, data in subject_map.items():
        pct = (
            round((data["seconds"] / filtered_total_seconds) * 100, 1)
            if filtered_total_seconds > 0
            else 0
        )
        subject_distribution.append({
            "subject": subj,
            "seconds": data["seconds"],
            "percentage": pct,
            "sessions_count": data["count"]
        })
    subject_distribution.sort(key=lambda x: x["seconds"], reverse=True)

    # Hourly productivity
    most_productive_hours = []
    for h in range(24):
        # Format label e.g. "6 AM", "2 PM"
        label = datetime.strptime(str(h), "%H").strftime("%I %p").lstrip("0")
        most_productive_hours.append({
            "hour": h,
            "label": label,
            "seconds": hourly_map[h]
        })

    # Weekly trend (last 7 days)
    weekly_trend = []
    goal_secs = user.daily_goal_minutes * 60
    days_with_study = 0
    for i in range(6, -1, -1):
        d = today_dt - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        day_name = d.strftime("%a")
        secs = day_map.get(d_str, 0)
        if secs > 0:
            days_with_study += 1
        weekly_trend.append({
            "date": d_str,
            "day_name": day_name,
            "seconds": secs,
            "sessions_count": len([s for s in filtered_sessions if get_user_local_date(s.ended_at, user.timezone) == d_str]),
            "target_met": secs >= goal_secs
        })

    # Consistency % over last 7 days
    consistency_pct = round((days_with_study / 7.0) * 100, 1)

    # Average daily minutes over active days in period
    unique_active_days = len(day_map.keys())
    avg_daily_minutes = (
        round((filtered_total_seconds / 60.0) / max(1, unique_active_days), 1)
        if unique_active_days > 0
        else 0
    )

    # Completed pomodoros count
    completed_pomodoros = (
        db.query(PomodoroSession)
        .filter(PomodoroSession.user_id == user.id, PomodoroSession.completed == True)
        .count()
    )

    return {
        "total_study_seconds": total_study_seconds,
        "total_study_hours": total_hours,
        "today_seconds": today_seconds,
        "weekly_seconds": weekly_seconds,
        "monthly_seconds": monthly_seconds,
        "completed_pomodoros": completed_pomodoros,
        "average_daily_minutes": avg_daily_minutes,
        "consistency_percentage": consistency_pct,
        "subject_distribution": subject_distribution,
        "most_productive_hours": most_productive_hours,
        "weekly_trend": weekly_trend,
        "filter_period": period
    }

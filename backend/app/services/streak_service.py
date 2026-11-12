from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from sqlalchemy.orm import Session
from app.models import Achievement, DailyStreak, StudySession, User
from app.seed_data import DEFAULT_ACHIEVEMENTS


def get_user_local_date(utc_dt: datetime, user_tz_name: str) -> str:
    try:
        tz = ZoneInfo(user_tz_name)
    except Exception:
        # Fallback to IST (+5:30) or UTC
        if "kolkata" in user_tz_name.lower() or "calcutta" in user_tz_name.lower():
            tz = timezone(timedelta(hours=5, minutes=30))
        else:
            tz = timezone.utc
    
    if utc_dt.tzinfo is None:
        utc_dt = utc_dt.replace(tzinfo=timezone.utc)
    local_dt = utc_dt.astimezone(tz)
    return local_dt.strftime("%Y-%m-%d")


def check_and_unlock_achievements(db: Session, user: User, streak: DailyStreak):
    total_hours = streak.total_seconds / 3600.0
    existing_keys = {
        a.badge_key for a in db.query(Achievement).filter(Achievement.user_id == user.id).all()
    }

    definitions = {d["badge_key"]: d for d in DEFAULT_ACHIEVEMENTS}

    def unlock(badge_key: str):
        if badge_key not in existing_keys and badge_key in definitions:
            d = definitions[badge_key]
            ach = Achievement(
                user_id=user.id,
                badge_key=badge_key,
                title=d["title"],
                description=d["description"],
                icon=d["icon"]
            )
            db.add(ach)
            existing_keys.add(badge_key)

    if streak.total_sessions >= 1:
        unlock("first_session")
    if streak.current_streak >= 3:
        unlock("streak_3")
    if streak.current_streak >= 7:
        unlock("streak_7")
    if streak.current_streak >= 30:
        unlock("streak_30")
    if total_hours >= 10:
        unlock("hours_10")
    if total_hours >= 50:
        unlock("hours_50")
    if total_hours >= 100:
        unlock("hours_100")

    db.commit()


def update_user_streak(db: Session, user: User, session: StudySession):
    streak = db.query(DailyStreak).filter(DailyStreak.user_id == user.id).first()
    if not streak:
        streak = DailyStreak(
            user_id=user.id,
            current_streak=0,
            longest_streak=0,
            last_studied_date=None,
            total_sessions=0,
            total_seconds=0
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)

    session_local_date = get_user_local_date(session.ended_at, user.timezone)

    # Accumulate totals
    streak.total_sessions += 1
    streak.total_seconds += session.duration_seconds

    if streak.last_studied_date is None:
        streak.current_streak = 1
        streak.last_studied_date = session_local_date
    elif streak.last_studied_date == session_local_date:
        # Already studied today, streak continues at same count
        pass
    else:
        # Check if last_studied_date was yesterday
        last_dt = datetime.strptime(streak.last_studied_date, "%Y-%m-%d").date()
        current_dt = datetime.strptime(session_local_date, "%Y-%m-%d").date()
        diff = (current_dt - last_dt).days

        if diff == 1:
            streak.current_streak += 1
        elif diff > 1:
            # Streak broken
            streak.current_streak = 1
        
        streak.last_studied_date = session_local_date

    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak

    db.commit()
    check_and_unlock_achievements(db, user, streak)
    return streak


def get_streak_summary(db: Session, user: User):
    streak = db.query(DailyStreak).filter(DailyStreak.user_id == user.id).first()
    if not streak:
        streak = DailyStreak(
            user_id=user.id,
            current_streak=0,
            longest_streak=0,
            last_studied_date=None,
            total_sessions=0,
            total_seconds=0
        )
        db.add(streak)
        db.commit()
        db.refresh(streak)

    # Get local date for now
    now_utc = datetime.now(timezone.utc)
    today_str = get_user_local_date(now_utc, user.timezone)

    # If user hasn't studied today and last studied date was before yesterday, streak reset
    if streak.last_studied_date:
        last_dt = datetime.strptime(streak.last_studied_date, "%Y-%m-%d").date()
        today_dt = datetime.strptime(today_str, "%Y-%m-%d").date()
        diff = (today_dt - last_dt).days
        if diff > 1:
            streak.current_streak = 0
            db.commit()

    # Calculate today's seconds and weekly consistency
    sessions = db.query(StudySession).filter(StudySession.user_id == user.id).all()

    today_seconds = 0
    day_seconds_map = {}
    studied_dates = set()

    for s in sessions:
        s_date = get_user_local_date(s.ended_at, user.timezone)
        studied_dates.add(s_date)
        day_seconds_map[s_date] = day_seconds_map.get(s_date, 0) + s.duration_seconds
        if s_date == today_str:
            today_seconds += s.duration_seconds

    # Last 7 days
    today_dt = datetime.strptime(today_str, "%Y-%m-%d").date()
    weekly_consistency = []
    goal_secs = user.daily_goal_minutes * 60

    for i in range(6, -1, -1):
        d = today_dt - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        day_name = d.strftime("%a")
        secs = day_seconds_map.get(d_str, 0)
        weekly_consistency.append({
            "date": d_str,
            "day": day_name,
            "seconds": secs,
            "target_met": secs >= goal_secs,
            "percentage": min(100.0, round((secs / goal_secs) * 100, 1)) if goal_secs > 0 else 0
        })

    return {
        "current_streak": streak.current_streak,
        "longest_streak": streak.longest_streak,
        "last_studied_date": streak.last_studied_date,
        "total_sessions": streak.total_sessions,
        "total_seconds": streak.total_seconds,
        "today_seconds": today_seconds,
        "daily_goal_minutes": user.daily_goal_minutes,
        "goal_completed": today_seconds >= goal_secs,
        "weekly_consistency": weekly_consistency,
        "calendar_dates": sorted(list(studied_dates))
    }

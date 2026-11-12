from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.database import get_db
from app.models import Achievement, User
from app.schemas import AchievementResponse, StreakResponse
from app.seed_data import DEFAULT_ACHIEVEMENTS
from app.services.streak_service import get_streak_summary

router = APIRouter(prefix="/api/streaks", tags=["streaks-and-achievements"])


@router.get("", response_model=StreakResponse)
def get_streak_details(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_streak_summary(db, user)


@router.get("/achievements", response_model=List[AchievementResponse])
def get_user_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    unlocked_achievements = {
        a.badge_key: a
        for a in db.query(Achievement).filter(Achievement.user_id == user.id).all()
    }

    result = []
    for d in DEFAULT_ACHIEVEMENTS:
        k = d["badge_key"]
        is_unlocked = k in unlocked_achievements
        unlocked_dt = unlocked_achievements[k].unlocked_at if is_unlocked else None
        result.append(
            AchievementResponse(
                badge_key=k,
                title=d["title"],
                description=d["description"],
                icon=d["icon"],
                unlocked=is_unlocked,
                unlocked_at=unlocked_dt
            )
        )
    return result

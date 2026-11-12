from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.database import get_db
from app.models import User
from app.schemas import AnalyticsSummaryResponse
from app.services.analytics_service import get_analytics_summary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsSummaryResponse)
def get_user_analytics(
    period: str = Query("week", pattern="^(today|week|month|all|custom)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_analytics_summary(
        db=db,
        user=user,
        period=period,
        start_date=start_date,
        end_date=end_date
    )

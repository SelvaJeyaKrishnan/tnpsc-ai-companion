from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.auth import create_access_token, get_current_user, hash_password, require_current_user, verify_password
from app.database import get_db
from app.models import DailyStreak, User
from app.rate_limiter import check_login_rate_limit, check_register_rate_limit
from app.schemas import TokenResponse, UserLogin, UserRegister, UserResponse, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["auth"])
user_router = APIRouter(prefix="/api/user", tags=["user"])


@router.post("/register", response_model=TokenResponse)
def register_user(payload: UserRegister, request: Request, db: Session = Depends(get_db)):
    check_register_rate_limit(request)
    # Check if username or email already exists
    existing = db.query(User).filter(
        (User.username == payload.username.strip().lower()) |
        (User.email == payload.email.strip().lower())
    ).first()

    if existing:
        if existing.username == payload.username.strip().lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered"
            )

    full_name = (payload.full_name or payload.username).strip()
    new_user = User(
        username=payload.username.strip().lower(),
        email=payload.email.strip().lower(),
        password_hash=hash_password(payload.password),
        full_name=full_name,
        target_exam=payload.target_exam,
        timezone=payload.timezone,
        daily_goal_minutes=payload.daily_goal_minutes
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize streak record for new user
    streak = DailyStreak(
        user_id=new_user.id,
        current_streak=0,
        longest_streak=0,
        last_studied_date=None,
        total_sessions=0,
        total_seconds=0
    )
    db.add(streak)
    db.commit()

    token = create_access_token(user_id=new_user.id, username=new_user.username)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user)
    )


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, request: Request, db: Session = Depends(get_db)):
    check_login_rate_limit(request)
    identifier = payload.username.strip().lower()
    user = db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(user_id=user.id, username=user.username)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(require_current_user)):
    return user


@router.put("/me", response_model=UserResponse)
def update_current_user_profile(
    payload: UserUpdate,
    user: User = Depends(require_current_user),
    db: Session = Depends(get_db)
):
    if payload.full_name is not None:
        user.full_name = payload.full_name.strip()
    if payload.target_exam is not None:
        user.target_exam = payload.target_exam
    if payload.timezone is not None:
        user.timezone = payload.timezone
    if payload.daily_goal_minutes is not None:
        user.daily_goal_minutes = payload.daily_goal_minutes

    db.commit()
    db.refresh(user)
    return user


# Backwards compatibility endpoints for /api/user
@user_router.get("", response_model=UserResponse)
def get_user_profile_legacy(user: User = Depends(get_current_user)):
    return user


@user_router.put("", response_model=UserResponse)
def update_user_profile_legacy(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_current_user_profile(payload, user, db)

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, WebSocket, WebSocketDisconnect, status
import jwt
from sqlalchemy.orm import Session
from app.auth import JWT_ALGORITHM, JWT_SECRET, get_current_user, get_optional_current_user
from app.database import get_db
from app.models import RoomParticipant, StudyRoom, User
from app.rate_limiter import check_room_rate_limit
from app.schemas import RoomCreate, RoomJoin, RoomResponse
from app.services.room_service import (
    create_study_room,
    get_room_state_payload,
    join_study_room,
    ws_manager,
)

router = APIRouter(prefix="/api/rooms", tags=["group-study-rooms"])


@router.get("", response_model=List[RoomResponse])
def list_active_rooms(
    user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    rooms = (
        db.query(StudyRoom)
        .filter(StudyRoom.is_active == True)
        .order_by(StudyRoom.created_at.desc())
        .limit(20)
        .all()
    )

    result = []
    for r in rooms:
        count = db.query(RoomParticipant).filter(RoomParticipant.room_id == r.id).count()
        participants = (
            db.query(RoomParticipant)
            .filter(RoomParticipant.room_id == r.id)
            .limit(10)
            .all()
        )
        result.append(
            RoomResponse(
                id=r.id,
                room_code=r.room_code,
                name=r.name,
                description=r.description,
                is_private=r.is_private,
                created_by=r.created_by,
                duration_minutes=r.duration_minutes,
                started_at=r.started_at,
                is_active=r.is_active,
                participants_count=count,
                participants=[
                    {
                        "user_id": p.user_id,
                        "username": p.username,
                        "is_focusing": p.is_focusing,
                        "current_subject": p.current_subject,
                        "current_topic": p.current_topic,
                        "completed_sessions": p.completed_sessions,
                        "total_minutes": p.total_minutes,
                        "joined_at": p.joined_at
                    }
                    for p in participants
                ]
            )
        )
    return result


@router.post("", response_model=RoomResponse)
def create_room(
    payload: RoomCreate,
    request: Request,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    check_room_rate_limit(user.id if user else 0, request)
    room = create_study_room(
        db=db,
        user=user,
        name=payload.name,
        description=payload.description,
        is_private=payload.is_private,
        pass_code=payload.pass_code,
        duration_minutes=payload.duration_minutes
    )
    return RoomResponse(
        id=room.id,
        room_code=room.room_code,
        name=room.name,
        description=room.description,
        is_private=room.is_private,
        created_by=room.created_by,
        duration_minutes=room.duration_minutes,
        started_at=room.started_at,
        is_active=room.is_active,
        participants_count=1,
        participants=[]
    )


@router.get("/{room_code}")
def get_room_details(
    room_code: str,
    pass_code: Optional[str] = Query(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(StudyRoom).filter(StudyRoom.room_code == room_code.upper()).first()
    if not room:
        raise HTTPException(status_code=404, detail="Study room not found")

    if room.is_private:
        is_member = db.query(RoomParticipant).filter(
            RoomParticipant.room_id == room.id,
            RoomParticipant.user_id == user.id
        ).first()
        is_creator = (user.full_name == room.created_by) or (user.username == room.created_by)
        if not is_member and not is_creator:
            if not pass_code or pass_code != room.pass_code:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Private room requires valid passcode or prior membership to access details"
                )

    return get_room_state_payload(db, room)


@router.post("/{room_code}/join")
def join_room(
    room_code: str,
    payload: RoomJoin,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        room = join_study_room(
            db=db,
            room_code=room_code,
            user=user,
            pass_code=payload.pass_code,
            subject=payload.subject or "General Studies",
            topic=payload.topic or "Focus Session"
        )
        return get_room_state_payload(db, room)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.websocket("/{room_code}/ws")
async def room_websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
    token: Optional[str] = Query(None),
    pass_code: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    room = db.query(StudyRoom).filter(StudyRoom.room_code == room_code.upper()).first()
    if not room or not room.is_active:
        await websocket.close(code=4000)
        return

    # Enforce authorization on private study rooms
    if room.is_private:
        authorized = False
        if pass_code and pass_code == room.pass_code:
            authorized = True
        elif token:
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
                user_id = int(payload.get("sub", 0))
                is_member = db.query(RoomParticipant).filter(
                    RoomParticipant.room_id == room.id,
                    RoomParticipant.user_id == user_id
                ).first()
                user = db.query(User).filter(User.id == user_id).first()
                if is_member or (user and (user.full_name == room.created_by or user.username == room.created_by)):
                    authorized = True
            except Exception:
                authorized = False

        if not authorized:
            await websocket.close(code=4003)
            return

    await ws_manager.connect(room_code, websocket)
    # Broadcast joined event and fresh state
    state = get_room_state_payload(db, room)
    await ws_manager.broadcast(room_code, {"type": "ROOM_STATE", "payload": state})

    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            action = msg.get("action")

            if action == "UPDATE_STATUS":
                user_id = msg.get("user_id")
                is_focusing = msg.get("is_focusing", True)
                subject = msg.get("subject", "General Studies")
                topic = msg.get("topic", "Focus Session")

                part = (
                    db.query(RoomParticipant)
                    .filter(RoomParticipant.room_id == room.id, RoomParticipant.user_id == user_id)
                    .first()
                )
                if part:
                    part.is_focusing = is_focusing
                    part.current_subject = subject
                    part.current_topic = topic
                    db.commit()

                fresh_state = get_room_state_payload(db, room)
                await ws_manager.broadcast(room_code, {"type": "ROOM_STATE", "payload": fresh_state})

            elif action == "SESSION_COMPLETE":
                user_id = msg.get("user_id")
                part = (
                    db.query(RoomParticipant)
                    .filter(RoomParticipant.room_id == room.id, RoomParticipant.user_id == user_id)
                    .first()
                )
                if part:
                    part.completed_sessions += 1
                    part.total_minutes += msg.get("minutes", 25)
                    db.commit()

                fresh_state = get_room_state_payload(db, room)
                await ws_manager.broadcast(room_code, {
                    "type": "CELEBRATION",
                    "payload": {
                        "username": part.username if part else "An aspirant",
                        "message": f"{part.username if part else 'An aspirant'} just completed a focus session!"
                    }
                })
                await ws_manager.broadcast(room_code, {"type": "ROOM_STATE", "payload": fresh_state})

    except WebSocketDisconnect:
        ws_manager.disconnect(room_code, websocket)
        fresh_state = get_room_state_payload(db, room)
        await ws_manager.broadcast(room_code, {"type": "ROOM_STATE", "payload": fresh_state})
    except Exception:
        ws_manager.disconnect(room_code, websocket)

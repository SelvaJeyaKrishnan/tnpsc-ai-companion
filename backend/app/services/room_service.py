import json
import random
import string
from datetime import datetime, timezone
from typing import Dict, List, Optional
from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.models import RoomParticipant, StudyRoom, User


class ConnectionManager:
    def __init__(self):
        # room_code -> list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_code: str, websocket: WebSocket):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append(websocket)

    def disconnect(self, room_code: str, websocket: WebSocket):
        if room_code in self.active_connections:
            if websocket in self.active_connections[room_code]:
                self.active_connections[room_code].remove(websocket)
            if not self.active_connections[room_code]:
                del self.active_connections[room_code]

    async def broadcast(self, room_code: str, message: dict):
        if room_code in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[room_code]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    dead_connections.append(connection)
            for dead in dead_connections:
                self.disconnect(room_code, dead)


ws_manager = ConnectionManager()


def generate_room_code(db: Session) -> str:
    chars = string.ascii_uppercase + string.digits
    for _ in range(20):
        code = "".join(random.choices(chars, k=6))
        existing = db.query(StudyRoom).filter(StudyRoom.room_code == code).first()
        if not existing:
            return code
    return "".join(random.choices(chars, k=8))


def create_study_room(
    db: Session,
    user: User,
    name: str,
    description: Optional[str] = None,
    is_private: bool = False,
    pass_code: Optional[str] = None,
    duration_minutes: int = 50
) -> StudyRoom:
    code = generate_room_code(db)
    room = StudyRoom(
        room_code=code,
        name=name,
        description=description,
        is_private=is_private,
        pass_code=pass_code if is_private else None,
        created_by=user.full_name,
        duration_minutes=duration_minutes,
        started_at=datetime.now(timezone.utc),
        is_active=True
    )
    db.add(room)
    db.commit()
    db.refresh(room)

    # Add creator as first participant
    participant = RoomParticipant(
        room_id=room.id,
        user_id=user.id,
        username=user.full_name,
        is_focusing=True,
        current_subject="General Tamil",
        current_topic="பகுதி-அ: இலக்கணம்",
        completed_sessions=0,
        total_minutes=0
    )
    db.add(participant)
    db.commit()

    return room


def join_study_room(
    db: Session,
    room_code: str,
    user: User,
    pass_code: Optional[str] = None,
    subject: str = "General Studies",
    topic: str = "Focus Session"
) -> StudyRoom:
    room = db.query(StudyRoom).filter(StudyRoom.room_code == room_code.upper()).first()
    if not room:
        raise ValueError("Study room not found")
    if not room.is_active:
        raise ValueError("This study room has ended")
    if room.is_private and room.pass_code and room.pass_code != pass_code:
        raise ValueError("Invalid room pass code")

    # Check if participant already in room
    participant = (
        db.query(RoomParticipant)
        .filter(RoomParticipant.room_id == room.id, RoomParticipant.user_id == user.id)
        .first()
    )
    if not participant:
        participant = RoomParticipant(
            room_id=room.id,
            user_id=user.id,
            username=user.full_name,
            is_focusing=True,
            current_subject=subject,
            current_topic=topic,
            completed_sessions=0,
            total_minutes=0
        )
        db.add(participant)
    else:
        participant.is_focusing = True
        participant.current_subject = subject
        participant.current_topic = topic
        participant.last_seen = datetime.now(timezone.utc)

    db.commit()
    return room


def get_room_state_payload(db: Session, room: StudyRoom) -> dict:
    participants = (
        db.query(RoomParticipant)
        .filter(RoomParticipant.room_id == room.id)
        .order_by(RoomParticipant.completed_sessions.desc(), RoomParticipant.total_minutes.desc())
        .all()
    )

    elapsed_seconds = int((datetime.now(timezone.utc) - room.started_at.replace(tzinfo=timezone.utc)).total_seconds())
    total_seconds = room.duration_minutes * 60
    remaining_seconds = max(0, total_seconds - elapsed_seconds)

    return {
        "room_code": room.room_code,
        "name": room.name,
        "description": room.description,
        "is_private": room.is_private,
        "created_by": room.created_by,
        "duration_minutes": room.duration_minutes,
        "remaining_seconds": remaining_seconds,
        "is_active": room.is_active,
        "participants_count": len(participants),
        "participants": [
            {
                "user_id": p.user_id,
                "username": p.username,
                "is_focusing": p.is_focusing,
                "current_subject": p.current_subject,
                "current_topic": p.current_topic,
                "completed_sessions": p.completed_sessions,
                "total_minutes": p.total_minutes
            }
            for p in participants
        ]
    }

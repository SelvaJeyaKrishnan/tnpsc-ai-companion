from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.auth import get_current_user
from app.models import User
from app.rate_limiter import check_ai_rate_limit
from app.schemas import AiChatRequest, AiChatResponse
from app.services.ai_service import generate_ai_tutor_response

router = APIRouter(prefix="/api/ai", tags=["ai-tutor"])


@router.post("/tutor", response_model=AiChatResponse)
async def ask_ai_tutor(
    payload: AiChatRequest,
    request: Request,
    user: User = Depends(get_current_user)
):
    check_ai_rate_limit(user.id if user else 0, request)

    clean_message = payload.message.strip()
    if not clean_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty or contain only whitespace"
        )

    result = await generate_ai_tutor_response(
        message=clean_message,
        subject=payload.subject or "General Studies",
        target_exam=user.target_exam or payload.target_exam or "Group 4",
        history=payload.history
    )
    return AiChatResponse(
        reply=result["reply"],
        sources=result["sources"],
        suggested_topics=result["suggested_topics"],
        model=result["model"]
    )

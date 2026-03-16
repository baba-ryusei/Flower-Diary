from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.db import SessionLocal
from app.models import User, ChatMessage
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatResponse,
    ChatMessageHistory,
)
from app.services.ml import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message: ChatMessageCreate,
    user_id: int = Query(default=1),
    db: Session = Depends(get_db),
):
    # ユーザー確認
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="ユーザーが見つかりません"
        )
    # 会話履歴の取得
    conversation_history = (
        [{"role": msg.role, "content": msg.content} for msg in message.history]
        if message.history
        else []
    )

    # AIの返答文を生成
    chat_service = ChatService()
    reply = await chat_service.chat(
        user_message=message.content, conversation_history=conversation_history
    )

    # ユーザーメッセージとAIの返答をDBに保存
    user_message = ChatMessage(user_id=user_id, role="user", content=message.content)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    ai_message = ChatMessage(user_id=user_id, role="assistant", content=reply)
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)

    return ChatResponse(reply=reply, message_id=ai_message.id)


@router.get("/history", response_model=List[ChatMessageResponse])
async def get_chat_history(
    user_id: int = Query(default=1),
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="ユーザーが見つかりません"
        )
    # 会話履歴の取得
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return [ChatMessageResponse.from_orm(msg) for msg in messages]


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def clear_chat_histrory(
    user_id: int = Query(default=1), db: Session = Depends(get_db)
):
    db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete()
    db.commit()
    return None

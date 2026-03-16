from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class ChatMessageHistory(BaseModel):
    """クライアントから送信される会話履歴"""

    role: str
    content: str


class ChatMessageCreate(BaseModel):
    content: str
    history: Optional[List[ChatMessageHistory]] = []  # localStorageからの履歴


class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    """AI応答"""

    reply: str
    message_id: int  # 保存されたメッセージID

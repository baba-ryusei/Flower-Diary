from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class DiaryBase(BaseModel):
    content: str
    title: str | None = Field(None, max_length=100)
    mood: str | None = None
    tension: int | None = Field(None, ge=1, le=100)
    photo_url: str | None = None


class DiaryCreate(DiaryBase):
    pass


class DiaryUpdate(BaseModel):
    title: str | None = Field(None, max_length=100)
    content: str | None = None
    mood: str | None = None
    tension: int | None = Field(None, ge=1, le=100)
    photo_url: str | None = None


class DiaryResponse(DiaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    flower_image: dict | None = None
    title: str | None = None
    tension: int | None = None
    photo_url: str | None = None
    ai_comment: str | None = None

    model_config = ConfigDict(from_attributes=True)

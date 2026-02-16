from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DiaryBase(BaseModel):
    content: str
    mood: str | None = None


class DiaryCreate(DiaryBase):
    pass


class DiaryUpdate(BaseModel):
    content: str | None = None
    mood: str | None = None


class DiaryResponse(DiaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    flower_image: dict | None = None

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class DiaryBase(BaseModel):
    title: str
    content: str


class DiaryCreate(DiaryBase):
    pass


class DiaryUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class DiaryResponse(DiaryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

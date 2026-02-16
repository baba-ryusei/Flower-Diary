from datetime import datetime
from pydantic import BaseModel, ConfigDict


class FlowerImageResponse(BaseModel):
    id: int
    diary_id: int
    image_url: str
    prompt: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlowerGenerationRequest(BaseModel):
    diary_id: int

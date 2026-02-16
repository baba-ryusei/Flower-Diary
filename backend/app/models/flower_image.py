from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


class FlowerImage(Base):
    __tablename__ = "flower_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    diary_id: Mapped[int] = mapped_column(ForeignKey("diaries.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    diary: Mapped["Diary"] = relationship("Diary", back_populates="flower_images")

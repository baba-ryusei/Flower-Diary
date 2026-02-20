from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    # Relationships
    diaries: Mapped[list["Diary"]] = relationship(
        "Diary", back_populates="user", cascade="all, delete-orphan"
    )

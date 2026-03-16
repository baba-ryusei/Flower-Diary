from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db import Base


class EmotionLog(Base):
    """テンション値・感情要因・AI分析結果を記録するテーブル"""

    __tablename__ = "emotion_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    diary_id: Mapped[int] = mapped_column(
        ForeignKey("diaries.id"), nullable=False, unique=True
    )
    tension: Mapped[int] = mapped_column(Integer, nullable=False)
    # 感情レベル: "low" | "normal" | "high"
    tension_level: Mapped[str] = mapped_column(String(10), nullable=False)
    # 選択された要因キー（JSON配列: ["sleep", "work", ...]）
    factors: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    # AI生成の分析テキスト（low/highのみ）
    analysis: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    diary: Mapped["Diary"] = relationship("Diary", back_populates="emotion_log")

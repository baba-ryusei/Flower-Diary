from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from datetime import datetime

from app.db import SessionLocal
from app.models import Diary, EmotionLog
from app.services.ml import (
    EmotionAnalysisService,
    classify_tension_level,
    EMOTION_FACTORS,
)

router = APIRouter(prefix="/emotions", tags=["emotions"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Request / Response schemas ----------


class EmotionLogCreate(BaseModel):
    diary_id: int
    tension: int
    factors: List[str]


class EmotionLogResponse(BaseModel):
    id: int
    diary_id: int
    tension: int
    tension_level: str
    factors: List[str]
    analysis: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class EmotionSummaryItem(BaseModel):
    date: str
    tension: int
    tension_level: str
    factors: List[str]
    analysis: str | None


class EmotionSummary(BaseModel):
    logs: List[EmotionSummaryItem]
    total: int
    avg_tension: float | None
    # 要因別の出現回数
    factor_counts: dict
    # 感情レベル別の件数
    level_counts: dict


# ---------- Endpoints ----------


@router.post(
    "/", response_model=EmotionLogResponse, status_code=status.HTTP_201_CREATED
)
async def create_emotion_log(
    body: EmotionLogCreate,
    db: Session = Depends(get_db),
):
    """
    日記に紐づく感情ログを保存し、low/high の場合はAI分析を実行する
    """
    # 日記の存在確認
    diary = db.query(Diary).filter(Diary.id == body.diary_id).first()
    if not diary:
        raise HTTPException(status_code=404, detail="日記が見つかりません")

    # 既存ログがあれば上書き
    existing = db.query(EmotionLog).filter(EmotionLog.diary_id == body.diary_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    tension_level = classify_tension_level(body.tension)

    # AI分析（low/high のみ）
    analysis = None
    try:
        service = EmotionAnalysisService()
        analysis = await service.analyze(
            tension=body.tension,
            tension_level=tension_level,
            factors=body.factors,
            diary_content=diary.content,
        )
    except Exception as e:
        print(f"感情分析エラー（ログは保存します）: {e}")

    log = EmotionLog(
        diary_id=body.diary_id,
        tension=body.tension,
        tension_level=tension_level,
        factors=body.factors,
        analysis=analysis,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/summary", response_model=EmotionSummary)
def get_emotion_summary(
    db: Session = Depends(get_db),
):
    """
    全期間の感情ログサマリーを返す（可視化ダッシュボード用）
    """
    user_id = 1  # TODO: 認証実装後修正

    logs = (
        db.query(EmotionLog)
        .join(Diary)
        .filter(Diary.user_id == user_id)
        .order_by(EmotionLog.created_at.asc())
        .all()
    )

    if not logs:
        return EmotionSummary(
            logs=[],
            total=0,
            avg_tension=None,
            factor_counts={},
            level_counts={"low": 0, "normal": 0, "high": 0},
        )

    # 要因カウント
    factor_counts: dict[str, int] = {k: 0 for k in EMOTION_FACTORS}
    level_counts = {"low": 0, "normal": 0, "high": 0}

    for log in logs:
        for f in log.factors or []:
            if f in factor_counts:
                factor_counts[f] += 1
        level_counts[log.tension_level] = level_counts.get(log.tension_level, 0) + 1

    return EmotionSummary(
        logs=[
            EmotionSummaryItem(
                date=log.created_at.strftime("%Y-%m-%d"),
                tension=log.tension,
                tension_level=log.tension_level,
                factors=log.factors or [],
                analysis=log.analysis,
            )
            for log in logs
        ],
        total=len(logs),
        avg_tension=round(sum(l.tension for l in logs) / len(logs), 1),
        factor_counts={k: v for k, v in factor_counts.items() if v > 0},
        level_counts=level_counts,
    )


@router.get("/factors", response_model=dict)
def get_factor_definitions():
    """感情要因カテゴリのマスタ定義を返す"""
    return EMOTION_FACTORS

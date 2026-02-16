from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.db import SessionLocal
from app.models import User, Diary, FlowerImage

router = APIRouter(prefix="/admin", tags=["admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/users")
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    全ユーザーを取得（管理者用）
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}/diaries")
async def get_user_diaries(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    特定ユーザーの日記一覧を取得（管理者用）
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="ユーザーが見つかりません"
        )

    diaries = (
        db.query(Diary)
        .filter(Diary.user_id == user_id)
        .order_by(Diary.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for diary in diaries:
        diary_dict = {
            "id": diary.id,
            "user_id": diary.user_id,
            "content": diary.content,
            "mood": diary.mood,
            "created_at": diary.created_at,
            "updated_at": diary.updated_at,
            "flower_image": None,
        }

        if diary.flower_images:
            latest_image = diary.flower_images[0]
            diary_dict["flower_image"] = {
                "id": latest_image.id,
                "diary_id": latest_image.diary_id,
                "image_url": latest_image.image_url,
                "prompt": latest_image.prompt,
                "created_at": latest_image.created_at.isoformat(),
            }

        result.append(diary_dict)

    return result


@router.get("/diaries")
async def get_all_diaries(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    全日記を取得（管理者用）
    """
    diaries = (
        db.query(Diary)
        .order_by(Diary.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for diary in diaries:
        diary_dict = {
            "id": diary.id,
            "user_id": diary.user_id,
            "content": (
                diary.content[:100] + "..."
                if len(diary.content) > 100
                else diary.content
            ),
            "mood": diary.mood,
            "created_at": diary.created_at,
            "updated_at": diary.updated_at,
            "has_image": len(diary.flower_images) > 0,
        }
        result.append(diary_dict)

    return result


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """
    統計情報を取得（管理者用）
    """
    # 総ユーザー数
    total_users = db.query(func.count(User.id)).scalar()

    # 総日記数
    total_diaries = db.query(func.count(Diary.id)).scalar()

    # 総画像数
    total_images = db.query(func.count(FlowerImage.id)).scalar()

    # 今月の日記数
    now = datetime.utcnow()
    first_day_of_month = datetime(now.year, now.month, 1)
    monthly_diaries = (
        db.query(func.count(Diary.id))
        .filter(Diary.created_at >= first_day_of_month)
        .scalar()
    )

    # 最近7日間の日記数
    seven_days_ago = now - timedelta(days=7)
    weekly_diaries = (
        db.query(func.count(Diary.id))
        .filter(Diary.created_at >= seven_days_ago)
        .scalar()
    )

    return {
        "total_users": total_users,
        "total_diaries": total_diaries,
        "total_images": total_images,
        "monthly_diaries": monthly_diaries,
        "weekly_diaries": weekly_diaries,
    }

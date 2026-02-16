from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import SessionLocal
from app.models import Diary, User
from app.schemas.diary import DiaryCreate, DiaryUpdate, DiaryResponse

router = APIRouter(prefix="/diaries", tags=["diaries"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("", response_model=DiaryResponse, status_code=status.HTTP_201_CREATED)
async def create_diary(
    diary: DiaryCreate,
    user_id: int,  # TODO: 認証実装後はトークンから取得
    db: Session = Depends(get_db),
):
    """
    日記を作成
    """
    # ユーザーの存在確認
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="ユーザーが見つかりません"
        )

    # 日記作成
    db_diary = Diary(
        user_id=user_id,
        title=diary.title,
        content=diary.content,
    )
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)

    return db_diary


@router.get("", response_model=List[DiaryResponse])
async def list_diaries(
    user_id: int,  # TODO: 認証実装後はトークンから取得
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    ユーザーの日記一覧を取得
    """
    diaries = (
        db.query(Diary)
        .filter(Diary.user_id == user_id)
        .order_by(Diary.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return diaries


@router.get("/{diary_id}", response_model=DiaryResponse)
async def get_diary(
    diary_id: int,
    user_id: int,  # TODO: 認証実装後はトークンから取得
    db: Session = Depends(get_db),
):
    """
    日記詳細を取得
    """
    diary = (
        db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == user_id).first()
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="日記が見つかりません"
        )

    return diary


@router.put("/{diary_id}", response_model=DiaryResponse)
async def update_diary(
    diary_id: int,
    diary_update: DiaryUpdate,
    user_id: int,  # TODO: 認証実装後はトークンから取得
    db: Session = Depends(get_db),
):
    """
    日記を更新
    """
    diary = (
        db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == user_id).first()
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="日記が見つかりません"
        )

    # 更新
    if diary_update.title is not None:
        diary.title = diary_update.title
    if diary_update.content is not None:
        diary.content = diary_update.content

    db.commit()
    db.refresh(diary)

    return diary


@router.delete("/{diary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diary(
    diary_id: int,
    user_id: int,  # TODO: 認証実装後はトークンから取得
    db: Session = Depends(get_db),
):
    """
    日記を削除
    """
    diary = (
        db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == user_id).first()
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="日記が見つかりません"
        )

    db.delete(diary)
    db.commit()

    return None

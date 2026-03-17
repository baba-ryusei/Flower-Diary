from datetime import date, datetime
from calendar import monthrange

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from app.db import SessionLocal
from app.models import Diary, User, FlowerImage
from app.schemas.diary import DiaryCreate, DiaryUpdate, DiaryResponse
from app.services.ml import PromptBuilder, ImageGenerator, AICommentService

router = APIRouter(prefix="/diaries", tags=["diaries"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=DiaryResponse, status_code=status.HTTP_201_CREATED)
async def create_diary(
    diary: DiaryCreate,
    db: Session = Depends(get_db),
):
    """
    日記を作成し、画像を生成する
    """
    # DiaryCreateにはuser_idが含まれている必要があるので、スキーマを修正する必要がある
    # または一時的にハードコードする
    # TODO: 認証実装後はトークンから取得

    # ユーザーの存在確認 - 一時的にuser_id=1を使用
    user_id = 1  # TODO: リクエストボディから取得
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
        mood=diary.mood,
        tension=diary.tension,
        photo_url=diary.photo_url,
    )
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)

    # AIコメント生成（失敗しても日記は保存済み）
    ai_comment = None
    try:
        comment_service = AICommentService()
        ai_comment = await comment_service.generate_comment(
            diary_content=db_diary.content,
            photo_url=db_diary.photo_url,
            mood=db_diary.mood,
        )
        db_diary.ai_comment = ai_comment
        db.commit()
        db.refresh(db_diary)
    except Exception as e:
        print(f"AIコメント生成エラー（日記は保存されました）: {str(e)})")

    # 画像生成
    flower_image_data = None
    try:
        # プロンプト生成（OpenAI APIで感情分析）
        prompt_builder = PromptBuilder()
        prompt = prompt_builder.analyze_emotion_and_build_prompt(
            diary_content=db_diary.content, mood=db_diary.mood
        )

        # 画像生成（Vertex AI）
        generator = ImageGenerator()
        image_url = await generator.generate_flower_image(
            prompt=prompt, diary_id=db_diary.id
        )

        # 画像情報をDB保存
        flower_image = FlowerImage(
            diary_id=db_diary.id,
            image_url=image_url,
            prompt=prompt,
        )
        db.add(flower_image)
        db.commit()
        db.refresh(flower_image)

        flower_image_data = {
            "id": flower_image.id,
            "diary_id": flower_image.diary_id,
            "image_url": flower_image.image_url,
            "prompt": flower_image.prompt,
            "created_at": flower_image.created_at.isoformat(),
        }

    except Exception as e:
        # 画像生成失敗してもエラーにしない（日記は保存済み）
        print(f"画像生成エラー（日記は保存されました）: {str(e)}")

    return DiaryResponse(
        id=db_diary.id,
        user_id=db_diary.user_id,
        title=db_diary.title,
        content=db_diary.content,
        mood=db_diary.mood,
        created_at=db_diary.created_at,
        updated_at=db_diary.updated_at,
        flower_image=flower_image_data,
        tension=db_diary.tension,
        photo_url=db_diary.photo_url,
        ai_comment=db_diary.ai_comment,
    )


@router.get("/", response_model=List[DiaryResponse])
async def list_diaries(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    """
    ユーザーの日記一覧を取得
    """
    # TODO: 認証実装後はトークンから取得
    user_id = 1
    diaries = (
        db.query(Diary)
        .filter(Diary.user_id == user_id)
        .order_by(Diary.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return diaries


@router.get("/count", response_model=dict)
async def get_diary_count(
    db: Session = Depends(get_db),
):
    """
    日記の合計数を取得（花の成長進捗用）
    """
    user_id = 1  # TODO: 認証実装後修正
    count = db.query(Diary).filter(Diary.user_id == user_id).count()
    return {"count": count}


@router.get("/monthly", response_model=List[DiaryResponse])
async def get_diaries_by_month(
    year: int = Query(..., ge=2000, le=2100, description="年"),
    month: int = Query(..., ge=1, le=12, description="月"),
    db: Session = Depends(get_db),
):
    """
    指定した年月の日記一覧を取得（カレンダー用）
    """
    # TODO: 認証実装後はトークンから取得
    user_id = 1

    from datetime import datetime

    start_date = datetime(year, month, 1)
    _, last_day = monthrange(year, month)
    end_date = datetime(year, month, last_day, 23, 59, 59)

    diaries = (
        db.query(Diary)
        .filter(
            Diary.user_id == user_id,
            Diary.created_at >= start_date,
            Diary.created_at <= end_date,
        )
        .order_by(Diary.created_at.asc())
        .all()
    )
    return diaries


@router.get("/{diary_id}", response_model=DiaryResponse)
async def get_diary(
    diary_id: int,
    db: Session = Depends(get_db),
):
    """
    日記詳細を取得
    """
    # TODO: 認証実装後はトークンから取得
    user_id = 1
    diary = (
        db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == user_id).first()
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="日記が見つかりません"
        )

    # flower_imageを追加
    response = DiaryResponse(
        id=diary.id,
        user_id=diary.user_id,
        content=diary.content,
        mood=diary.mood,
        created_at=diary.created_at,
        updated_at=diary.updated_at,
        flower_image=None,
    )

    if diary.flower_images:
        # 最新の画像を取得
        latest_image = diary.flower_images[0]
        response.flower_image = {
            "id": latest_image.id,
            "diary_id": latest_image.diary_id,
            "image_url": latest_image.image_url,
            "prompt": latest_image.prompt,
            "created_at": latest_image.created_at.isoformat(),
        }

    return response


@router.get("/statistics", response_model=dict)
async def get_tension_statistics(
    year: int = Query(..., ge=2000, le=2100, description="年"),
    month: int = Query(..., ge=1, le=12, description="月"),
    db: Session = Depends(get_db),
):
    start_date = datetime(year, month, 1)
    if month == 12:
        end_date = datetime(year + 1, 1, 1)
    else:
        end_date = datetime(year, month + 1, 1)

    diaries = (
        db.query(Diary)
        .filter(
            Diary.user_id == 1,  # TODO: 認証実装後はトークンから取得
            Diary.created_at >= start_date,
            Diary.created_at < end_date,
            Diary.tension != None,  # tensionがnullでないものを対象
        )
        .all()
    )

    return {
        "average_tension": (
            sum(d.tension for d in diaries) / len(diaries) if diaries else None
        ),
        "max_tension": max(d.tension for d in diaries) if diaries else None,
        "min_tension": min(d.tension for d in diaries) if diaries else None,
    }


@router.put("/{diary_id}", response_model=DiaryResponse)
async def update_diary(
    diary_id: int,
    diary_update: DiaryUpdate,
    db: Session = Depends(get_db),
):
    """
    日記を更新
    """
    # TODO: 認証実装後はトークンから取得
    user_id = 1
    diary = (
        db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == user_id).first()
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="日記が見つかりません"
        )

    # 更新
    if diary_update.content is not None:
        diary.content = diary_update.content
    if diary_update.mood is not None:
        diary.mood = diary_update.mood

    db.commit()
    db.refresh(diary)

    return diary


@router.delete("/{diary_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diary(
    diary_id: int,
    db: Session = Depends(get_db),
):
    """
    日記を削除
    """
    # TODO: 認証実装後はトークンから取得
    user_id = 1
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

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db import SessionLocal
from app.models import Diary, FlowerImage
from app.schemas.flower import FlowerImageResponse, FlowerGenerationRequest
from app.services.ml import ImageGenerator, PromptBuilder

router = APIRouter(prefix="/flowers", tags=["flowers"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/generate", response_model=FlowerImageResponse, status_code=status.HTTP_201_CREATED
)
async def generate_flower_image(
    request: FlowerGenerationRequest,
    user_id: int,  # TODO: 認証実装後はトークンから取得
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    日記から花の画像を生成
    """
    # 日記の存在確認
    diary = (
        db.query(Diary)
        .filter(Diary.id == request.diary_id, Diary.user_id == user_id)
        .first()
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="日記が見つかりません"
        )

    # プロンプト生成
    prompt_builder = PromptBuilder()
    prompt = prompt_builder.analyze_emotion_and_build_prompt(
        diary_content=diary.content, mood=diary.mood
    )

    # 画像生成（Vertex AI）
    try:
        generator = ImageGenerator()
        image_url = await generator.generate_flower_image(
            prompt=prompt, diary_id=diary.id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"画像生成に失敗しました: {str(e)}",
        )

    # DB保存
    flower_image = FlowerImage(
        diary_id=diary.id,
        image_url=image_url,
        prompt=prompt,
    )
    db.add(flower_image)
    db.commit()
    db.refresh(flower_image)

    return flower_image


@router.get("/diary/{diary_id}", response_model=List[FlowerImageResponse])
async def get_diary_flowers(
    diary_id: int,
    user_id: int,  # TODO: 認証実装後はトークンから取得
    db: Session = Depends(get_db),
):
    """
    日記に紐づく花画像一覧を取得
    """
    # 日記の存在確認
    diary = (
        db.query(Diary).filter(Diary.id == diary_id, Diary.user_id == user_id).first()
    )

    if not diary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="日記が見つかりません"
        )

    # 花画像取得
    flower_images = (
        db.query(FlowerImage)
        .filter(FlowerImage.diary_id == diary_id)
        .order_by(FlowerImage.created_at.desc())
        .all()
    )

    return flower_images


@router.get("/{flower_id}", response_model=FlowerImageResponse)
async def get_flower_image(
    flower_id: int,
    user_id: int,  # TODO: 認証実装後はトークンから取得
    db: Session = Depends(get_db),
):
    """
    花画像の詳細を取得
    """
    flower_image = (
        db.query(FlowerImage)
        .join(Diary)
        .filter(FlowerImage.id == flower_id, Diary.user_id == user_id)
        .first()
    )

    if not flower_image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="画像が見つかりません"
        )

    return flower_image

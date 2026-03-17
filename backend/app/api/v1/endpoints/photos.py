"""
ユーザー写真のアップロードエンドポイント
POST /api/v1/photos/upload → GCS保存 → 公開URL返却
"""

import io
from datetime import datetime

from fastapi import APIRouter, HTTPException, UploadFile, File, status
from google.cloud import storage

from app.core.config import settings

router = APIRouter(prefix="/photos", tags=["photos"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload", status_code=status.HTTP_200_OK)
async def upload_photo(file: UploadFile = File(...)):
    """
    日記に添付する写真をGCSにアップロードし、公開URLを返す。
    """
    # ファイルタイプ検証
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"対応していないファイル形式です。JPEG / PNG / WebP / GIF のみ使用できます。",
        )

    file_bytes = await file.read()

    # ファイルサイズ検証
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ファイルサイズが大きすぎます（上限10MB）",
        )

    ext = file.content_type.split("/")[-1]
    if ext == "jpeg":
        ext = "jpg"

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
    blob_name = f"user-photos/{timestamp}.{ext}"

    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(settings.GCS_BUCKET_NAME)
        blob = bucket.blob(blob_name)
        blob.upload_from_file(io.BytesIO(file_bytes), content_type=file.content_type)
        blob.make_public()
        public_url = blob.public_url
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"写真のアップロードに失敗しました: {str(e)}",
        )

    return {"photo_url": public_url}

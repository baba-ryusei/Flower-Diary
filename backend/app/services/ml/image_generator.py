"""
Vertex AI Imagen APIを使用して画像を生成する
"""

import base64
from datetime import datetime
from google.cloud import aiplatform
from google.cloud import storage
from app.core.config import settings


class ImageGenerator:
    def __init__(self):
        # Vertex AI初期化
        aiplatform.init(
            project=settings.GCP_PROJECT_ID,
            location=settings.GCP_LOCATION,
        )
        self.storage_client = storage.Client()
        self.bucket = self.storage_client.bucket(settings.GCS_BUCKET_NAME)

    async def generate_flower_image(self, prompt: str, diary_id: int) -> str:
        """
        プロンプトから花の画像を生成し、GCSに保存

        Args:
            prompt: 画像生成用プロンプト
            diary_id: 日記ID

        Returns:
            生成された画像のGCS URL
        """
        try:
            # Vertex AI Imagen APIで画像生成
            model = aiplatform.ImageGenerationModel.from_pretrained(
                settings.VERTEX_AI_MODEL
            )

            # 画像生成リクエスト
            response = model.generate_images(
                prompt=prompt,
                number_of_images=1,
                aspect_ratio="1:1",
                safety_filter_level="block_some",
                person_generation="allow_adult",
            )

            # 生成された画像を取得
            image = response.images[0]
            image_bytes = image._image_bytes

            # GCSに保存
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            blob_name = f"flowers/diary_{diary_id}_{timestamp}.png"
            blob = self.bucket.blob(blob_name)

            blob.upload_from_string(image_bytes, content_type="image/png")

            # 公開URLを取得
            blob.make_public()
            image_url = blob.public_url

            return image_url

        except Exception as e:
            raise Exception(f"画像生成エラー: {str(e)}")

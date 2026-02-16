import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # GCP Settings
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "frower-diary-gcp")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "asia-northeast1")

    # Cloud Storage
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "flower-diary-images")

    # Vertex AI
    VERTEX_AI_MODEL: str = os.getenv("VERTEX_AI_MODEL", "imagegeneration@006")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+pysqlite:///./local.db")


settings = Settings()

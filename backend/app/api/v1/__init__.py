from fastapi import APIRouter
from app.api.v1.endpoints import diaries, flowers

api_router = APIRouter()

api_router.include_router(diaries.router)
api_router.include_router(flowers.router)

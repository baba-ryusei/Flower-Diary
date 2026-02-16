from fastapi import APIRouter
from app.api.v1.endpoints import diaries, flowers, admin

api_router = APIRouter()

api_router.include_router(diaries.router)
api_router.include_router(flowers.router)
api_router.include_router(admin.router)

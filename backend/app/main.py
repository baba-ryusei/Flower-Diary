import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import Base, engine, SessionLocal
from .models import User
from .api.v1 import api_router

app = FastAPI(title="Flower Diary API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3005"],  # Next.jsのポート
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 一時的にDBがなくても起動できるようにするため
if os.getenv("RUN_MIGRATIONS", "false").lower() == "true":
    Base.metadata.create_all(bind=engine)

# API v1ルーターを追加
app.include_router(api_router, prefix="/api/v1")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/users")
def create_user(name: str, db: Session = Depends(get_db)):
    user = User(name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name}


@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id).all()
    return [{"id": u.id, "name": u.name} for u in users]

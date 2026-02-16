# Flower Diary

友達との関係を記録し、振り返ることができる日記アプリケーション

## 技術スタック

### Backend
- **FastAPI** - Pythonの高速Webフレームワーク
- **SQLAlchemy** - ORM
- **Alembic** - データベースマイグレーション
- **PostgreSQL** - データベース
- **Docker** - コンテナ化

### Frontend
- **Next.js 16** - Reactフレームワーク
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **pnpm** - パッケージマネージャー

## ディレクトリ構成

```
fr-diary/
├── backend/
│   ├── app/
│   │   ├── models/              # データベースモデル
│   │   │   ├── __init__.py
│   │   │   └── user.py
│   │   ├── db.py                # データベース設定
│   │   └── main.py              # FastAPIアプリケーション
│   ├── alembic/                 # マイグレーションファイル
│   │   ├── versions/
│   │   └── env.py
│   ├── infra/
│   │   └── docker-compose.yml   # ローカル開発用DB
│   ├── Dockerfile
│   ├── Makefile                 # 開発用コマンド
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   └── src/
│       └── app/
│           ├── user/            # ユーザー画面
│           │   ├── layout.tsx
│           │   ├── page.tsx
│           │   └── users/
│           │       └── page.tsx
│           ├── admin/           # 管理画面
│           │   ├── layout.tsx
│           │   ├── dashboard/
│           │   │   └── page.tsx
│           │   ├── users/
│           │   │   └── page.tsx
│           │   └── settings/
│           │       └── page.tsx
│           ├── layout.tsx       # ルートレイアウト
│           └── globals.css
│
└── .github/
    └── workflows/
        └── ci.yml               # CI/CDパイプライン
```

## セットアップ

### Backend

```bash
cd backend

# 仮想環境を作成
python -m venv fr_env
source fr_env/bin/activate

# 依存関係をインストール
pip install -r requirements.txt

# データベースを起動
make db-up

# マイグレーションを実行
make upgrade

# 開発サーバーを起動
make dev
```

### Frontend

```bash
cd frontend

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

## 開発用コマンド

### Backend

```bash
make db-up              # データベースを起動
make db-down            # データベースを停止
make db-reset           # データベースをリセット
make format             # コードフォーマット (Black)
make lint               # リントチェック (Flake8)
make generate           # マイグレーションファイルを生成
make upgrade            # マイグレーションを実行
make downgrade          # マイグレーションを1つ戻す
make dev                # 開発サーバーを起動
```

### Frontend

```bash
pnpm dev                # 開発サーバーを起動
pnpm build              # プロダクションビルド
pnpm lint               # ESLintチェック
```

## デプロイ

### Backend (Google Cloud Run)
- `main`ブランチへのpushで自動デプロイ
- Artifact RegistryにDockerイメージをプッシュ
- Cloud Runへ自動デプロイ

### Frontend (Vercel)
- Vercelと連携して自動デプロイ

## URL

- **フロントエンド（ユーザー）**: http://localhost:3005/user
- **フロントエンド（管理画面）**: http://localhost:3005/admin/dashboard
- **バックエンドAPI**: http://localhost:8005/
- **API ヘルスチェック**: http://localhost:8005/health

## 環境変数

### Backend (.env)
```
DATABASE_URL=postgresql://myuser:mypassword@localhost:5434/mydb
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8005
```

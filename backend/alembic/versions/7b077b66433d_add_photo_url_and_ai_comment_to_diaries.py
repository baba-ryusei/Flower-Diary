"""add_photo_url_and_ai_comment_to_diaries

Revision ID: 7b077b66433d
Revises: b8736ab533c4
Create Date: 2026-03-17 11:29:00.392246

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b077b66433d'
down_revision: Union[str, None] = 'b8736ab533c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('diaries', sa.Column('photo_url', sa.Text(), nullable=True))
    op.add_column('diaries', sa.Column('ai_comment', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('diaries', 'ai_comment')
    op.drop_column('diaries', 'photo_url')

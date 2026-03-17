"""add_title_to_diaries

Revision ID: 86304d3576c1
Revises: 7b077b66433d
Create Date: 2026-03-17 11:36:57.853153

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86304d3576c1'
down_revision: Union[str, None] = '7b077b66433d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('diaries', sa.Column('title', sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column('diaries', 'title')

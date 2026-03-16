"""add emotion_logs table

Revision ID: b8736ab533c4
Revises: 8c1f39b2edee
Create Date: 2026-03-17 01:05:02.856939

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8736ab533c4'
down_revision: Union[str, None] = '8c1f39b2edee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'emotion_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('diary_id', sa.Integer(), sa.ForeignKey('diaries.id'), nullable=False),
        sa.Column('tension', sa.Integer(), nullable=False),
        sa.Column('tension_level', sa.String(10), nullable=False),
        sa.Column('factors', sa.JSON(), nullable=False),
        sa.Column('analysis', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('diary_id'),
    )


def downgrade() -> None:
    op.drop_table('emotion_logs')

"""add_has_medical_book

Revision ID: dd55a1112222
Revises: cc49e622d699
Create Date: 2026-04-22 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dd55a1112222'
down_revision: Union[str, Sequence[str], None] = 'cc49e622d699'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add has_medical_book column to job_seeker_profiles
    op.add_column('job_seeker_profiles', sa.Column('has_medical_book', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('job_seeker_profiles', 'has_medical_book')

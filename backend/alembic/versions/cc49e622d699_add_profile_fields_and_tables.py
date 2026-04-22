"""add_profile_fields_and_tables

Revision ID: cc49e622d699
Revises: df3f689bab79
Create Date: 2026-04-22 08:58:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc49e622d699'
down_revision: Union[str, Sequence[str], None] = 'df3f689bab79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to job_seeker_profiles
    op.add_column('job_seeker_profiles', sa.Column('phone', sa.String(length=50), nullable=True))
    op.add_column('job_seeker_profiles', sa.Column('email', sa.String(length=255), nullable=True))
    op.add_column('job_seeker_profiles', sa.Column('address', sa.Text(), nullable=True))
    op.add_column('job_seeker_profiles', sa.Column('medical_book_expires_at', sa.Date(), nullable=True))

    # Create language_records table
    op.create_table('language_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_seeker_id', sa.Integer(), nullable=False),
        sa.Column('language_name', sa.String(length=100), nullable=False),
        sa.Column('level', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['job_seeker_id'], ['job_seeker_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create certificate_records table
    op.create_table('certificate_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_seeker_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('organization', sa.String(length=255), nullable=False),
        sa.Column('issue_date', sa.Date(), nullable=True),
        sa.Column('expiration_date', sa.Date(), nullable=True),
        sa.Column('credential_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['job_seeker_id'], ['job_seeker_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('certificate_records')
    op.drop_table('language_records')
    op.drop_column('job_seeker_profiles', 'medical_book_expires_at')
    op.drop_column('job_seeker_profiles', 'address')
    op.drop_column('job_seeker_profiles', 'email')
    op.drop_column('job_seeker_profiles', 'phone')

import asyncio
import sys
import os

# Add parent directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine, Base
from app.models import *  # Import models to ensure they are registered with Base

async def reset_database():
    print("Warning: This will drop ALL tables in the database!")
    confirm = input("Type 'YES' to confirm: ") if sys.stdin.isatty() else "YES"
    
    if confirm != "YES":
        print("Reset cancelled.")
        return

    async with engine.begin() as conn:
        print("Dropping all tables...")
        # Drop all tables manually to ensure clean slate with Alembic
        await conn.run_sync(Base.metadata.drop_all)
        
        # Also clear alembic version table if it exists
        await conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
        
    print("Database has been reset. Now run migrations to recreate tables.")

if __name__ == "__main__":
    asyncio.run(reset_database())

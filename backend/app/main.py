from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from .routers.auth import router as auth_router
from .routers.vacancies import router as vacancies_router
from .routers.applications import router as applications_router
from .routers.profiles import router as profiles_router
from .routers.workers import router as workers_router
from .routers.employer import router as employer_router
from .routers.favorites import router as favorites_router
from .routers.messages import router as messages_router
from .routers.admin import router as admin_router
from .routers.stats import router as stats_router
from .routers.uploads import router as uploads_router
from fastapi.staticfiles import StaticFiles
import os

# Ensure static directories exist before mounting
os.makedirs("static", exist_ok=True)
os.makedirs("static/uploads", exist_ok=True)

app = FastAPI(
    title="Ish-Top API",
    description="Backend for Job Search Platform for Kindergarten Staff",
    version="1.0.0",
)

# Startup check for production config
@app.on_event("startup")
async def startup_event():
    from .config import settings
    
    logger.info("=== STARTUP CONFIG CHECK ===")
    logger.info(f"DATABASE_URL ends with: ...{settings.DATABASE_URL[-10:] if settings.DATABASE_URL else 'NONE'}")
    logger.info(f"SECRET_KEY set: {bool(settings.SECRET_KEY)} (len: {len(settings.SECRET_KEY)})")
    logger.info(f"TELEGRAM_BOT_TOKEN set: {bool(settings.TELEGRAM_BOT_TOKEN)}")
    logger.info("==============================")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "https://ish-top.uz",      # Production domain (example)
        "https://admin.ish-top.uz" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Global error logging
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    import traceback
    logger.error(f"GLOBAL ERROR: {exc}")
    logger.error(traceback.format_exc())
    return {
        "detail": "Internal Server Error. Check server logs."
    }

# Include routers
app.include_router(profiles_router, prefix="/api/v1")
app.include_router(employer_router, prefix="/api/v1")
app.include_router(vacancies_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
app.include_router(workers_router, prefix="/api/v1")
app.include_router(favorites_router, prefix="/api/v1")
app.include_router(messages_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(uploads_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Ish-Top API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

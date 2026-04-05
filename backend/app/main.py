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

app = FastAPI(
    title="Ish-Top API",
    description="Backend for Job Search Platform for Kindergarten Staff",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profiles_router, prefix="/api/v1")
app.include_router(employer_router, prefix="/api/v1")
app.include_router(vacancies_router, prefix="/api/v1")
app.include_router(applications_router, prefix="/api/v1")
app.include_router(workers_router, prefix="/api/v1")
app.include_router(favorites_router, prefix="/api/v1")
app.include_router(messages_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
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

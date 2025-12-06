from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import time

from app.routers import generate
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Malaysian letter generator",
    docs_url="/docs" if settings.DEBUG else None
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    logger.info(f"→ {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    duration = time.time() - start
    logger.info(f"← {request.method} {request.url.path} - {response.status_code} - {duration:.3f}s")
    response.headers["X-Process-Time"] = str(duration)
    
    return response

# Include routers
app.include_router(generate.router)

# Health check
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "service": settings.APP_NAME
    }

# Root
@app.get("/")
async def root():
    return {
        "message": "Welcome to Catat API",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.DEBUG else "Disabled"
    }

@app.on_event("startup")
async def startup():
    logger.info("🚀 Catat API starting...")
    logger.info(f"Environment: {'Development' if settings.DEBUG else 'Production'}")

@app.on_event("shutdown")
async def shutdown():
    logger.info("🛑 Catat API shutting down...")
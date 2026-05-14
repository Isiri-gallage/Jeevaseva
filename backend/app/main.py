from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import time

from app.core.database import engine, Base
from app.models import User, BloodRequest, Donation, ChatMessage, KidneyRequest, KidneyDonor
from app.api.v1 import auth, blood_requests, donors, chat, admin, kidney

# ─── Logging Setup ─────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ─── Rate Limiter ──────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ─── Create Tables ─────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App Instance ──────────────────────────────────────────
app = FastAPI(
    title="RaktaSeva API 🩸",
    description="""
    ## RaktaSeva — Blood & Organ Donor Network

    Connecting blood and kidney donors with patients in need across Sri Lanka.

    ### Features
    * 🩸 **Blood Donation** — Emergency blood requests & donor matching
    * 🫀 **Kidney Donation** — Patient requests & living donor registration
    * 💬 **Real-time Chat** — WebSocket communication between donors & patients
    * 👑 **Admin Panel** — User management & platform monitoring

    ### Authentication
    Use JWT Bearer token for all protected endpoints.
    """,
    version="1.0.0",
    contact={
        "name": "Isiri Gallage",
        "url": "https://github.com/Isiri-gallage/RaktaSeva",
    },
    license_info={
        "name": "MIT",
    },
)

# ─── Rate Limiter Setup ────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS Middleware ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Logging Middleware ────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} "
        f"- Status: {response.status_code} "
        f"- Time: {process_time:.3f}s"
    )
    return response

# ─── Global Exception Handler ──────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc} - Path: {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."}
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": f"Resource not found: {request.url.path}"}
    )

@app.exception_handler(405)
async def method_not_allowed_handler(request: Request, exc):
    return JSONResponse(
        status_code=405,
        content={"detail": "Method not allowed"}
    )

# ─── Routes ────────────────────────────────────────────────
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["🔐 Authentication"]
)
app.include_router(
    blood_requests.router,
    prefix="/api/v1/requests",
    tags=["🩸 Blood Requests"]
)
app.include_router(
    donors.router,
    prefix="/api/v1/donors",
    tags=["❤️ Donors"]
)
app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["💬 Chat"]
)
app.include_router(
    admin.router,
    prefix="/api/v1/admin",
    tags=["👑 Admin"]
)
app.include_router(
    kidney.router,
    prefix="/api/v1/kidney",
    tags=["🫀 Kidney"]
)

# ─── Root Endpoints ────────────────────────────────────────
@app.get("/", tags=["Root"], summary="API Welcome")
async def root():
    return {
        "app": "RaktaSeva",
        "version": "1.0.0",
        "message": "Serving Life Through Blood & Organ Donation 🩸🫀",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "auth": "/api/v1/auth",
            "blood_requests": "/api/v1/requests",
            "donors": "/api/v1/donors",
            "chat": "/api/v1/chat",
            "admin": "/api/v1/admin",
            "kidney": "/api/v1/kidney",
        }
    }

@app.get("/health", tags=["Root"], summary="Health Check")
async def health_check():
    return {
        "status": "healthy",
        "app": "RaktaSeva",
        "version": "1.0.0",
        "database": "connected",
    }
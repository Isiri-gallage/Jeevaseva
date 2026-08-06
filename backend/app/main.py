import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.core.rate_limit import limiter
from app.api.v1 import auth, blood_requests, donors, chat, admin, kidney

# ─── Logging Setup ─────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "RaktaSeva API starting (environment=%s, cors_origins=%s)",
        settings.ENVIRONMENT,
        settings.cors_origins,
    )
    yield
    logger.info("RaktaSeva API shutting down")


# ─── App Instance ──────────────────────────────────────────
# Schema is managed by Alembic ("alembic upgrade head"), not create_all(), so
# that column changes actually reach an existing database.
app = FastAPI(
    lifespan=lifespan,
    title="RaktaSeva API",
    description="""
    ## RaktaSeva — Kidney & Blood Donor Network

    Helping kidney patients in Sri Lanka find living donors, with blood
    donation matching alongside it.

    ### Features
    * **Kidney Donation** — Patient requests, living donor registry, match workflow
    * **Blood Donation** — Emergency requests & donor matching
    * **Real-time Chat** — Authenticated WebSocket messaging between matched parties
    * **Admin Panel** — User management & platform monitoring

    ### Authentication
    Send `Authorization: Bearer <token>` on protected endpoints. For the chat
    WebSocket, first call `POST /api/v1/chat/ws-ticket` and pass the returned
    ticket as `?ticket=` on the socket URL.
    """,
    version="1.0.0",
    contact={
        "name": "Isiri Gallage",
        "url": "https://github.com/Isiri-gallage/RaktaSeva",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# ─── Rate Limiter ──────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS Middleware ───────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
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
        "%s %s - Status: %s - Time: %.3fs",
        request.method, request.url.path, response.status_code, process_time,
    )
    return response


# ─── Global Exception Handler ──────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # exc_info=True so the stack trace reaches the logs while the client only
    # ever sees a generic message.
    logger.error("Unhandled error on %s", request.url.path, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again later."},
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": f"Resource not found: {request.url.path}"},
    )


@app.exception_handler(405)
async def method_not_allowed_handler(request: Request, exc):
    return JSONResponse(
        status_code=405,
        content={"detail": "Method not allowed"},
    )


# ─── Routes ────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(kidney.router, prefix="/api/v1/kidney", tags=["Kidney"])
app.include_router(blood_requests.router, prefix="/api/v1/requests", tags=["Blood Requests"])
app.include_router(donors.router, prefix="/api/v1/donors", tags=["Donors"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


# ─── Root Endpoints ────────────────────────────────────────
@app.get("/", tags=["Root"], summary="API Welcome")
async def root():
    return {
        "app": "RaktaSeva",
        "version": "1.0.0",
        "message": "Connecting kidney patients with living donors across Sri Lanka",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "auth": "/api/v1/auth",
            "kidney": "/api/v1/kidney",
            "blood_requests": "/api/v1/requests",
            "donors": "/api/v1/donors",
            "chat": "/api/v1/chat",
            "admin": "/api/v1/admin",
        },
    }


@app.get("/health", tags=["Root"], summary="Health Check")
async def health_check():
    """Liveness + database readiness. Returns 503 if the database is unreachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        database_status = "connected"
    except Exception:
        logger.error("Health check failed: database unreachable", exc_info=True)
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "app": "RaktaSeva",
                "version": "1.0.0",
                "database": "unreachable",
            },
        )

    return {
        "status": "healthy",
        "app": "RaktaSeva",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": database_status,
    }

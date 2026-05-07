from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import User, BloodRequest, Donation, ChatMessage
from app.api.v1 import auth, blood_requests, donors, chat

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RaktaSeva API 🩸",
    description="Connecting blood donors with patients in need across Sri Lanka",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(blood_requests.router, prefix="/api/v1/requests", tags=["Blood Requests"])
app.include_router(donors.router, prefix="/api/v1/donors", tags=["Donors"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])

@app.get("/", tags=["Root"])
def root():
    return {
        "app": "RaktaSeva",
        "message": "Serving Life Through Blood 🩸",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health", tags=["Root"])
def health_check():
    return {"status": "healthy"}
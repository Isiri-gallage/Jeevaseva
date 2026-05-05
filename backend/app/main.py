from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
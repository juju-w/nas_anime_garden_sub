from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.db.init_db import init_db
from app.tasks.scheduler import task_scheduler

app = FastAPI(title="NAS Anime Garden Subscription API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    # Initialize database
    init_db()
    
    # Start background task scheduler
    task_scheduler.start()

@app.get("/")
async def root():
    return {"message": "NAS Anime Garden Subscription Tool API is running"}

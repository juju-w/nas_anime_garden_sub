from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import api_router
from app.db.init_db import init_db
from app.tasks.scheduler import task_scheduler
import os

app = FastAPI(title="NAS Anime Garden Subscription API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

# Mount static files (Frontend)
# In Docker, the path will be /app/static
static_path = "/app/static" if os.path.exists("/app/static") else "./backend/app/static"
if os.path.exists(static_path):
    app.mount("/", StaticFiles(directory=static_path, html=True), name="static")

@app.on_event("startup")
async def startup_event():
    # Initialize database
    init_db()
    
    # Start background task scheduler
    task_scheduler.start()

@app.get("/")
async def root():
    return {"message": "NAS Anime Garden Subscription Tool API is running"}

from fastapi import APIRouter
from app.api.v1.endpoints import subscriptions, history, settings

api_router = APIRouter()
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])

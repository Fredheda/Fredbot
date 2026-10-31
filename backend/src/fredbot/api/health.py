from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from fredbot import __version__
from fredbot.config import Settings, get_settings

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    app: str
    version: str


@router.get("/health", response_model=HealthResponse)
def health(settings: Annotated[Settings, Depends(get_settings)]) -> HealthResponse:
    return HealthResponse(status="ok", app=settings.app_name, version=__version__)

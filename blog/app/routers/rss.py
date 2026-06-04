from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import rss_service

router = APIRouter(prefix="/api", tags=["rss"])


@router.get("/rss")
def rss(request: Request, db: Session = Depends(get_db)):
    base_url = str(request.base_url).rstrip("/")
    rss_content = rss_service.generate_rss(db, base_url)
    return Response(content=rss_content, media_type="application/rss+xml")

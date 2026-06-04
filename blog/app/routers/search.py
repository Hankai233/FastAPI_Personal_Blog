from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.post import PostListRead
from app.services import search_service

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("")
def search(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db),
):
    posts, total = search_service.search_posts(db, q, page=page)
    return {
        "data": [PostListRead.model_validate(p) for p in posts],
        "total": total,
        "page": page,
        "page_size": 10,
    }

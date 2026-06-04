from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.comment import CommentCreate, CommentRead
from app.services import comment_service
from app.models.user import User

router = APIRouter(prefix="/api/posts", tags=["comments"])
admin_router = APIRouter(prefix="/api/admin/comments", tags=["admin-comments"])


@router.get("/{slug}/comments", response_model=list[CommentRead])
def list_comments(slug: str, db: Session = Depends(get_db)):
    comments = comment_service.get_comments_for_post(db, slug)
    return comments


@router.post("/{slug}/comments", response_model=CommentRead, status_code=201)
def create_comment(slug: str, body: CommentCreate, db: Session = Depends(get_db)):
    return comment_service.create_comment(db, slug, body.model_dump())


@admin_router.get("", response_model=list[CommentRead])
def list_pending_comments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return comment_service.get_pending_comments(db)


@admin_router.put("/{comment_id}/approve", response_model=CommentRead)
def approve_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return comment_service.approve_comment(db, comment_id)


@admin_router.delete("/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment_service.delete_comment(db, comment_id)
    return {"message": "deleted"}

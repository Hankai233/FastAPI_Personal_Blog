from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.post import PostCreate, PostUpdate, PostRead, PostListRead
from app.services import post_service
from app.models.user import User

router = APIRouter(prefix="/api/posts", tags=["posts"])
admin_router = APIRouter(prefix="/api/admin/posts", tags=["admin-posts"])


@router.get("")
def list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    tag: str | None = None,
    db: Session = Depends(get_db),
):
    posts, total = post_service.get_posts(db, page=page, page_size=page_size, tag_slug=tag, status="published")
    return {
        "data": [PostListRead.model_validate(p) for p in posts],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{slug}", response_model=PostRead)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = post_service.get_post_by_slug(db, slug, status="published")
    return post


@admin_router.get("")
def admin_list_posts(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    posts, total = post_service.get_posts(db, page=page, page_size=page_size, status=status)
    return {
        "data": [PostListRead.model_validate(p) for p in posts],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@admin_router.get("/{slug}")
def admin_get_post(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = post_service.get_post_by_slug(db, slug)
    return {
        "id": post.id,
        "title": post.title,
        "slug": post.slug,
        "content_md": post.content_md,
        "content_html": post.content_html,
        "excerpt": post.excerpt,
        "status": post.status.value,
        "tags": [{"id": t.id, "name": t.name, "slug": t.slug} for t in post.tags],
        "author_id": post.author_id,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "updated_at": post.updated_at.isoformat() if post.updated_at else None,
        "published_at": post.published_at.isoformat() if post.published_at else None,
    }


@admin_router.post("", response_model=PostRead, status_code=201)
def create_post(
    body: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = body.model_dump()
    data["author_id"] = current_user.id
    return post_service.create_post(db, data)


@admin_router.put("/{slug}", response_model=PostRead)
def update_post(
    slug: str,
    body: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    return post_service.update_post(db, slug, data)


@admin_router.delete("/{slug}")
def delete_post(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post_service.delete_post(db, slug)
    return {"message": "deleted"}

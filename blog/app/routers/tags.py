from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.exceptions import AppException
from app.dependencies import get_current_user
from app.schemas.tag import TagCreate, TagUpdate, TagRead
from app.models.tag import Tag, post_tags
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/tags", tags=["tags"])
admin_router = APIRouter(prefix="/api/admin/tags", tags=["admin-tags"])


class TagWithCount(BaseModel):
    id: int
    name: str
    slug: str
    post_count: int

    model_config = {"from_attributes": True}


@router.get("", response_model=list[TagRead])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()


@router.get("/popular", response_model=list[TagWithCount])
def list_popular_tags(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    tags_with_counts = (
        db.query(Tag, func.count(post_tags.c.post_id).label("post_count"))
        .outerjoin(post_tags)
        .group_by(Tag.id)
        .order_by(func.count(post_tags.c.post_id).desc())
        .limit(limit)
        .all()
    )
    return [
        TagWithCount(
            id=tag.id,
            name=tag.name,
            slug=tag.slug,
            post_count=count,
        )
        for tag, count in tags_with_counts
    ]


@router.get("/{slug}", response_model=TagRead)
def get_tag(slug: str, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.slug == slug).first()
    if not tag:
        raise AppException(status_code=404, detail="Tag not found")
    return tag


@admin_router.post("", response_model=TagRead, status_code=201)
def create_tag(
    body: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Tag).filter((Tag.name == body.name) | (Tag.slug == body.slug)).first()
    if existing:
        raise AppException(status_code=400, detail="Tag already exists")
    tag = Tag(name=body.name, slug=body.slug)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@admin_router.put("/{tag_id}", response_model=TagRead)
def update_tag(
    tag_id: int,
    body: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise AppException(status_code=404, detail="Tag not found")
    if body.name is not None:
        tag.name = body.name
    if body.slug is not None:
        existing = db.query(Tag).filter(Tag.slug == body.slug, Tag.id != tag_id).first()
        if existing:
            raise AppException(status_code=400, detail="Slug already taken")
        tag.slug = body.slug
    db.commit()
    db.refresh(tag)
    return tag


@admin_router.delete("/{tag_id}")
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise AppException(status_code=404, detail="Tag not found")
    db.delete(tag)
    db.commit()
    return {"message": "deleted"}

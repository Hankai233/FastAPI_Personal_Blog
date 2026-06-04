from datetime import datetime, timezone
import re
import markdown
import bleach
from sqlalchemy.orm import Session
from app.models.post import Post, PostStatus
from app.models.tag import Tag
from app.core.exceptions import AppException


def render_markdown(md_text: str) -> str:
    html = markdown.markdown(md_text, extensions=["fenced_code", "codehilite", "tables"])
    allowed_tags = list(bleach.ALLOWED_TAGS) + [
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "br", "pre", "code", "img", "table", "thead", "tbody",
        "tr", "th", "td", "blockquote", "hr", "span", "div",
    ]
    allowed_attrs = {**bleach.ALLOWED_ATTRIBUTES, "img": ["src", "alt", "title"],
                     "code": ["class"], "span": ["class"], "div": ["class"]}
    return bleach.clean(html, tags=allowed_tags, attributes=allowed_attrs, strip=True)


def auto_excerpt(html: str, max_length: int = 500) -> str:
    text = bleach.clean(html, tags=[], strip=True)
    return text[:max_length]


def auto_slugify(title: str) -> str:
    slug = title.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[-\s]+", "-", slug)
    return slug.strip("-")


def get_posts(
    db: Session, *, page: int = 1, page_size: int = 10,
    tag_slug: str | None = None, status: str | None = None,
) -> tuple[list[Post], int]:
    query = db.query(Post)
    if status:
        query = query.filter(Post.status == PostStatus(status))
    else:
        query = query.filter(Post.status == PostStatus.published)

    if tag_slug:
        tag = db.query(Tag).filter(Tag.slug == tag_slug).first()
        if tag:
            query = query.filter(Post.tags.contains(tag))

    total = query.count()
    posts = query.order_by(Post.published_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return posts, total


def get_post_by_slug(db: Session, slug: str, *, status: str | None = None) -> Post:
    query = db.query(Post).filter(Post.slug == slug)
    if status:
        query = query.filter(Post.status == PostStatus(status))
    post = query.first()
    if not post:
        raise AppException(status_code=404, detail="Post not found")
    return post


def create_post(db: Session, data: dict) -> Post:
    existing = db.query(Post).filter(Post.slug == data["slug"]).first()
    if existing:
        raise AppException(status_code=400, detail="Slug already exists")

    content_html = render_markdown(data["content_md"])
    post = Post(
        title=data["title"],
        slug=data["slug"],
        content_md=data["content_md"],
        content_html=content_html,
        excerpt=data.get("excerpt") or auto_excerpt(content_html),
        status=PostStatus(data.get("status", "draft")),
        author_id=data["author_id"],
    )
    if post.status == PostStatus.published:
        post.published_at = datetime.now(timezone.utc)

    if tag_ids := data.get("tag_ids"):
        post.tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()

    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def update_post(db: Session, slug: str, data: dict) -> Post:
    post = get_post_by_slug(db, slug)

    if "title" in data and data["title"]:
        post.title = data["title"]
    if "slug" in data and data["slug"] and data["slug"] != post.slug:
        existing = db.query(Post).filter(Post.slug == data["slug"]).first()
        if existing:
            raise AppException(status_code=400, detail="Slug already exists")
        post.slug = data["slug"]
    if "content_md" in data and data["content_md"]:
        post.content_md = data["content_md"]
        post.content_html = render_markdown(data["content_md"])
        post.excerpt = auto_excerpt(post.content_html)
    if "excerpt" in data:
        post.excerpt = data["excerpt"]
    if "status" in data and data["status"]:
        new_status = PostStatus(data["status"])
        if new_status == PostStatus.published and post.status == PostStatus.draft:
            post.published_at = datetime.now(timezone.utc)
        post.status = new_status
    if "tag_ids" in data and data["tag_ids"] is not None:
        post.tags = db.query(Tag).filter(Tag.id.in_(data["tag_ids"])).all()

    db.commit()
    db.refresh(post)
    return post


def delete_post(db: Session, slug: str) -> None:
    post = get_post_by_slug(db, slug)
    db.delete(post)
    db.commit()

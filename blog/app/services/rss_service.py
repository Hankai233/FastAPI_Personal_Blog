from datetime import timezone
from feedgen.feed import FeedGenerator
from sqlalchemy.orm import Session
from app.models.post import Post


def generate_rss(db: Session, base_url: str) -> str:
    fg = FeedGenerator()
    fg.title("My Blog")
    fg.description("Personal blog")
    fg.link(href=base_url, rel="self")
    fg.language("zh-CN")

    posts = (
        db.query(Post)
        .filter(Post.status == "published")
        .order_by(Post.published_at.desc())
        .limit(20)
        .all()
    )

    for post in posts:
        fe = fg.add_entry()
        fe.title(post.title)
        fe.link(href=f"{base_url}/posts/{post.slug}")
        fe.description(post.excerpt or "")
        fe.content(post.content_html, type="html")
        if post.published_at:
            published = post.published_at
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            fe.published(published)
        if post.updated_at:
            updated = post.updated_at
            if updated.tzinfo is None:
                updated = updated.replace(tzinfo=timezone.utc)
            fe.updated(updated)
        fe.guid(f"{base_url}/posts/{post.slug}", permalink=True)

    return fg.rss_str(pretty=True).decode("utf-8")

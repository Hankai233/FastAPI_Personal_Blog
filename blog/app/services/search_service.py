from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.post import Post, PostStatus


def search_posts(db: Session, q: str, page: int = 1, page_size: int = 10) -> tuple[list[Post], int]:
    if not q.strip():
        return [], 0

    engine_name = db.get_bind().dialect.name
    if engine_name == "mysql" or engine_name == "mariadb":
        # MariaDB FULLTEXT search
        search_query = db.query(Post).filter(
            Post.status == PostStatus.published,
            Post.content_md.op("MATCH AGAINST")(text(":term IN BOOLEAN MODE"))
        ).params(term=q)
    else:
        # SQLite LIKE fallback (for testing)
        like_term = f"%{q}%"
        search_query = db.query(Post).filter(
            Post.status == PostStatus.published,
            (Post.title.ilike(like_term)) | (Post.content_md.ilike(like_term))
        )
    total = search_query.count()
    posts = search_query.order_by(Post.published_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return posts, total

from sqlalchemy.orm import Session
from app.models.comment import Comment
from app.models.post import Post
from app.core.exceptions import AppException


def get_comments_for_post(db: Session, post_slug: str) -> list[Comment]:
    post = db.query(Post).filter(Post.slug == post_slug).first()
    if not post:
        raise AppException(status_code=404, detail="Post not found")
    return (
        db.query(Comment)
        .filter(Comment.post_id == post.id, Comment.is_approved == True, Comment.parent_id == None)
        .order_by(Comment.created_at.desc())
        .all()
    )


def create_comment(db: Session, post_slug: str, data: dict) -> Comment:
    post = db.query(Post).filter(Post.slug == post_slug).first()
    if not post:
        raise AppException(status_code=404, detail="Post not found")

    if data.get("parent_id"):
        parent = db.query(Comment).filter(Comment.id == data["parent_id"], Comment.post_id == post.id).first()
        if not parent:
            raise AppException(status_code=400, detail="Parent comment not found")

    comment = Comment(
        post_id=post.id,
        author_name=data["author_name"],
        author_email=data["author_email"],
        content=data["content"],
        parent_id=data.get("parent_id"),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_pending_comments(db: Session) -> list[Comment]:
    return db.query(Comment).filter(Comment.is_approved == False).order_by(Comment.created_at.desc()).all()


def approve_comment(db: Session, comment_id: int) -> Comment:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise AppException(status_code=404, detail="Comment not found")
    comment.is_approved = True
    db.commit()
    db.refresh(comment)
    return comment


def delete_comment(db: Session, comment_id: int) -> None:
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise AppException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()

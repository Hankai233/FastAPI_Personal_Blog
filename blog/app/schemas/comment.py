from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    author_name: str = Field(min_length=1, max_length=100)
    author_email: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1, max_length=5000)
    parent_id: int | None = None


class CommentRead(BaseModel):
    id: int
    author_name: str
    content: str
    is_approved: bool
    parent_id: int | None
    created_at: datetime
    replies: list["CommentRead"] = []

    model_config = {"from_attributes": True}

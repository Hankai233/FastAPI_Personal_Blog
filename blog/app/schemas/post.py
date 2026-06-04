from datetime import datetime
from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=200)
    content_md: str = Field(min_length=1)
    excerpt: str | None = Field(default=None, max_length=500)
    tag_ids: list[int] = Field(default_factory=list)
    status: str = "draft"


class PostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = Field(default=None, min_length=1, max_length=200)
    content_md: str | None = None
    excerpt: str | None = None
    tag_ids: list[int] | None = None
    status: str | None = None


class TagBrief(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}


class PostRead(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str | None
    content_html: str
    status: str
    tags: list[TagBrief] = []
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None

    model_config = {"from_attributes": True}


class PostListRead(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: str | None
    status: str
    tags: list[TagBrief] = []
    created_at: datetime
    published_at: datetime | None

    model_config = {"from_attributes": True}

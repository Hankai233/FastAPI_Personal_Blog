# FastAPI 个人博客 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使用 FastAPI + SQLAlchemy + MariaDB 搭建个人博客 API 后端，支持文章/标签/评论 CRUD、全文搜索、RSS、JWT 认证。

**Architecture:** 分层架构（core / models / schemas / services / routers），async def 路由 + 同步 SQLAlchemy 2.0 ORM，依赖注入管理数据库会话和认证。

**Tech Stack:** FastAPI, SQLAlchemy 2.0 (Mapped style), PyMySQL, MariaDB, python-jose, passlib[bcrypt], Pydantic v2, python-markdown, bleach, feedgen, Alembic, pytest, httpx, SQLite (测试用)

**Spec:** `docs/superpowers/specs/2026-06-03-fastapi-blog-design.md`

---

## 文件清单

| 文件 | 职责 |
|---|---|
| `blog/pyproject.toml` | 项目元数据和依赖声明 |
| `blog/requirements.txt` | 精确依赖版本 |
| `blog/.env.example` | 环境变量模板 |
| `blog/app/__init__.py` | 包标记 |
| `blog/app/main.py` | FastAPI 应用入口，挂载路由，CORS，异常处理 |
| `blog/app/core/__init__.py` | 包标记 |
| `blog/app/core/config.py` | pydantic-settings 配置类 |
| `blog/app/core/database.py` | SQLAlchemy engine、session、Base |
| `blog/app/core/security.py` | JWT 签发/解码、密码哈希/验证 |
| `blog/app/core/exceptions.py` | 自定义异常类 + 全局 handler |
| `blog/app/models/__init__.py` | 导出所有 ORM 模型 |
| `blog/app/models/user.py` | User ORM 模型 |
| `blog/app/models/post.py` | Post ORM 模型 |
| `blog/app/models/tag.py` | Tag + post_tags 关联表 |
| `blog/app/models/comment.py` | Comment ORM 模型 |
| `blog/app/schemas/__init__.py` | 包标记 |
| `blog/app/schemas/common.py` | PaginatedResponse, MessageResponse |
| `blog/app/schemas/post.py` | PostCreate/Update/Read/List |
| `blog/app/schemas/tag.py` | TagCreate/Update/Read |
| `blog/app/schemas/comment.py` | CommentCreate/Read |
| `blog/app/schemas/auth.py` | LoginRequest, TokenResponse |
| `blog/app/services/__init__.py` | 包标记 |
| `blog/app/services/post_service.py` | 文章业务逻辑 |
| `blog/app/services/comment_service.py` | 评论业务逻辑 |
| `blog/app/services/search_service.py` | 全文搜索 |
| `blog/app/services/rss_service.py` | RSS feed 生成 |
| `blog/app/routers/__init__.py` | 包标记 |
| `blog/app/routers/auth.py` | 认证路由 |
| `blog/app/routers/posts.py` | 文章公开 + 管理路由 |
| `blog/app/routers/tags.py` | 标签公开 + 管理路由 |
| `blog/app/routers/comments.py` | 评论公开 + 管理路由 |
| `blog/app/routers/search.py` | 搜索路由 |
| `blog/app/routers/rss.py` | RSS 路由 |
| `blog/app/dependencies.py` | get_db, get_current_user 依赖 |
| `blog/tests/__init__.py` | 包标记 |
| `blog/tests/conftest.py` | pytest fixtures |
| `blog/tests/test_auth.py` | 认证接口测试 |
| `blog/tests/test_posts.py` | 文章接口测试 |
| `blog/tests/test_tags.py` | 标签接口测试 |
| `blog/tests/test_comments.py` | 评论接口测试 |
| `blog/tests/test_search.py` | 搜索接口测试 |
| `blog/tests/test_rss.py` | RSS 接口测试 |

---

### Task 1: 项目脚手架

**Files:**
- Create: `blog/pyproject.toml`
- Create: `blog/requirements.txt`
- Create: `blog/.env.example`
- Create: `blog/app/__init__.py`

- [ ] **Step 1: 创建项目目录结构**

```bash
mkdir -p blog/app/{core,models,schemas,services,routers} blog/tests
```

- [ ] **Step 2: 编写 pyproject.toml**

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "blog"
version = "0.1.0"
description = "Personal blog API powered by FastAPI"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "sqlalchemy>=2.0.0",
    "pymysql>=1.1.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib[bcrypt]>=1.7.4",
    "python-multipart>=0.0.9",
    "python-markdown>=3.6",
    "bleach>=6.0",
    "feedgen>=1.0.0",
    "pydantic-settings>=2.0",
    "alembic>=1.13.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0",
    "httpx>=0.27.0",
]
```

- [ ] **Step 3: 编写 requirements.txt**

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
sqlalchemy>=2.0.0
pymysql>=1.1.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
python-markdown>=3.6
bleach>=6.0
feedgen>=1.0.0
pydantic-settings>=2.0
alembic>=1.13.0
pytest>=8.0
httpx>=0.27.0
```

- [ ] **Step 4: 编写 .env.example**

```
DATABASE_URL=mysql+pymysql://root@localhost:3306/blog
JWT_SECRET_KEY=replace-with-a-random-secret-key
CORS_ORIGINS=["http://localhost:3000"]
ENV=dev
```

- [ ] **Step 5: 安装依赖**

```bash
cd blog && pip install -r requirements.txt
```

- [ ] **Step 6: 验证脚手架**

```bash
python -c "import fastapi; import sqlalchemy; print('OK')"
```
Expected: `OK`

- [ ] **Step 7: 初始化 git 并提交**

```bash
cd blog && git init && git add -A && git commit -m "chore: scaffold project structure"
```

---

### Task 2: 核心配置与数据库

**Files:**
- Create: `blog/app/core/__init__.py`
- Create: `blog/app/core/config.py`
- Create: `blog/app/core/database.py`
- Create: `blog/app/core/security.py`
- Create: `blog/app/core/exceptions.py`

- [ ] **Step 1: 编写 config.py**

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root@localhost:3306/blog"
    JWT_SECRET_KEY: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    ENV: str = "dev"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
```

- [ ] **Step 2: 编写 database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=(settings.ENV == "dev"),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 3: 编写 security.py**

```python
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return {}
```

- [ ] **Step 4: 编写 exceptions.py**

```python
from fastapi import Request
from fastapi.responses import JSONResponse
from app.core.config import settings


class AppException(Exception):
    def __init__(self, status_code: int, detail: str):
        self.status_code = status_code
        self.detail = detail


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if settings.ENV == "dev":
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
```

- [ ] **Step 5: 验证核心模块可导入**

```bash
cd blog && python -c "from app.core.config import settings; from app.core.security import hash_password; print('OK')"
```
Expected: `OK`

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat: add core config, database, security, and exceptions"
```

---

### Task 3: ORM 模型

**Files:**
- Create: `blog/app/models/__init__.py`
- Create: `blog/app/models/user.py`
- Create: `blog/app/models/post.py`
- Create: `blog/app/models/tag.py`
- Create: `blog/app/models/comment.py`

- [ ] **Step 1: 编写 user.py**

```python
from datetime import datetime, timezone
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    posts: Mapped[list["Post"]] = relationship(back_populates="author")
```

- [ ] **Step 2: 编写 post.py**

```python
from datetime import datetime, timezone
from sqlalchemy import String, Text, Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class PostStatus(str, enum.Enum):
    draft = "draft"
    published = "published"


class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        Index("ix_posts_fulltext", "title", "content_md", mysql_engine="InnoDB"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)
    content_md: Mapped[str] = mapped_column(Text, nullable=False)
    content_html: Mapped[str] = mapped_column(Text, nullable=False, default="")
    excerpt: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[PostStatus] = mapped_column(Enum(PostStatus), default=PostStatus.draft)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    published_at: Mapped[datetime | None] = mapped_column(nullable=True)

    author: Mapped["User"] = relationship(back_populates="posts")
    tags: Mapped[list["Tag"]] = relationship(secondary="post_tags", back_populates="posts")
    comments: Mapped[list["Comment"]] = relationship(back_populates="post")
```

- [ ] **Step 3: 编写 tag.py**

```python
from sqlalchemy import String, Table, Column, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    posts: Mapped[list["Post"]] = relationship(secondary="post_tags", back_populates="tags")
```

- [ ] **Step 4: 编写 comment.py**

```python
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    author_name: Mapped[str] = mapped_column(String(100), nullable=False)
    author_email: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    post: Mapped["Post"] = relationship(back_populates="comments")
    parent: Mapped["Comment | None"] = relationship(remote_side="Comment.id", back_populates="replies")
    replies: Mapped[list["Comment"]] = relationship(back_populates="parent")
```

- [ ] **Step 5: 编写 models/__init__.py**

```python
from app.models.user import User
from app.models.post import Post, PostStatus
from app.models.tag import Tag, post_tags
from app.models.comment import Comment

__all__ = ["User", "Post", "PostStatus", "Tag", "post_tags", "Comment"]
```

- [ ] **Step 6: 验证模型可导入**

```bash
cd blog && python -c "from app.models import User, Post, Tag, Comment; print('OK')"
```
Expected: `OK`

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "feat: add ORM models (User, Post, Tag, Comment)"
```

---

### Task 4: Pydantic Schemas

**Files:**
- Create: `blog/app/schemas/__init__.py`
- Create: `blog/app/schemas/common.py`
- Create: `blog/app/schemas/auth.py`
- Create: `blog/app/schemas/post.py`
- Create: `blog/app/schemas/tag.py`
- Create: `blog/app/schemas/comment.py`

- [ ] **Step 1: 编写 common.py**

```python
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")


class PaginatedResponse(BaseModel):
    data: list
    total: int
    page: int
    page_size: int


class MessageResponse(BaseModel):
    message: str = "ok"
```

- [ ] **Step 2: 编写 auth.py**

```python
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
```

- [ ] **Step 3: 编写 post.py**

```python
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
```

- [ ] **Step 4: 编写 tag.py**

```python
from pydantic import BaseModel, Field


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    slug: str = Field(min_length=1, max_length=50)


class TagUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=50)
    slug: str | None = Field(default=None, min_length=1, max_length=50)


class TagRead(BaseModel):
    id: int
    name: str
    slug: str

    model_config = {"from_attributes": True}
```

- [ ] **Step 5: 编写 comment.py**

```python
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
    parent_id: int | None
    created_at: datetime
    replies: list["CommentRead"] = []

    model_config = {"from_attributes": True}
```

- [ ] **Step 6: 编写 schemas/__init__.py**

```python
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.schemas.post import PostCreate, PostUpdate, PostRead, PostListRead, TagBrief
from app.schemas.tag import TagCreate, TagUpdate, TagRead
from app.schemas.comment import CommentCreate, CommentRead
```

- [ ] **Step 7: 验证 schemas 可导入**

```bash
cd blog && python -c "from app.schemas import PostCreate, TagCreate, CommentCreate; print('OK')"
```
Expected: `OK`

- [ ] **Step 8: 提交**

```bash
git add -A && git commit -m "feat: add Pydantic schemas"
```

---

### Task 5: 依赖注入

**Files:**
- Create: `blog/app/dependencies.py`

- [ ] **Step 1: 编写 dependencies.py**

```python
from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import AppException
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if not payload:
        raise AppException(status_code=401, detail="Invalid or expired token")

    if payload.get("type") != "access":
        raise AppException(status_code=401, detail="Token type must be 'access'")

    user_id = payload.get("sub")
    if not user_id:
        raise AppException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise AppException(status_code=401, detail="User not found")

    if not user.is_active:
        raise AppException(status_code=401, detail="User is inactive")

    return user
```

- [ ] **Step 2: 验证依赖可导入**

```bash
cd blog && python -c "from app.dependencies import get_current_user; print('OK')"
```
Expected: `OK`

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "feat: add dependency injection (get_db, get_current_user)"
```

---

### Task 6: 业务服务层

**Files:**
- Create: `blog/app/services/__init__.py`
- Create: `blog/app/services/post_service.py`
- Create: `blog/app/services/comment_service.py`
- Create: `blog/app/services/search_service.py`
- Create: `blog/app/services/rss_service.py`

- [ ] **Step 1: 编写 post_service.py**

```python
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


def get_post_by_slug(db: Session, slug: str) -> Post:
    post = db.query(Post).filter(Post.slug == slug).first()
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
```

- [ ] **Step 2: 编写 comment_service.py**

```python
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
```

- [ ] **Step 3: 编写 search_service.py**

```python
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
```

- [ ] **Step 4: 编写 rss_service.py**

```python
from feedgen.feed import FeedGenerator
from sqlalchemy.orm import Session
from app.models.post import Post
from app.core.config import settings


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
            fe.published(post.published_at)
        if post.updated_at:
            fe.updated(post.updated_at)
        fe.guid(f"{base_url}/posts/{post.slug}", permalink=True)

    return fg.rss_str(pretty=True).decode("utf-8")
```

- [ ] **Step 5: 验证服务层可导入**

```bash
cd blog && python -c "from app.services.post_service import render_markdown; from app.services.rss_service import generate_rss; print('OK')"
```
Expected: `OK`

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat: add service layer (post, comment, search, rss)"
```

---

### Task 7: 路由层

**Files:**
- Create: `blog/app/routers/__init__.py`
- Create: `blog/app/routers/auth.py`
- Create: `blog/app/routers/posts.py`
- Create: `blog/app/routers/tags.py`
- Create: `blog/app/routers/comments.py`
- Create: `blog/app/routers/search.py`
- Create: `blog/app/routers/rss.py`

- [ ] **Step 1: 编写 auth.py**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import AppException
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest
from app.schemas.user import UserRead
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise AppException(status_code=401, detail="Invalid username or password")
    if not user.is_active:
        raise AppException(status_code=401, detail="User is inactive")
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise AppException(status_code=401, detail="Invalid refresh token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise AppException(status_code=401, detail="User not found or inactive")
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
```

Note: `UserRead` schema needs to be added. Append to `blog/app/schemas/auth.py` or add `blog/app/schemas/user.py`. Let's create `blog/app/schemas/user.py`.

- [ ] **Step 1b: 创建 user.py schema**

```python
from datetime import datetime
from pydantic import BaseModel


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
```

Update `blog/app/schemas/__init__.py` to include:
```python
from app.schemas.user import UserRead
```

- [ ] **Step 2: 编写 posts.py**

```python
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.post import PostCreate, PostUpdate, PostRead, PostListRead
from app.schemas.common import MessageResponse
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
    posts, total = post_service.get_posts(db, page=page, page_size=page_size, tag_slug=tag)
    return {
        "data": [PostListRead.model_validate(p) for p in posts],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{slug}", response_model=PostRead)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = post_service.get_post_by_slug(db, slug)
    return post


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
```

- [ ] **Step 3: 编写 tags.py**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import AppException
from app.dependencies import get_current_user
from app.schemas.tag import TagCreate, TagUpdate, TagRead
from app.models.tag import Tag
from app.models.user import User

router = APIRouter(prefix="/api/tags", tags=["tags"])
admin_router = APIRouter(prefix="/api/admin/tags", tags=["admin-tags"])


@router.get("", response_model=list[TagRead])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()


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
```

- [ ] **Step 4: 编写 comments.py**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies import get_current_user
from app.schemas.comment import CommentCreate, CommentRead
from app.schemas.common import MessageResponse
from app.services import comment_service
from app.models.user import User
from app.models.comment import Comment

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
```

- [ ] **Step 5: 编写 search.py**

```python
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
```

- [ ] **Step 6: 编写 rss.py**

```python
from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import rss_service

router = APIRouter(prefix="/api", tags=["rss"])


@router.get("/rss")
def rss(request: Request, db: Session = Depends(get_db)):
    base_url = str(request.base_url).rstrip("/")
    rss_content = rss_service.generate_rss(db, base_url)
    return Response(content=rss_content, media_type="application/rss+xml")
```

- [ ] **Step 7: 验证路由可导入**

```bash
cd blog && python -c "from app.routers import auth, posts, tags, comments, search, rss; print('OK')"
```
Expected: `OK`

- [ ] **Step 8: 提交**

```bash
git add -A && git commit -m "feat: add all API routers"
```

---

### Task 8: 应用入口（main.py）

**Files:**
- Create: `blog/app/main.py`

- [ ] **Step 1: 编写 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import AppException, app_exception_handler, general_exception_handler
from app.routers import auth, posts, tags, comments, search, rss


def create_app() -> FastAPI:
    app = FastAPI(
        title="Personal Blog API",
        description="A personal blog API powered by FastAPI",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)

    # 公开路由
    app.include_router(auth.router)
    app.include_router(posts.router)
    app.include_router(tags.router)
    app.include_router(comments.router)
    app.include_router(search.router)
    app.include_router(rss.router)

    # 管理路由
    app.include_router(posts.admin_router)
    app.include_router(tags.admin_router)
    app.include_router(comments.admin_router)

    return app


app = create_app()
```

- [ ] **Step 2: 验证应用可启动**

```bash
cd blog && timeout 5 python -c "
from app.main import app
print(f'App created: {app.title}, routes: {len(app.routes)}')
" || true
```
Expected: prints app title and positive route count

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "feat: add FastAPI app entry point with CORS and error handlers"
```

---

### Task 9: Alembic 数据库迁移

**Files:**
- Create: `blog/alembic.ini` (generated by alembic)
- Create: `blog/alembic/` (generated by alembic)
- Modify: `blog/alembic/env.py`
- Create: `blog/app/cli.py`

- [ ] **Step 1: 初始化 Alembic**

```bash
cd blog && alembic init alembic
```

- [ ] **Step 2: 修改 alembic/env.py**

Replace the generated `alembic/env.py`:

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.core.config import settings
from app.core.database import Base
from app.models import User, Post, Tag, Comment, post_tags

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 3: 生成初始迁移**

```bash
cd blog && alembic revision --autogenerate -m "initial schema"
```

- [ ] **Step 4: 编写 CLI 辅助脚本 app/cli.py**

```python
import typer
from app.core.security import hash_password
from app.core.database import SessionLocal
from app.models.user import User

cli = typer.Typer()


@cli.command()
def create_user(username: str, email: str, password: str):
    """创建管理员用户"""
    db = SessionLocal()
    existing = db.query(User).filter(User.username == username).first()
    if existing:
        print(f"User '{username}' already exists")
        db.close()
        return
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"User '{username}' created with id={user.id}")
    db.close()


if __name__ == "__main__":
    cli()
```

Add `typer` to requirements.txt and pyproject.toml dependencies.

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "feat: add Alembic migrations and CLI for user creation"
```

---

### Task 10: 测试基础设施

**Files:**
- Create: `blog/tests/__init__.py`
- Create: `blog/tests/conftest.py`

- [ ] **Step 1: 编写 conftest.py**

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import create_app
from app.models.user import User
from app.core.security import hash_password, create_access_token

SQLITE_URL = "sqlite:///:memory:"
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def client():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

    db.close()
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def auth_headers(client):
    db = TestingSessionLocal()
    user = User(
        username="admin",
        email="admin@test.com",
        hashed_password=hash_password("password123"),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id)
    db.close()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def sample_tags(client, auth_headers):
    tags = []
    for name in ["Python", "FastAPI", "SQLAlchemy"]:
        resp = client.post(
            "/api/admin/tags",
            json={"name": name, "slug": name.lower()},
            headers=auth_headers,
        )
        tags.append(resp.json())
    return tags
```

- [ ] **Step 2: 运行一个简单的冒烟测试验证 fixtures 工作**

```bash
cd blog && python -c "
from tests.conftest import client, auth_headers
print('Fixtures import OK')
"
```
Expected: `Fixtures import OK`

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "test: add pytest fixtures with SQLite in-memory database"
```

---

### Task 11: 测试 — 认证

**Files:**
- Create: `blog/tests/test_auth.py`

- [ ] **Step 1: 编写 test_auth.py**

```python
class TestAuthLogin:
    def test_login_success(self, client, auth_headers):
        resp = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, auth_headers):
        resp = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "wrong",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post("/api/auth/login", json={
            "username": "nobody",
            "password": "password123",
        })
        assert resp.status_code == 401

    def test_me_endpoint(self, client, auth_headers):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["username"] == "admin"

    def test_me_without_token(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_refresh_token(self, client, auth_headers):
        login_resp = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "password123",
        })
        refresh_token = login_resp.json()["refresh_token"]
        resp = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_refresh_with_access_token_fails(self, client, auth_headers):
        login_resp = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "password123",
        })
        access_token = login_resp.json()["access_token"]
        resp = client.post("/api/auth/refresh", json={"refresh_token": access_token})
        assert resp.status_code == 401
```

- [ ] **Step 2: 运行认证测试**

```bash
cd blog && python -m pytest tests/test_auth.py -v
```
Expected: all 7 tests pass

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "test: add authentication tests"
```

---

### Task 12: 测试 — 文章

**Files:**
- Create: `blog/tests/test_posts.py`

- [ ] **Step 1: 编写 test_posts.py**

```python
class TestPublicPosts:
    def test_list_empty(self, client):
        resp = client.get("/api/posts")
        assert resp.status_code == 200
        body = resp.json()
        assert body["data"] == []
        assert body["total"] == 0

    def test_create_and_list_posts(self, client, auth_headers, sample_tags):
        post_data = {
            "title": "Hello World",
            "slug": "hello-world",
            "content_md": "# Hello\n\nThis is a test post.",
            "tag_ids": [t["id"] for t in sample_tags],
            "status": "published",
        }
        create_resp = client.post("/api/admin/posts", json=post_data, headers=auth_headers)
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["title"] == "Hello World"
        assert created["content_html"].startswith("<h1>Hello</h1>")
        assert len(created["tags"]) == 3

        # List
        list_resp = client.get("/api/posts")
        assert list_resp.status_code == 200
        assert list_resp.json()["total"] == 1

    def test_get_by_slug(self, client, auth_headers, sample_tags):
        client.post("/api/admin/posts", json={
            "title": "Test Post",
            "slug": "test-post",
            "content_md": "Content here",
            "tag_ids": [],
            "status": "published",
        }, headers=auth_headers)
        resp = client.get("/api/posts/test-post")
        assert resp.status_code == 200
        assert resp.json()["slug"] == "test-post"

    def test_draft_not_visible(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "Draft Post",
            "slug": "draft-post",
            "content_md": "Secret draft",
        }, headers=auth_headers)
        resp = client.get("/api/posts/draft-post")
        assert resp.status_code == 404

    def test_get_nonexistent_post(self, client):
        resp = client.get("/api/posts/no-such-post")
        assert resp.status_code == 404

    def test_update_post(self, client, auth_headers, sample_tags):
        client.post("/api/admin/posts", json={
            "title": "Original",
            "slug": "original",
            "content_md": "Original content",
            "tag_ids": [],
            "status": "published",
        }, headers=auth_headers)
        resp = client.put("/api/admin/posts/original", json={
            "title": "Updated",
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated"

    def test_delete_post(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "To Delete",
            "slug": "to-delete",
            "content_md": "Will be removed",
        }, headers=auth_headers)
        resp = client.delete("/api/admin/posts/to-delete", headers=auth_headers)
        assert resp.status_code == 200
        assert client.get("/api/posts/to-delete").status_code == 404

    def test_unauthorized_create(self, client):
        resp = client.post("/api/admin/posts", json={
            "title": "No Auth",
            "slug": "no-auth",
            "content_md": "Should fail",
        })
        assert resp.status_code == 401

    def test_duplicate_slug(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "First",
            "slug": "same-slug",
            "content_md": "First post",
        }, headers=auth_headers)
        resp = client.post("/api/admin/posts", json={
            "title": "Second",
            "slug": "same-slug",
            "content_md": "Second post",
        }, headers=auth_headers)
        assert resp.status_code == 400
```

- [ ] **Step 2: 运行文章测试**

```bash
cd blog && python -m pytest tests/test_posts.py -v
```
Expected: all tests pass

- [ ] **Step 3: 提交**

```bash
git add -A && git commit -m "test: add post CRUD tests"
```

---

### Task 13: 测试 — 标签、评论、搜索、RSS

**Files:**
- Create: `blog/tests/test_tags.py`
- Create: `blog/tests/test_comments.py`
- Create: `blog/tests/test_search.py`
- Create: `blog/tests/test_rss.py`

- [ ] **Step 1: 编写 test_tags.py**

```python
class TestTags:
    def test_list_empty(self, client):
        resp = client.get("/api/tags")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_create_and_list(self, client, auth_headers):
        resp = client.post("/api/admin/tags", json={
            "name": "Python",
            "slug": "python",
        }, headers=auth_headers)
        assert resp.status_code == 201
        assert resp.json()["name"] == "Python"

        list_resp = client.get("/api/tags")
        assert len(list_resp.json()) == 1

    def test_create_duplicate(self, client, auth_headers):
        client.post("/api/admin/tags", json={"name": "Dup", "slug": "dup"}, headers=auth_headers)
        resp = client.post("/api/admin/tags", json={"name": "Dup", "slug": "dup"}, headers=auth_headers)
        assert resp.status_code == 400

    def test_update_tag(self, client, auth_headers):
        created = client.post("/api/admin/tags", json={"name": "Old", "slug": "old"}, headers=auth_headers)
        tag_id = created.json()["id"]
        resp = client.put(f"/api/admin/tags/{tag_id}", json={"name": "New"}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["name"] == "New"

    def test_delete_tag(self, client, auth_headers):
        created = client.post("/api/admin/tags", json={"name": "Del", "slug": "del"}, headers=auth_headers)
        tag_id = created.json()["id"]
        resp = client.delete(f"/api/admin/tags/{tag_id}", headers=auth_headers)
        assert resp.status_code == 200
```

- [ ] **Step 2: 编写 test_comments.py**

```python
class TestComments:
    def test_create_comment(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "P", "slug": "p", "content_md": "test",
            "status": "published",
        }, headers=auth_headers)
        resp = client.post("/api/posts/p/comments", json={
            "author_name": "Alice",
            "author_email": "alice@example.com",
            "content": "Nice post!",
        })
        assert resp.status_code == 201
        assert resp.json()["is_approved"] == False

    def test_list_comments(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "X", "slug": "x", "content_md": "test",
            "status": "published",
        }, headers=auth_headers)
        client.post("/api/posts/x/comments", json={
            "author_name": "Bob",
            "author_email": "bob@test.com",
            "content": "Hello",
        })
        resp = client.get("/api/posts/x/comments")
        assert resp.status_code == 200
        assert resp.json() == []

    def test_approve_comment(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "Y", "slug": "y", "content_md": "test",
            "status": "published",
        }, headers=auth_headers)
        created = client.post("/api/posts/y/comments", json={
            "author_name": "Cat", "author_email": "c@t.com", "content": "Meow",
        })
        comment_id = created.json()["id"]
        resp = client.put(f"/api/admin/comments/{comment_id}/approve", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["is_approved"] == True
```

- [ ] **Step 3: 编写 test_search.py**

```python
class TestSearch:
    def test_search_empty_query(self, client):
        resp = client.get("/api/search", params={"q": ""})
        assert resp.status_code == 422

    def test_search_no_results(self, client):
        resp = client.get("/api/search", params={"q": "nonexistent"})
        assert resp.status_code == 200
        assert resp.json()["data"] == []
        assert resp.json()["total"] == 0
```

- [ ] **Step 4: 编写 test_rss.py**

```python
class TestRSS:
    def test_rss_returns_xml(self, client, auth_headers):
        client.post("/api/admin/posts", json={
            "title": "RSS Test",
            "slug": "rss-test",
            "content_md": "RSS content",
            "status": "published",
        }, headers=auth_headers)
        resp = client.get("/api/rss")
        assert resp.status_code == 200
        assert "application/rss+xml" in resp.headers["content-type"]
        assert "<rss" in resp.text or "<feed" in resp.text
```

- [ ] **Step 5: 运行所有测试**

```bash
cd blog && python -m pytest tests/ -v
```
Expected: all tests pass

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "test: add tag, comment, search, and RSS tests"
```

---

### Task 14: 最终验证

- [ ] **Step 1: 运行完整测试套件**

```bash
cd blog && python -m pytest tests/ -v
```

- [ ] **Step 2: 启动开发服务器进行手动验证**

```bash
cd blog && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

打开浏览器访问 `http://localhost:8000/docs` 确认 Swagger 文档正常显示。

- [ ] **Step 3: 提交最后的修改**

```bash
git add -A && git commit -m "chore: final verification and cleanup"
```

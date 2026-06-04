# FastAPI 个人博客 — 设计文档

**日期**: 2026-06-03  
**状态**: 设计中

---

## 1. 概述

使用 FastAPI 搭建的个人博客 API 后端，前后端分离。前端单独开发（React/Vue 等），通过 RESTful API 交互。

## 2. 环境与技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| Web 框架 | FastAPI | 异步路由 + 自动 OpenAPI 文档 |
| ORM | SQLAlchemy 2.0 | Mapped 风格声明式模型，同步 session |
| 数据库驱动 | PyMySQL | 纯 Python 驱动 |
| 数据库 | MariaDB | 复用已有实例 |
| 认证 | python-jose + passlib | JWT 签发/验证 + bcrypt 哈希 |
| 校验 | Pydantic v2 | FastAPI 内置 |
| Markdown | python-markdown + bleach | 渲染 + XSS 清洗 |
| 全文搜索 | MariaDB FULLTEXT INDEX | 数据库原生支持 |
| RSS | feedgen | RSS 2.0 / Atom |
| 迁移 | Alembic | 数据库版本管理 |
| 测试 | pytest + httpx + SQLite | 内存数据库隔离测试 |

## 3. 架构

采用分层架构（Layered Architecture），关注点分离。

### 3.1 目录结构

```
blog/
├── app/
│   ├── __init__.py
│   ├── main.py              # 应用入口，挂载路由，CORS 配置
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py         # Settings，读取环境变量
│   │   ├── security.py       # JWT 签发/验证，密码哈希
│   │   └── database.py       # engine, SessionLocal, Base
│   ├── models/               # SQLAlchemy ORM 模型
│   │   ├── __init__.py
│   │   ├── post.py
│   │   ├── tag.py
│   │   ├── comment.py
│   │   └── user.py
│   ├── schemas/              # Pydantic 请求/响应模型
│   │   ├── __init__.py
│   │   ├── post.py
│   │   ├── tag.py
│   │   ├── comment.py
│   │   ├── user.py
│   │   └── auth.py
│   ├── routers/              # API 路由
│   │   ├── __init__.py
│   │   ├── posts.py
│   │   ├── tags.py
│   │   ├── comments.py
│   │   ├── auth.py
│   │   ├── search.py
│   │   └── rss.py
│   ├── services/             # 业务逻辑
│   │   ├── __init__.py
│   │   ├── post_service.py
│   │   └── search_service.py
│   └── dependencies.py       # 依赖注入
├── tests/
│   ├── conftest.py
│   ├── test_posts.py
│   ├── test_tags.py
│   ├── test_comments.py
│   ├── test_auth.py
│   ├── test_search.py
│   └── test_rss.py
├── alembic/
├── alembic.ini
├── requirements.txt
└── pyproject.toml
```

### 3.2 数据流

```
请求 → Router (参数校验) → Service (业务逻辑) → Model (ORM) → MariaDB
```

路由层使用 `async def` 提升并发能力；数据库操作使用 SQLAlchemy 同步 session，在线程中执行。

## 4. 数据模型

### 4.1 users

| 列 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 自增 |
| username | VARCHAR(50) UNIQUE | 登录名 |
| email | VARCHAR(255) | 邮箱 |
| hashed_password | VARCHAR(255) | bcrypt 哈希 |
| is_active | BOOL | 默认 True |
| created_at | DATETIME | 注册时间 |

### 4.2 posts

| 列 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 自增 |
| title | VARCHAR(200) | 标题 |
| slug | VARCHAR(200) UNIQUE | URL 友好标识 |
| content_md | TEXT | Markdown 原文 |
| content_html | TEXT | 渲染后的 HTML |
| excerpt | VARCHAR(500) | 摘要 |
| status | ENUM('draft','published') | 文章状态 |
| author_id | INT FK → users.id | 作者 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 最后修改时间 |
| published_at | DATETIME | 发布时间 |

- FULLTEXT INDEX on `(title, content_md)` 用于全文搜索。

### 4.3 tags

| 列 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 自增 |
| name | VARCHAR(50) UNIQUE | 标签名 |
| slug | VARCHAR(50) UNIQUE | URL 友好名 |

### 4.4 post_tags

| 列 | 类型 |
|---|---|
| post_id | INT FK → posts.id |
| tag_id | INT FK → tags.id |
| PK | (post_id, tag_id) |

### 4.5 comments

| 列 | 类型 | 说明 |
|---|---|---|
| id | INT PK | 自增 |
| post_id | INT FK → posts.id | 所属文章 |
| author_name | VARCHAR(100) | 评论者昵称 |
| author_email | VARCHAR(255) | 邮箱（不公开） |
| content | TEXT | 评论内容 |
| is_approved | BOOL | 默认 False，需审核 |
| parent_id | INT FK → comments.id | 父评论（可空，支持嵌套回复） |
| created_at | DATETIME | 评论时间 |

### 4.6 关系图

```
users (1) ──→ (N) posts
posts (1) ──→ (N) comments
posts (N) ──→ (M) tags  ← 通过 post_tags 关联
comments (1) ──→ (N) comments  ← 自引用嵌套回复
```

## 5. API 设计

### 5.1 公开接口

**文章**
```
GET    /api/posts                       文章列表（分页, ?page=1&tag=xxx&status=published）
GET    /api/posts/{slug}                文章详情（含 content_html）
```

**标签**
```
GET    /api/tags                        所有标签
GET    /api/tags/{slug}                 标签下文章列表
```

**评论**
```
GET    /api/posts/{slug}/comments       文章评论
POST   /api/posts/{slug}/comments       发表评论
```

**搜索**
```
GET    /api/search?q=xxx&page=1         全文搜索文章
```

**RSS**
```
GET    /api/rss                         RSS 2.0 feed
```

### 5.2 管理接口（需 JWT 认证）

**认证**
```
POST   /api/auth/login                  登录 → { access_token, refresh_token }
POST   /api/auth/refresh                刷新 access_token
GET    /api/auth/me                     查看当前用户信息
```

**文章管理**
```
POST   /api/admin/posts                 创建文章
PUT    /api/admin/posts/{slug}          更新文章
DELETE /api/admin/posts/{slug}          删除文章
```

**标签管理**
```
POST   /api/admin/tags                  创建标签
PUT    /api/admin/tags/{id}             编辑标签
DELETE /api/admin/tags/{id}             删除标签
```

**评论管理**
```
GET    /api/admin/comments?approved=false   待审核评论
PUT    /api/admin/comments/{id}/approve     审核通过
DELETE /api/admin/comments/{id}             删除评论
```

### 5.3 响应规范

- 成功（单对象）：`{ "data": {...}, "message": "ok" }`
- 成功（列表）：`{ "data": [...], "total": 100, "page": 1, "page_size": 10 }`
- 错误：`{ "detail": "错误描述" }`（FastAPI 默认格式）

## 6. 认证

### 6.1 Token 设计

- **access_token**: 有效期 30 分钟，用于所有管理接口
- **refresh_token**: 有效期 7 天，仅用于刷新 access_token
- 请求头：`Authorization: Bearer <access_token>`
- Payload：`{ sub: user_id, exp: timestamp, type: "access"|"refresh" }`

### 6.2 流程图

```
Client                           Server
  │                                │
  │── POST /api/auth/login ───────→│ 验证密码 → 签发 access + refresh token
  │←─ { access_token, refresh_token } ──│
  │                                │
  │── GET /api/admin/posts ───────→│ 验证 access_token → 返回数据
  │  (Authorization: Bearer xxx)   │
  │←─ { data: [...] } ────────────│
  │                                │
  │── POST /api/auth/refresh ─────→│ 验证 refresh_token → 签发新 access_token
  │  (body: { refresh_token })     │
  │←─ { access_token } ───────────│
```

### 6.3 依赖注入

```python
# dependencies.py
def get_db():
    # 每个请求一个 DB session，finally 中关闭

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    # 1. 解码 JWT，校验过期和 type
    # 2. 查数据库确认用户存在且 is_active
    # 3. 返回 User 对象
```

## 7. 配置管理

- 使用 `pydantic-settings`，从环境变量 / `.env` 文件加载
- 敏感配置项：`DATABASE_URL`, `JWT_SECRET_KEY`, `CORS_ORIGINS`
- 提供开发/生产两套配置，通过 `ENV=dev|prod` 切换
- 不将 `.env` 文件提交到版本控制

## 8. 错误处理

- FastAPI 全局异常处理器统一捕获
- 自定义 `AppException`，业务逻辑层抛出，全局 handler 转换为 HTTP 响应
- 数据库 session 异常自动回滚（在 `get_db` finally 中）
- 生产环境关闭 traceback，避免内部细节泄露

## 9. 测试

- 框架：pytest + httpx（FastAPI 官方推荐）
- 数据库：测试时通过依赖注入替换为 SQLite 内存数据库
- 覆盖：
  - 公开接口：分页、slug 访问、空列表、404
  - 管理接口：无 token → 401，伪造 token → 403，正常 CRUD
  - 搜索：空关键词、无结果、有结果、分页
  - RSS：feed 结构合法、文章列表正确
  - 边界：超长输入、空内容、XSS 注入
- 每个接口至少覆盖正常路径和主要错误路径

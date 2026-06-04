[English](README.md) | [中文](README_CN.md)

# Personal Blog API

基于 **FastAPI** + **SQLAlchemy** + **MariaDB** 构建的个人博客 API 后端，支持 JWT 认证、Markdown 渲染、全文搜索、RSS 订阅源生成，以及完整的管理后台 API。

## 技术栈

| 层级 | 技术 |
|------|------|
| Web 框架 | FastAPI（异步路由） |
| ORM | SQLAlchemy 2.0（Mapped 风格） |
| 数据库 | MariaDB（生产环境）/ SQLite（测试环境） |
| 认证 | JWT（access + refresh 双令牌）+ bcrypt |
| 数据库迁移 | Alembic |
| Markdown | python-markdown + bleach 清洗 |
| 数据校验 | Pydantic v2 |

## 功能特性

- **博客文章** — 完整 CRUD，Markdown 转 HTML 渲染，自动生成摘要，基于 slug 的友好 URL，草稿/已发布状态管理
- **标签系统** — 多对多标签分类
- **评论系统** — 嵌套回复（自引用 `parent_id`），审核流程（待审核 → 已通过）
- **全文搜索** — MariaDB 使用 `MATCH AGAINST`，SQLite 自动回退到 `ILIKE`
- **RSS 2.0 订阅** — 符合标准的 RSS 源，端点 `/api/rss`
- **JWT 双令牌认证** — access token（30 分钟）+ refresh token（7 天）
- **管理后台 API** — `/api/admin/*` 下提供文章、标签、评论的完整管理接口
- **自动生成文档** — Swagger UI（`/docs`）和 ReDoc（`/redoc`）

## 快速开始

### 环境要求

- Python 3.11+
- MariaDB（开发环境也可使用 SQLite）
- pip

### 安装步骤

```bash
# 克隆仓库
git clone <repo-url> && cd blog

# 进入应用目录
cd blog

# 创建并激活虚拟环境
python -m venv .venv && source .venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的数据库地址和密钥

# 运行数据库迁移
alembic upgrade head

# 创建管理员用户
python -m app.cli create-user <用户名> <邮箱> <密码>

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API 服务运行在 `http://localhost:8000`，交互式文档位于 `http://localhost:8000/docs`。

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | SQLAlchemy 数据库连接字符串 | `mysql+pymysql://root@localhost:3306/blog` |
| `JWT_SECRET_KEY` | JWT 签名密钥 | （生产环境务必修改） |
| `CORS_ORIGINS` | 允许的跨域来源（JSON 数组） | `["http://localhost:3000"]` |
| `ENV` | 运行环境（`dev` / `prod`） | `dev` |

## API 端点

### 公开接口

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/api/posts` | 文章列表（分页，支持按标签和状态筛选） |
| `GET` | `/api/posts/{slug}` | 文章详情（含渲染后的 HTML） |
| `GET` | `/api/tags` | 所有标签 |
| `GET` | `/api/posts/{slug}/comments` | 获取文章的已审核评论 |
| `POST` | `/api/posts/{slug}/comments` | 提交评论（待审核） |
| `GET` | `/api/search?q=&page=` | 全文搜索 |
| `GET` | `/api/rss` | RSS 2.0 订阅源 |
| `POST` | `/api/auth/login` | 登录 → 获取 JWT 令牌对 |
| `POST` | `/api/auth/refresh` | 刷新 access token |

### 管理接口（需 JWT 认证）

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET/POST` | `/api/admin/posts` | 文章列表 / 创建文章 |
| `GET/PUT/DELETE` | `/api/admin/posts/{slug}` | 查看 / 更新 / 删除文章 |
| `GET/POST` | `/api/admin/tags` | 标签列表 / 创建标签 |
| `GET/PUT/DELETE` | `/api/admin/tags/{id}` | 查看 / 更新 / 删除标签 |
| `GET` | `/api/admin/comments` | 评论列表（含未审核） |
| `PUT/DELETE` | `/api/admin/comments/{id}` | 审核通过 / 删除评论 |

## 架构设计

```
Router（薄层） → Service（业务逻辑） → Model（SQLAlchemy ORM） → MariaDB
     ↑                                       ↑
  Pydantic schemas                      dependencies.py
  （请求/响应校验）                       （get_db, get_current_user）
```

- **`app/core/`** — 配置、数据库引擎、JWT/bcrypt 安全、自定义异常处理
- **`app/models/`** — SQLAlchemy 2.0 ORM 模型：`User`、`Post`、`Tag`、`Comment`
- **`app/schemas/`** — Pydantic v2 校验模型（Create / Update / Read 变体）
- **`app/services/`** — 业务逻辑：文章渲染、评论审核、搜索、RSS
- **`app/routers/`** — 薄层路由处理（每个资源模块包含公开路由和管理路由）
- **`app/dependencies.py`** — FastAPI `Depends` 依赖注入（数据库会话、当前用户）

### 关键设计决策

- **同步 ORM + 异步路由** — 路由使用 `async def` 获得并发能力，数据库调用保持同步（PyMySQL/MariaDB 无需异步驱动）
- **JWT 双令牌机制** — access token（30 分钟，`type=access`）+ refresh token（7 天，`type=refresh`）；`type` 字段防止令牌跨端点滥用
- **数据库无关搜索** — MariaDB 使用 `MATCH AGAINST`，SQLite 自动回退到 `ILIKE`
- **Markdown 渲染** — 文章同时存储 `content_md`（源码）和 `content_html`（渲染+清洗后的 HTML）；摘要未设置时自动从 HTML 提取

## 测试

测试使用内存 SQLite 数据库，通过 FastAPI 的 `dependency_overrides` 实现完全隔离——无需 MariaDB。

```bash
# 运行全部测试
python -m pytest tests/ -v

# 运行单个测试文件
python -m pytest tests/test_auth.py -v
```

## 项目结构

```
blog/
├── app/
│   ├── core/           # 配置、数据库、安全、异常
│   ├── models/         # SQLAlchemy ORM 模型
│   ├── schemas/        # Pydantic v2 校验模型
│   ├── services/       # 业务逻辑层
│   ├── routers/        # API 路由处理
│   ├── main.py         # FastAPI 应用工厂
│   ├── cli.py          # 命令行工具（创建用户等）
│   └── dependencies.py # FastAPI 依赖注入
├── tests/              # Pytest 测试套件（SQLite 隔离）
├── alembic/            # 数据库迁移脚本
├── requirements.txt    # Python 依赖
├── .env.example        # 环境变量模板
└── alembic.ini         # Alembic 配置
```

## 开源协议

MIT
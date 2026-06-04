# Personal Blog API

A personal blog API backend built with **FastAPI** + **SQLAlchemy** + **MariaDB**, featuring JWT authentication, Markdown rendering, full-text search, RSS feed generation, and a complete admin panel API.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (async routes) |
| ORM | SQLAlchemy 2.0 (Mapped-style) |
| Database | MariaDB (production) / SQLite (testing) |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Migration | Alembic |
| Markdown | python-markdown + bleach sanitization |
| Validation | Pydantic v2 |

## Features

- **Blog Posts** — CRUD with Markdown-to-HTML rendering, auto-generated excerpts, slug-based URLs, draft/published status
- **Tags** — Categorize posts with many-to-many tags
- **Comments** — Nested replies (self-referencing `parent_id`), moderation workflow (pending → approved)
- **Full-text Search** — `MATCH AGAINST` on MariaDB, auto-falls back to `ILIKE` on SQLite
- **RSS 2.0 Feed** — Standards-compliant feed at `/api/rss`
- **JWT Authentication** — Dual-token system: access token (30 min) + refresh token (7 days)
- **Admin API** — Complete CRUD for posts, tags, and comments under `/api/admin/*`
- **Auto-generated Docs** — Swagger UI at `/docs`, ReDoc at `/redoc`

## Quick Start

### Prerequisites

- Python 3.11+
- MariaDB (or use SQLite for development)
- pip

### Setup

```bash
# Clone the repository
git clone <repo-url> && cd blog

# Enter the application directory
cd blog

# Create and activate a virtual environment
python -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database URL and secret key

# Run migrations
alembic upgrade head

# Create an admin user
python -m app.cli create-user <username> <email> <password>

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Default |
|----------|------------|---------|
| `DATABASE_URL` | SQLAlchemy connection string | `mysql+pymysql://root@localhost:3306/blog` |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens | (must be changed in production) |
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:3000"]` |
| `ENV` | Environment (`dev` / `prod`) | `dev` |

## API Endpoints

### Public API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | List published posts (paginated, filterable by tag & status) |
| `GET` | `/api/posts/{slug}` | Get a single post with rendered HTML |
| `GET` | `/api/tags` | List all tags |
| `GET` | `/api/posts/{slug}/comments` | Get approved comments for a post |
| `POST` | `/api/posts/{slug}/comments` | Submit a comment (pending moderation) |
| `GET` | `/api/search?q=&page=` | Full-text search across posts |
| `GET` | `/api/rss` | RSS 2.0 feed |
| `POST` | `/api/auth/login` | Login → JWT access + refresh tokens |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Admin API (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/admin/posts` | List all / Create post |
| `GET/PUT/DELETE` | `/api/admin/posts/{slug}` | Read / Update / Delete post |
| `GET/POST` | `/api/admin/tags` | List all / Create tag |
| `GET/PUT/DELETE` | `/api/admin/tags/{id}` | Read / Update / Delete tag |
| `GET` | `/api/admin/comments` | List all comments (including unapproved) |
| `PUT/DELETE` | `/api/admin/comments/{id}` | Approve / Delete comment |

## Architecture

```
Router (thin) → Service (business logic) → Model (SQLAlchemy ORM) → MariaDB
     ↑                                    ↑
  Pydantic schemas                   dependencies.py
  (request/response validation)      (get_db, get_current_user)
```

- **`app/core/`** — Configuration, database engine, JWT/bcrypt security, custom exceptions
- **`app/models/`** — SQLAlchemy 2.0 ORM models: `User`, `Post`, `Tag`, `Comment`
- **`app/schemas/`** — Pydantic v2 validation models (Create/Update/Read variants)
- **`app/services/`** — Business logic: post rendering, comment moderation, search, RSS
- **`app/routers/`** — Thin route handlers (public + admin routers per resource)
- **`app/dependencies.py`** — FastAPI `Depends` callables for DB session and auth

### Key Design Decisions

- **Sync SQLAlchemy with async routes** — Routes use `async def` for concurrency; DB calls are synchronous (no async driver needed for PyMySQL/MariaDB)
- **Dual-token JWT** — Access token (30 min, `type=access`) + refresh token (7 days, `type=refresh`); token type prevents cross-endpoint reuse
- **Database-agnostic search** — `MATCH AGAINST` on MariaDB, `ILIKE` fallback on SQLite
- **Markdown rendering** — Posts store both `content_md` (source) and `content_html` (rendered + sanitized); excerpt auto-generated from HTML

## Testing

Tests use an in-memory SQLite database with FastAPI's `dependency_overrides` for complete isolation — no MariaDB needed.

```bash
# Run all tests
python -m pytest tests/ -v

# Run a specific test file
python -m pytest tests/test_auth.py -v
```

## Project Structure

```
blog/
├── app/
│   ├── core/           # Config, database, security, exceptions
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic v2 validation schemas
│   ├── services/       # Business logic layer
│   ├── routers/        # API route handlers
│   ├── main.py         # FastAPI app factory
│   ├── cli.py          # CLI utilities (create-user, etc.)
│   └── dependencies.py # FastAPI dependency injection
├── tests/              # Pytest test suite (SQLite isolated)
├── alembic/            # Database migration scripts
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
└── alembic.ini         # Alembic configuration
```

## License

MIT
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

    # Public routes
    app.include_router(auth.router)
    app.include_router(posts.router)
    app.include_router(tags.router)
    app.include_router(comments.router)
    app.include_router(search.router)
    app.include_router(rss.router)

    # Admin routes
    app.include_router(posts.admin_router)
    app.include_router(tags.admin_router)
    app.include_router(comments.admin_router)

    return app


app = create_app()

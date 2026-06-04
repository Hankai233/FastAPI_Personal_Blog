import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.main import create_app
from app.models.user import User
from app.core.security import hash_password, create_access_token

SQLITE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=__import__("sqlalchemy.pool").StaticPool,
)
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

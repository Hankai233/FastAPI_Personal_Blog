import typer
from app.core.security import hash_password
from app.core.database import SessionLocal
from app.models.user import User

cli = typer.Typer()


@cli.command()
def create_user(username: str, email: str, password: str):
    """Create an admin user"""
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

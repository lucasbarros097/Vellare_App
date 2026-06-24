"""
Vellare Doces — Database Configuration
=======================================
SQLAlchemy engine, session factory e dependency injection.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# Engine — pool de conexões
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Testa conexão antes de usar
    pool_size=5,
    max_overflow=10,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base declarativa para os models
class Base(DeclarativeBase):
    pass


def get_db():
    """
    Dependency injection para rotas FastAPI.
    Garante que a session é fechada após cada request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

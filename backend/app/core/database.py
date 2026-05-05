from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# This is the actual connection to your PostgreSQL database
engine = create_engine(settings.DATABASE_URL)

# This creates individual database sessions (like opening the filing cabinet)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the base class all your models will inherit from
Base = declarative_base()

# This function gives each API request its own database session
# and closes it when the request is done
def get_db():
    db = SessionLocal()
    try:
        yield db        # give the session to whoever needs it
    finally:
        db.close()      # always close after done
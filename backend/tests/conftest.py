"""
Shared test fixtures.

Tests run against an in-memory SQLite database so the suite needs no Postgres
server and leaves no state behind. These environment variables must be set
before anything imports app.core.config, which reads them at import time.
"""
import os

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET"] = "test-only-secret-do-not-use-outside-the-test-suite"
os.environ["ENVIRONMENT"] = "development"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.database import Base, get_db  # noqa: E402
from app.core.rate_limit import limiter  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.main import app  # noqa: E402
from app.models.blood_request import BloodRequest  # noqa: E402
from app.models.donation import Donation  # noqa: E402
from app.models.kidney_match import KidneyMatch  # noqa: E402
from app.models.kidney_request import KidneyRequest  # noqa: E402
from app.models.user import User  # noqa: E402

# StaticPool keeps every connection pointed at the same in-memory database,
# otherwise each connection would get its own empty one.
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Rate limits are real behaviour we want in production but they would make the
# suite fail depending on test ordering. One test re-enables it deliberately.
limiter.enabled = False


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# ─── Factories ─────────────────────────────────────────────

def make_user(db, email, *, full_name="Test User", phone="0771234567",
              password="Passw0rd123", blood_type="O+", is_donor=False,
              is_admin=False):
    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        hashed_password=hash_password(password),
        blood_type=blood_type,
        is_donor=is_donor,
        is_admin=is_admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def make_kidney_match(db, *, patient, donor):
    request = KidneyRequest(
        patient_id=patient.id,
        patient_name=patient.full_name,
        patient_age=42,
        blood_type=patient.blood_type,
        contact_number=patient.phone,
        hospital_name="National Hospital",
        hospital_city="Colombo",
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    match = KidneyMatch(donor_id=donor.id, request_id=request.id)
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


def make_donation(db, *, patient, donor):
    request = BloodRequest(
        patient_id=patient.id,
        blood_type=patient.blood_type,
        hospital_name="National Hospital",
        hospital_address="Regent Street",
        city="Colombo",
        patient_name=patient.full_name,
        contact_number=patient.phone,
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    donation = Donation(donor_id=donor.id, request_id=request.id)
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


def auth_header(client, email, password="Passw0rd123"):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

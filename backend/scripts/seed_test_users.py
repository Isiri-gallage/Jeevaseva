"""
Seed / reset the local test accounts.

Creates one account per role and sets a known password, so every role can be
exercised without hunting for credentials. Existing accounts matched by email
are updated in place rather than duplicated.

Run from the backend directory:

    .\\venv\\Scripts\\python.exe -m scripts.seed_test_users

DEVELOPMENT ONLY. The guard below refuses to run when ENVIRONMENT=production,
because pointing a password-reset script at a live database would lock out
every real user.
"""
import sys
from pathlib import Path

# Allow running as a plain script as well as with -m.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings  # noqa: E402
from app.core.database import SessionLocal  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.user import User  # noqa: E402
from app.schemas.user import UserRegister  # noqa: E402
from pydantic import ValidationError  # noqa: E402

# Meets the password policy: 8+ characters, at least one letter and one number.
TEST_PASSWORD = "Test1234"

TEST_USERS = [
    {
        "email": "admin@example.com",
        "full_name": "Admin User",
        "phone": "0770000101",
        "blood_type": "O+",
        "is_donor": False,
        "is_admin": True,
    },
    {
        "email": "donor@example.com",
        "full_name": "Donor User",
        "phone": "0770000102",
        "blood_type": "O-",   # universal donor, matches every request
        "is_donor": True,
        "is_admin": False,
    },
    {
        "email": "patient@example.com",
        "full_name": "Patient User",
        "phone": "0770000103",
        "blood_type": "AB+",  # universal recipient, every donor is compatible
        "is_donor": False,
        "is_admin": False,
    },
]


def guard_environment() -> None:
    if settings.is_production:
        sys.exit(
            "Refusing to run: ENVIRONMENT is 'production'.\n"
            "This script rewrites passwords and is for local development only."
        )


def validate_specs() -> None:
    """
    Run every seed record through the same schema the API uses.

    Writing straight to the database bypasses Pydantic, so a seeded account can
    be structurally fine yet impossible to log in with. That happened here: an
    earlier version used a .test domain, which email-validator rejects as a
    reserved TLD, producing three accounts that could never authenticate.
    Validating up front turns that into an immediate, obvious failure.
    """
    for spec in TEST_USERS:
        try:
            UserRegister(**spec, password=TEST_PASSWORD)
        except ValidationError as error:
            first = error.errors()[0]
            field = first["loc"][-1]
            sys.exit(
                f"Refusing to seed: {spec['email']} is invalid.\n"
                f"  {field}: {first['msg']}"
            )


def seed() -> None:
    guard_environment()
    validate_specs()

    db = SessionLocal()
    created, updated = [], []

    try:
        for spec in TEST_USERS:
            user = db.query(User).filter(User.email == spec["email"]).first()

            if user is None:
                user = User(**spec, hashed_password=hash_password(TEST_PASSWORD))
                db.add(user)
                created.append(spec["email"])
            else:
                # Reset the password and re-assert the role flags, so a account
                # that drifted (deactivated, demoted) returns to a known state.
                user.hashed_password = hash_password(TEST_PASSWORD)
                user.full_name = spec["full_name"]
                user.blood_type = spec["blood_type"]
                user.is_donor = spec["is_donor"]
                user.is_admin = spec["is_admin"]
                user.is_active = True
                updated.append(spec["email"])

        db.commit()
    finally:
        db.close()

    report(created, updated)


def report(created, updated) -> None:
    print()
    print(f"  Created: {len(created)}   Updated: {len(updated)}")
    print()
    print(f"  {'Email':<28}{'Password':<12}{'Role'}")
    print(f"  {'-' * 56}")
    for spec in TEST_USERS:
        role = "Admin" if spec["is_admin"] else "Donor" if spec["is_donor"] else "Patient"
        print(f"  {spec['email']:<28}{TEST_PASSWORD:<12}{role} ({spec['blood_type']})")
    print()
    print("  These are local test credentials. Never seed them into a")
    print("  deployed environment.")
    print()


if __name__ == "__main__":
    seed()

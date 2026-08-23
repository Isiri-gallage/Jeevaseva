"""
Shared validation rules.

Every schema imports from here rather than defining its own copy. The rule that
a blood type must be one of eight values should exist once — when it lived only
in user.py, the kidney and blood-request schemas accepted anything at all, and
"PIZZA" was a valid blood type on the endpoint that powers donor matching.

These are *structural* checks: shape, range, and format. Business rules that need
database access (is this user a participant, is this request still open) belong
in the route or service layer, not here.
"""
import re
from typing import Optional

VALID_BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

# bcrypt silently truncates anything past 72 bytes, so reject longer inputs
# rather than accept a password whose tail is ignored.
MAX_PASSWORD_LENGTH = 72
MIN_PASSWORD_LENGTH = 8

# Generous upper bounds. The point is to stop a megabyte of text reaching the
# database, not to second-guess how much detail someone needs to give.
MAX_NAME_LENGTH = 100
MAX_PLACE_LENGTH = 120
MAX_NOTES_LENGTH = 2000


def validate_password_strength(value: str) -> str:
    if len(value) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if len(value) > MAX_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at most {MAX_PASSWORD_LENGTH} characters")
    if not re.search(r"[A-Za-z]", value):
        raise ValueError("Password must contain at least one letter")
    if not re.search(r"[0-9]", value):
        raise ValueError("Password must contain at least one number")
    return value


def validate_phone(value: str) -> str:
    """Sri Lankan mobile/landline: 10 digits, spaces and dashes tolerated."""
    cleaned = re.sub(r"[\s-]+", "", value)
    if not re.match(r"^[0-9]{10}$", cleaned):
        raise ValueError("Phone must be 10 digits")
    return cleaned


def validate_blood_type(value: str) -> str:
    """
    Reject anything outside the eight ABO/Rh types.

    This is not cosmetic: donor/recipient compatibility is computed from this
    field, so an unrecognised value silently breaks matching for that record.
    """
    normalised = value.strip().upper()
    if normalised not in VALID_BLOOD_TYPES:
        raise ValueError(f"Blood type must be one of {', '.join(VALID_BLOOD_TYPES)}")
    return normalised


def clean_text(value: str, field: str, *, minimum: int = 2, maximum: int = MAX_NAME_LENGTH) -> str:
    """
    Trim and length-check a required free-text field.

    Stripping first is what catches "   " — a string that is non-empty to
    `min_length` but blank to a human reading the page.
    """
    cleaned = " ".join(value.split())  # collapses runs of whitespace too
    if len(cleaned) < minimum:
        raise ValueError(f"{field} must be at least {minimum} characters")
    if len(cleaned) > maximum:
        raise ValueError(f"{field} must be at most {maximum} characters")
    return cleaned


def clean_optional_text(value: Optional[str], field: str, *, maximum: int = MAX_NOTES_LENGTH) -> Optional[str]:
    """Same, for a field that may legitimately be omitted."""
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        # An empty optional field is stored as NULL rather than "", so queries
        # do not have to check for both.
        return None
    if len(cleaned) > maximum:
        raise ValueError(f"{field} must be at most {maximum} characters")
    return cleaned


def validate_patient_age(value: int) -> int:
    """Any living patient. Deliberately wide — children receive transplants."""
    if not 1 <= value <= 120:
        raise ValueError("Age must be between 1 and 120")
    return value


def validate_donor_age(value: int) -> int:
    """
    Living donors must be adults.

    18 is a legal consent threshold, not a medical judgement — the platform
    makes no clinical eligibility decisions, but it cannot host an offer from
    someone who cannot legally give consent.
    """
    if not 18 <= value <= 100:
        raise ValueError("Donors must be between 18 and 100 years old")
    return value


def validate_units(value: int) -> int:
    if not 1 <= value <= 20:
        raise ValueError("Units needed must be between 1 and 20")
    return value

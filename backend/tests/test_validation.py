"""
Input validation on the kidney and blood-request endpoints.

These schemas previously had no validators at all, so the core product accepted
a negative age, a blood type of "PIZZA", a phone number of "abc", and an empty
patient name — all with 201 Created. The blood type in particular is not
cosmetic: donor/recipient compatibility is computed from it, so an unrecognised
value silently breaks matching for that record.
"""
import pytest

from tests.conftest import auth_header, make_user

VALID_KIDNEY_REQUEST = {
    "patient_name": "Nimal Perera",
    "patient_age": 45,
    "blood_type": "O+",
    "contact_number": "0771234567",
    "hospital_name": "National Hospital",
    "hospital_city": "Colombo",
    "medical_details": "On dialysis",
    "dialysis_duration": "2 years",
}

VALID_DONOR = {
    "full_name": "Sunil Silva",
    "age": 33,
    "blood_type": "O-",
    "contact_number": "0779876543",
    "city": "Kandy",
    "medical_conditions": "",
    "reason_to_donate": "Want to help",
}


@pytest.fixture
def patient_headers(client, db):
    make_user(db, "patient@example.com")
    return auth_header(client, "patient@example.com")


@pytest.fixture
def donor_headers(client, db):
    make_user(db, "donor@example.com", phone="0770000002", is_donor=True)
    return auth_header(client, "donor@example.com")


# ─── Kidney requests ───────────────────────────────────────

def test_valid_request_is_accepted(client, patient_headers):
    response = client.post("/api/v1/kidney/requests", headers=patient_headers,
                           json=VALID_KIDNEY_REQUEST)
    assert response.status_code == 201, response.text


@pytest.mark.parametrize("field,value,reason", [
    ("patient_age", -5, "negative age"),
    ("patient_age", 0, "zero age"),
    ("patient_age", 999, "impossible age"),
    ("blood_type", "PIZZA", "not a blood type"),
    ("blood_type", "", "empty blood type"),
    ("contact_number", "abc", "non-numeric phone"),
    ("contact_number", "123", "phone too short"),
    ("patient_name", "", "empty name"),
    ("patient_name", "   ", "whitespace-only name"),
    ("patient_name", "A" * 5000, "absurdly long name"),
    ("hospital_name", "   ", "whitespace-only hospital"),
    ("hospital_city", "", "empty city"),
])
def test_kidney_request_rejects_bad_input(client, patient_headers, field, value, reason):
    response = client.post(
        "/api/v1/kidney/requests",
        headers=patient_headers,
        json={**VALID_KIDNEY_REQUEST, field: value},
    )
    assert response.status_code == 422, f"{reason} was accepted: {response.text}"


def test_blood_type_is_normalised(client, patient_headers):
    """Lower case and stray whitespace should be accepted and cleaned up, not
    rejected — otherwise matching breaks on a difference the user cannot see."""
    response = client.post(
        "/api/v1/kidney/requests",
        headers=patient_headers,
        json={**VALID_KIDNEY_REQUEST, "blood_type": " o+ "},
    )
    assert response.status_code == 201, response.text
    assert response.json()["blood_type"] == "O+"


def test_names_are_trimmed(client, patient_headers):
    response = client.post(
        "/api/v1/kidney/requests",
        headers=patient_headers,
        json={**VALID_KIDNEY_REQUEST, "patient_name": "  Nimal   Perera  "},
    )
    assert response.status_code == 201
    assert response.json()["patient_name"] == "Nimal Perera"


def test_phone_accepts_spacing_but_stores_digits(client, patient_headers):
    response = client.post(
        "/api/v1/kidney/requests",
        headers=patient_headers,
        json={**VALID_KIDNEY_REQUEST, "contact_number": "077 123 4567"},
    )
    assert response.status_code == 201
    assert response.json()["contact_number"] == "0771234567"


def test_blank_optional_field_becomes_null(client, patient_headers):
    """An empty optional string is stored as NULL so queries need not check
    for both "" and None."""
    response = client.post(
        "/api/v1/kidney/requests",
        headers=patient_headers,
        json={**VALID_KIDNEY_REQUEST, "medical_details": "   "},
    )
    assert response.status_code == 201
    assert response.json()["medical_details"] is None


# ─── Kidney donors ─────────────────────────────────────────

@pytest.mark.parametrize("field,value,reason", [
    ("age", 15, "under 18 cannot legally consent"),
    ("age", 17, "under 18 cannot legally consent"),
    ("age", 150, "impossible age"),
    ("blood_type", "XYZ", "not a blood type"),
    ("contact_number", "notaphone", "non-numeric phone"),
    ("full_name", "", "empty name"),
    ("city", " ", "whitespace-only city"),
])
def test_donor_registration_rejects_bad_input(client, donor_headers, field, value, reason):
    response = client.post(
        "/api/v1/kidney/donors/register",
        headers=donor_headers,
        json={**VALID_DONOR, field: value},
    )
    assert response.status_code == 422, f"{reason} was accepted: {response.text}"


def test_adult_donor_is_accepted(client, donor_headers):
    response = client.post("/api/v1/kidney/donors/register", headers=donor_headers,
                           json={**VALID_DONOR, "age": 18})
    assert response.status_code == 201, response.text


# ─── Blood requests ────────────────────────────────────────

VALID_BLOOD_REQUEST = {
    "blood_type": "A+",
    "units_needed": 2,
    "urgency": "high",
    "hospital_name": "National Hospital",
    "hospital_address": "Regent Street",
    "city": "Colombo",
    "patient_name": "Nimal Perera",
    "contact_number": "0771234567",
}


def test_valid_blood_request_is_accepted(client, patient_headers):
    response = client.post("/api/v1/requests/", headers=patient_headers,
                           json=VALID_BLOOD_REQUEST)
    assert response.status_code in (200, 201), response.text


@pytest.mark.parametrize("field,value,reason", [
    ("blood_type", "NOPE", "not a blood type"),
    ("units_needed", 0, "zero units"),
    ("units_needed", -3, "negative units"),
    ("units_needed", 500, "absurd unit count"),
    ("contact_number", "xyz", "non-numeric phone"),
    ("patient_name", "  ", "whitespace-only name"),
    ("latitude", 200, "latitude out of range"),
    ("longitude", -900, "longitude out of range"),
])
def test_blood_request_rejects_bad_input(client, patient_headers, field, value, reason):
    response = client.post(
        "/api/v1/requests/",
        headers=patient_headers,
        json={**VALID_BLOOD_REQUEST, field: value},
    )
    assert response.status_code == 422, f"{reason} was accepted: {response.text}"

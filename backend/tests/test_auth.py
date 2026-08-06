"""Registration, login, and token-scope behaviour."""
from tests.conftest import auth_header, make_user

VALID_REGISTRATION = {
    "full_name": "Nimal Perera",
    "email": "nimal@example.com",
    "phone": "0771234567",
    "password": "Passw0rd123",
    "blood_type": "O+",
    "is_donor": True,
    "city": "Colombo",
}


def test_register_creates_user(client):
    response = client.post("/api/v1/auth/register", json=VALID_REGISTRATION)

    assert response.status_code == 201, response.text
    body = response.json()
    assert body["email"] == "nimal@example.com"
    assert body["is_donor"] is True
    # The hash must never be serialised back to the client.
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_rejects_duplicate_email(client):
    client.post("/api/v1/auth/register", json=VALID_REGISTRATION)

    duplicate = {**VALID_REGISTRATION, "phone": "0779999999"}
    response = client.post("/api/v1/auth/register", json=duplicate)

    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_register_rejects_duplicate_phone(client):
    client.post("/api/v1/auth/register", json=VALID_REGISTRATION)

    duplicate = {**VALID_REGISTRATION, "email": "other@example.com"}
    response = client.post("/api/v1/auth/register", json=duplicate)

    assert response.status_code == 400
    assert "Phone number already registered" in response.json()["detail"]


def test_register_rejects_password_without_a_digit(client):
    response = client.post(
        "/api/v1/auth/register",
        json={**VALID_REGISTRATION, "password": "onlyletters"},
    )
    assert response.status_code == 422


def test_register_rejects_short_password(client):
    response = client.post(
        "/api/v1/auth/register",
        json={**VALID_REGISTRATION, "password": "Ab1"},
    )
    assert response.status_code == 422


def test_register_rejects_invalid_blood_type(client):
    response = client.post(
        "/api/v1/auth/register",
        json={**VALID_REGISTRATION, "blood_type": "Z+"},
    )
    assert response.status_code == 422


def test_login_returns_token(client, db):
    make_user(db, "patient@example.com")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "patient@example.com", "password": "Passw0rd123"},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"]


def test_login_rejects_wrong_password(client, db):
    make_user(db, "patient@example.com")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "patient@example.com", "password": "WrongPass123"},
    )

    assert response.status_code == 401


def test_login_rejects_disabled_account(client, db):
    user = make_user(db, "banned@example.com")
    user.is_active = False
    db.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "banned@example.com", "password": "Passw0rd123"},
    )

    assert response.status_code == 403


def test_me_requires_authentication(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_returns_current_user(client, db):
    make_user(db, "patient@example.com", full_name="Sunil Silva")
    headers = auth_header(client, "patient@example.com")

    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["full_name"] == "Sunil Silva"


def test_change_password_accepts_body_and_rotates_credentials(client, db):
    make_user(db, "patient@example.com")
    headers = auth_header(client, "patient@example.com")

    response = client.post(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": "Passw0rd123", "new_password": "BrandNew456"},
    )
    assert response.status_code == 200

    # Old credentials stop working, new ones start.
    assert client.post(
        "/api/v1/auth/login",
        json={"email": "patient@example.com", "password": "Passw0rd123"},
    ).status_code == 401
    assert client.post(
        "/api/v1/auth/login",
        json={"email": "patient@example.com", "password": "BrandNew456"},
    ).status_code == 200


def test_change_password_rejects_wrong_current_password(client, db):
    make_user(db, "patient@example.com")
    headers = auth_header(client, "patient@example.com")

    response = client.post(
        "/api/v1/auth/change-password",
        headers=headers,
        json={"current_password": "NotMyPass9", "new_password": "BrandNew456"},
    )
    assert response.status_code == 400


def test_websocket_ticket_is_not_accepted_as_a_bearer_token(client, db):
    """
    A ws ticket is deliberately scoped. If it were usable as a normal token, the
    short expiry would be the only thing protecting the whole REST API.
    """
    make_user(db, "patient@example.com")
    headers = auth_header(client, "patient@example.com")

    ticket = client.post("/api/v1/chat/ws-ticket", headers=headers).json()["ticket"]

    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {ticket}"},
    )
    assert response.status_code == 401

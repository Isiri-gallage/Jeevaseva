"""
Chat authorization.

The WebSocket handler used to trust a client-supplied receiver_id and never
checked that the sender belonged to the conversation, so any authenticated user
could post into any thread. resolve_counterparty is now the single gate for
both the socket and the REST history endpoints; these tests pin that behaviour.
"""
import pytest

from app.api.v1.chat import ConversationError, resolve_counterparty
from tests.conftest import auth_header, make_donation, make_kidney_match, make_user


@pytest.fixture
def cast(db):
    """A patient, the donor matched to them, and an unrelated third user."""
    return {
        "patient": make_user(db, "patient@example.com", phone="0770000001"),
        "donor": make_user(db, "donor@example.com", phone="0770000002", is_donor=True),
        "outsider": make_user(db, "outsider@example.com", phone="0770000003"),
    }


# ─── resolve_counterparty (the gate itself) ────────────────

def test_donor_resolves_to_patient(db, cast):
    match = make_kidney_match(db, patient=cast["patient"], donor=cast["donor"])

    receiver = resolve_counterparty(db, cast["donor"].id, kidney_match_id=match.id)

    assert receiver == cast["patient"].id


def test_patient_resolves_to_donor(db, cast):
    match = make_kidney_match(db, patient=cast["patient"], donor=cast["donor"])

    receiver = resolve_counterparty(db, cast["patient"].id, kidney_match_id=match.id)

    assert receiver == cast["donor"].id


def test_outsider_cannot_resolve_a_kidney_conversation(db, cast):
    match = make_kidney_match(db, patient=cast["patient"], donor=cast["donor"])

    with pytest.raises(ConversationError) as exc:
        resolve_counterparty(db, cast["outsider"].id, kidney_match_id=match.id)

    assert exc.value.code == "forbidden"


def test_outsider_cannot_resolve_a_donation_conversation(db, cast):
    donation = make_donation(db, patient=cast["patient"], donor=cast["donor"])

    with pytest.raises(ConversationError) as exc:
        resolve_counterparty(db, cast["outsider"].id, donation_id=donation.id)

    assert exc.value.code == "forbidden"


def test_donation_participants_resolve_correctly(db, cast):
    donation = make_donation(db, patient=cast["patient"], donor=cast["donor"])

    assert resolve_counterparty(db, cast["donor"].id, donation_id=donation.id) == cast["patient"].id
    assert resolve_counterparty(db, cast["patient"].id, donation_id=donation.id) == cast["donor"].id


def test_missing_conversation_is_not_found(db, cast):
    with pytest.raises(ConversationError) as exc:
        resolve_counterparty(db, cast["donor"].id, kidney_match_id=999999)

    assert exc.value.code == "not_found"


def test_requires_exactly_one_conversation_id(db, cast):
    match = make_kidney_match(db, patient=cast["patient"], donor=cast["donor"])
    donation = make_donation(db, patient=cast["patient"], donor=cast["donor"])

    with pytest.raises(ConversationError) as exc:
        resolve_counterparty(db, cast["donor"].id)
    assert exc.value.code == "invalid_target"

    with pytest.raises(ConversationError) as exc:
        resolve_counterparty(
            db, cast["donor"].id,
            donation_id=donation.id, kidney_match_id=match.id,
        )
    assert exc.value.code == "invalid_target"


# ─── REST history endpoints ────────────────────────────────

def test_participant_can_read_kidney_history(client, db, cast):
    match = make_kidney_match(db, patient=cast["patient"], donor=cast["donor"])
    headers = auth_header(client, "donor@example.com")

    response = client.get(f"/api/v1/chat/history/kidney/{match.id}", headers=headers)

    assert response.status_code == 200
    assert response.json() == []


def test_outsider_is_denied_kidney_history(client, db, cast):
    match = make_kidney_match(db, patient=cast["patient"], donor=cast["donor"])
    headers = auth_header(client, "outsider@example.com")

    response = client.get(f"/api/v1/chat/history/kidney/{match.id}", headers=headers)

    assert response.status_code == 403


def test_outsider_is_denied_donation_history(client, db, cast):
    donation = make_donation(db, patient=cast["patient"], donor=cast["donor"])
    headers = auth_header(client, "outsider@example.com")

    response = client.get(f"/api/v1/chat/history/{donation.id}", headers=headers)

    assert response.status_code == 403


def test_chat_history_requires_authentication(client, db, cast):
    match = make_kidney_match(db, patient=cast["patient"], donor=cast["donor"])

    assert client.get(f"/api/v1/chat/history/kidney/{match.id}").status_code == 401

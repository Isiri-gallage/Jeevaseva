# RaktaSeva

**Connecting kidney patients in Sri Lanka with living donors.**

[![CI](https://github.com/Isiri-gallage/RaktaSeva/actions/workflows/ci.yml/badge.svg)](https://github.com/Isiri-gallage/RaktaSeva/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.12](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)

---

## The problem

Patients in end-stage renal failure wait years for a kidney. Many living-donor
matches never happen simply because the patient and a willing donor have no way
to find each other — the search happens through word of mouth, Facebook groups,
and hospital noticeboards.

RaktaSeva gives that search a home: patients post a request, potential living
donors register their blood type and city, and the two sides can find each
other and talk directly through the platform. Emergency blood donation matching
runs alongside it on the same donor base.

> **Scope note.** RaktaSeva is a *connection* platform. It does not perform
> medical matching, crossmatch testing, or organ allocation. Every connection
> made here still goes through a transplant centre for the actual medical and
> legal process.

## Features

**Kidney donation** — the primary flow
- Patients post a request with blood type, hospital, city, and dialysis history
- Living donors register availability and browse open requests
- Donors express interest; patients accept and open a private conversation
- Match lifecycle tracked through to hospital coordination

**Blood donation**
- Emergency requests with urgency levels and city-based donor matching
- Donors see requests compatible with their blood type

**Across both**
- Real-time chat over authenticated WebSockets between matched parties
- JWT authentication with role-aware routing (patient / donor / admin)
- Admin panel for user verification, moderation, and platform stats

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Axios, Lucide icons |
| Backend | FastAPI, SQLAlchemy 2, Pydantic v2 |
| Database | PostgreSQL 16, Alembic migrations |
| Realtime | WebSockets (FastAPI native) |
| Auth | JWT (python-jose), bcrypt via passlib |
| Infra | Docker, docker compose, nginx, GitHub Actions |

## Architecture

```mermaid
flowchart LR
    B["React SPA<br/>nginx :3000"]

    subgraph API["FastAPI :8000"]
        R["REST /api/v1"]
        W["WebSocket /chat/ws"]
    end

    DB[("PostgreSQL :5432")]

    B -->|"HTTPS + Bearer JWT"| R
    B -->|"WSS + short-lived ticket"| W
    R --> DB
    W --> DB
```

Backend layering:

```
app/
├── api/v1/      HTTP routers — request handling, no business rules
├── core/        config, database, security, dependencies, rate limiting
├── models/      SQLAlchemy ORM tables
├── schemas/     Pydantic request/response contracts + validation
├── services/    business logic
└── socket/      WebSocket connection registry
```

## Getting started

### Option A — Docker (recommended)

Requires Docker Desktop. Brings up Postgres, the API, and the frontend together.

```bash
cp .env.example .env
```

Set `JWT_SECRET` in `.env` — compose refuses to start without it:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

Then:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| API docs (Swagger) | http://localhost:8000/docs |
| API docs (ReDoc) | http://localhost:8000/redoc |
| Health check | http://localhost:8000/health |

Migrations run automatically on backend startup.

### Option B — Run locally

**Prerequisites:** Python 3.12, Node.js 20, PostgreSQL 16 running locally.

**1. Create the database**

```bash
createdb raktaseva
```

**2. Backend**

```bash
cd backend
```

```bash
python -m venv venv
```

```bash
.\venv\Scripts\activate
```

```bash
pip install -r requirements.txt
```

```bash
cp .env.example .env
```

Edit `backend/.env` with your database credentials and a generated `JWT_SECRET`, then apply migrations:

```bash
alembic upgrade head
```

```bash
uvicorn app.main:app --reload --port 8000
```

> Run uvicorn from the `backend/` directory — settings load `.env` relative to the working directory.

**3. Frontend** (in a second terminal)

```bash
cd frontend
```

```bash
npm install
```

```bash
npm start
```

## Configuration

### `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | **Required.** `postgresql://user:pass@host:5432/raktaseva` |
| `JWT_SECRET` | — | **Required.** Token signing key. Must be long and random. |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `ENVIRONMENT` | `development` | `production` enables startup validation of `JWT_SECRET` |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed browser origins |

### `frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `REACT_APP_API_URL` | `http://localhost:8000/api/v1` | API base URL. Inlined at **build** time. |

The chat WebSocket URL is derived from `REACT_APP_API_URL`, so there is no separate variable to keep in sync.

## API overview

All endpoints are under `/api/v1`. Full interactive reference at `/docs`.

| Group | Prefix | Purpose |
|---|---|---|
| Authentication | `/auth` | Register, login, profile, password change |
| Kidney | `/kidney` | Requests, donor registry, match lifecycle |
| Blood Requests | `/requests` | Emergency blood requests |
| Donors | `/donors` | Donor responses and donation tracking |
| Chat | `/chat` | WebSocket ticket, socket, message history |
| Admin | `/admin` | User management, moderation, stats |

### Authenticating a WebSocket

Browsers cannot attach an `Authorization` header to a WebSocket handshake. Rather
than putting a long-lived token in the URL — where it lands in proxy and access
logs — the client exchanges its access token for a **60-second, socket-only ticket**:

```
POST /api/v1/chat/ws-ticket     (Authorization: Bearer <access token>)
  → { "ticket": "...", "expires_in": 60 }

WS   /api/v1/chat/ws?ticket=<ticket>
```

The ticket carries a `ws` scope and is rejected by the REST API, so a leaked
ticket cannot be replayed against user data.

Message payloads carry no `receiver_id` — the server resolves the recipient from
the conversation itself:

```json
{ "kidney_match_id": 42, "message": "Hello, I'd like to help." }
```

## Testing

```bash
cd backend
```

```bash
pip install -r requirements-dev.txt
```

```bash
pytest
```

The suite runs against in-memory SQLite, so no database server is required.
Coverage focuses on authentication and the chat authorization boundary — the
place where a mistake would expose private conversations between patients and
donors.

```bash
pytest --cov=app --cov-report=term-missing
```

## Database migrations

Schema changes go through Alembic. `create_all()` is deliberately not used, since
it cannot alter an existing table.

```bash
alembic revision --autogenerate -m "describe the change"
```

```bash
alembic upgrade head
```

```bash
alembic check
```

`alembic check` reports any drift between the models and the live database — useful before a deploy.

## Security

Implemented:
- Passwords hashed with bcrypt; hashes never leave the server
- JWT access tokens, scope-separated from WebSocket tickets
- Chat authorization resolved server-side from conversation membership
- Rate limiting on login, registration, and password change
- Credentials kept out of URLs and query strings
- Startup refuses a default or weak `JWT_SECRET` when `ENVIRONMENT=production`
- Generic 500 responses; stack traces go to logs only

Known limitations for a production deployment:
- Tokens are stored in `localStorage`, which is readable by any XSS on the page.
  Moving to httpOnly cookies would require CSRF protection in exchange.
- No refresh tokens or server-side revocation — a stolen token is valid until it expires.
- Rate limiting is in-process; multiple API replicas need shared Redis storage.
- The WebSocket connection registry is in-process; horizontal scaling needs a pub/sub backplane.
- No email or phone verification on registration.

## Roadmap

- [ ] Email/SMS verification at registration
- [ ] Refresh tokens with revocation
- [ ] Push/email notification when a donor responds
- [ ] Sinhala and Tamil localisation
- [ ] Hospital accounts for verifying transplant coordination
- [ ] Mobile client (the `mobile/` directory is a placeholder)

## Contributing

Issues and pull requests are welcome. CI runs linting, the backend test suite,
and a production frontend build on every pull request — please make sure those
pass locally first.

## License

[MIT](LICENSE) © Isiri Gallage

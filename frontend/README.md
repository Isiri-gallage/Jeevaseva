# RaktaSeva — Frontend

React SPA for the RaktaSeva kidney and blood donor network.
See the [project README](../README.md) for setup, architecture, and deployment.

## Quick start

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm start
```

Runs on http://localhost:3000 and expects the API at the URL in `REACT_APP_API_URL`
(defaults to `http://localhost:8000/api/v1`).

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Development server with hot reload |
| `npm run build` | Production bundle into `build/` |
| `npm test` | Test runner (watch mode) |

## Structure

```
src/
├── components/   layout shell, ErrorBoundary, shared UI
├── context/      AuthContext — session state and login/logout
├── pages/        route components, grouped by role
│   ├── auth/     login, register
│   ├── kidney/   request board, post request, donor registration
│   ├── donor/    donor dashboard, matching requests
│   ├── patient/  blood request creation and tracking
│   ├── admin/    user and request management
│   └── shared/   chat, profile
├── services/     api.js — Axios client, interceptors, endpoint map
└── utils/        formatting helpers and constants
```

> `REACT_APP_*` variables are inlined at **build** time, not read at runtime.
> Changing the API URL requires a rebuild.

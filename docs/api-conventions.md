# GameHub API Conventions (MVP 1)

> Mandatory communication conventions for GameHub developers.
> Source of truth: `AGENTS.md`, `docs/architecture.md`, `docs/authentication.md`, `docs/database.md`, approved requirement IDs.
> No application code is defined here. No new API architectures are introduced.

## 1. API Base URL

- All JSON API routes live under `/api/<resource>`.
- The frontend reads the base from the public `VITE_API_URL` value (`http://localhost:5000/api` locally; backend `http://localhost:5000`, frontend `http://localhost:5173`).
- `VITE_API_URL` carries no secrets.

## 2. REST-Style API Approach

- Resource-oriented HTTP endpoints over Express.
- Standard verbs: `GET` read, `POST` create or action, `PATCH` partial update where approved.
- No GraphQL, no RPC framework, no versioned URL scheme beyond `/api/<resource>` unless Carl approves one.

## 3. HTTP/JSON Communication

- Requests and responses use JSON with `Content-Type: application/json` where a body is present.
- Cookie-based browser credentials are sent with `credentials: include`; the `gamehub_session` cookie itself is never read or written by frontend JavaScript.
- CORS allows the configured frontend origin with credentials; preflight (`OPTIONS`) returns `204`.

## 4. Endpoint Naming Conventions

- Plural lowercase resources: `/api/auth`, `/api/users` (where approved for MVP 1 staff administration).
- Authentication endpoints (exact):
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Health: `GET /api/health`.
- No future-resource endpoints (tables, rates, reservations, sessions, transactions, products, reports) are specified here.

## 5. Request Structure

- JSON body for `POST`/`PATCH`; query strings for filtering/listing where approved.
- Staff credential fields use agreed names only; never send roles, permissions, password hashes, or session tokens from the client.
- Reservation guest flows (later MVPs) use reference plus required contact fields, never customer accounts.

## 6. Response Structure

- Every API response uses one of the two envelopes below. No bare arrays, strings, or driver documents.

## 7. Success Response Envelope

```json
{
  "success": true,
  "data": {}
}
```

- `data` holds the resource or result object. Empty results use `{}`.

## 8. Error Response Envelope

```json
{
  "success": false,
  "error": {
    "code": "...",
    "message": "..."
  }
}
```

- Validation failures may add `"details": []` with per-field messages.
- `code` is a stable machine-readable string; `message` is human-readable.

## 9. HTTP Status Code Conventions

- `200` successful operation (including login, logout, me, reads, updates).
- `201` resource created (for example, staff account creation where approved).
- `400` invalid request shape or malformed input.
- `401` unauthenticated: missing, invalid, expired, or destroyed session.
- `403` authenticated but the staff role lacks permission.
- `404` resource not found.
- `409` business conflict (for example, duplicate unique staff username).
- `422` validation or business-input issue with `details` where useful.
- `500` unexpected server error with a generic message only.

## 10. Authentication Behavior

- Per `docs/authentication.md`: server-managed sessions only.
- Login sets the HttpOnly `gamehub_session` cookie (7-day lifetime, `SameSite=Lax`, `Secure` in production) and returns the staff identity without secrets or tokens.
- Logout destroys the server session and clears the cookie.
- `GET /api/auth/me` restores identity after page refresh from the cookie.
- No frontend token handling. No JWT or OAuth.

## 11. Authorization Behavior

- The backend verifies the session-derived role on every protected request.
- A role supplied by the frontend is never trusted.
- ADMIN and CASHIER boundaries from `docs/architecture.md` apply; customer/guest routes stay public where approved.

## 12. Validation Behavior

- Validate all external input near the API boundary (controllers/validation layer).
- Frontend validation is UX only; backend validation is the source of truth.
- Business rules live in services (including the archived/inactive staff gate, uniqueness, and credential checks).
- Return `400` for malformed input and `422` with `details` for semantic validation issues.

## 13. ID Serialization

- MongoDB ObjectIds are serialized as 24-character hex strings in API payloads.
- The backend validates and converts string IDs before repository use; invalid IDs yield `400`, not driver errors.

## 14. Date/Time Format

- API date/time values use ISO 8601 strings in UTC (for example, session creation/expiry and staff timestamps).
- The backend owns canonical time; the frontend never supplies authoritative timestamps.

## 15. Error Handling

- Centralized backend error middleware maps errors to the error envelope with the correct status.
- Never expose stack traces, database internals, password hashes, session tokens or hashes, connection strings, or secrets.
- Log server-side detail privately; return only the safe envelope to clients.

## 16. Frontend API-Layer Responsibilities

- Single API client using `VITE_API_URL` with `credentials: include`.
- JSON parsing, envelope unwrapping, and `401`/`403` UX handling (redirect or gate).
- Login form, logout action, and `me`-on-boot session restoration.
- No role decisions, no direct database access, no secrets in `VITE_*` variables.

## 17. Backend Route/Controller/Service Responsibilities

- Routes: path definitions only under `/api/<resource>`.
- Controllers: parse input, call services, return the correct envelope and status code.
- Services: authentication, session lifecycle, staff business rules, coordination between repositories.
- Repositories: official-driver data access only (per `docs/database.md`); no business logic, no HTTP concerns.

## 18. Security Considerations

- Secrets only in environment; `.env` never committed; `.env.example` documents keys.
- `HttpOnly` session cookie; `Secure` in production; `SameSite=Lax`; 7-day lifetime.
- Security headers, JSON body limits, and CORS-with-credentials per backend middleware.
- `401` versus `403` semantics from `docs/authentication.md` apply to every protected endpoint.

## 19. MVP 1 Endpoint Contracts

Locked contracts for MVP 1 staff administration and the cashier dashboard. Administration endpoints require an authenticated ADMIN session (otherwise `401`/`403` per §11). No tables collection and no table CRUD exist in MVP 1.

### Create cashier — `POST /api/users` (ADMIN only)

Request:

```json
{
  "username": "cashier01",
  "password": "secure-password",
  "displayName": "Cashier 01"
}
```

The backend validates required fields, enforces unique username (duplicate → `409`), assigns role `CASHIER` and status `ACTIVE`, hashes the password with `crypto.scrypt`, and never returns `passwordHash`. Success: `201`.

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "cashier01",
      "displayName": "Cashier 01",
      "role": "CASHIER",
      "status": "ACTIVE",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

### View cashiers — `GET /api/users` (ADMIN only)

Returns cashier accounts only, without `passwordHash`, session tokens, or authentication secrets. Success: `200` with `{ "success": true, "data": { "users": [] } }`.

### Update cashier — `PATCH /api/users/:id` (ADMIN only)

Updatable account information: `username`, `displayName`, and `password` when explicitly changed. Role cannot change through this endpoint, and ADMIN accounts cannot be modified through it. Invalid IDs → `400`; unknown accounts → `404`.

### Archive cashier — `PATCH /api/users/:id` with `{ "status": "ARCHIVED" }` (ADMIN only)

Archiving is a state transition, not deletion: the account remains stored, future logins fail, and existing sessions for the user are invalidated. No `DELETE` endpoint exists.

### Cashier dashboard — `GET /api/cashier/dashboard` (authenticated staff only)

Establishes the protected dashboard response structure for CA-003. The MVP 1 response may carry an empty table collection because tables are implemented in MVP 2:

```json
{
  "success": true,
  "data": {
    "tables": []
  }
}
```

The frontend shows an empty-state dashboard and invents no table records.

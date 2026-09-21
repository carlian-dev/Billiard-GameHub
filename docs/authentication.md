# GameHub Authentication Architecture (MVP 1)

> Agreed authentication architecture for **MVP 1 — Foundation, Staff Access & Initial Operations**.
> Source of truth: `AGENTS.md`, `docs/requirements.md`, `docs/architecture.md`, approved requirement IDs.
> No application code is defined here. No new technologies or authentication methods are introduced.

## 1. Overview

- Only staff have accounts. Customers use a guest flow with no accounts.
- Authentication is server-managed and session-based.
- The backend is the source of truth for identity and roles.
- All responses follow the standard envelope:
  - Success: `{ "success": true, "data": {} }`
  - Error: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message." } }`

## 2. MVP 1 Authentication Boundary

MVP 1 authentication covers:

- AD-001 Admin login
- AD-002 Admin logout
- CA-001 Cashier login
- CA-002 Cashier logout

The following MVP 1 items consume authentication but are not defined here:

- AD-003 Create cashier accounts
- AD-004 View cashier accounts
- AD-005 Update cashier account information
- AD-006 Archive cashier accounts
- CU-001 Customer landing page
- CA-003 Cashier dashboard table statuses

MVP 2 (Tables & Rates) comes after MVP 1 and is out of scope for this document.

## 3. Staff Roles

- **ADMIN:** administrative configuration and records.
- **CASHIER:** onsite operational activities.
- Do not merge ADMIN and CASHIER responsibilities.
- Roles are verified on the backend on every protected request. A role supplied by the frontend is never trusted.

## 4. Customer Guest Flow

- Customer accounts do not exist and are out of scope.
- Customers use the public guest flow.
- Reservation lookup and cancellation use the reservation reference plus the required contact information, not customer accounts.

## 5. Server-Managed Sessions

- Sessions are persistent `authSessions` records in MongoDB (see `docs/database.md`). The in-memory Map used by the project foundation is not the final implementation.
- Login creates a session record; logout and expiration destroy or invalidate it.
- The session identifies the authenticated staff user on protected requests.
- Archiving a staff account invalidates that account's existing sessions.
- `authSessions` (authentication) stays conceptually separate from future billiard playing sessions. No alternative authentication mechanism is introduced here.

## 6. HTTP-Only Cookie Authentication

- Cookie name: `gamehub_session`
- Session lifetime: 7 days
- `HttpOnly`: yes
- `SameSite=Lax`
- `Secure` in production
- Browser-managed credentials: the frontend sends requests with credentials included and never reads or stores the cookie value directly.
- The frontend must not receive or manage authentication tokens.

## 7. User Account Structure (Concept)

- Staff account identity (username).
- Staff role: `ADMIN` or `CASHIER`. Customer accounts do not exist.
- Staff status: exactly `ACTIVE` or `ARCHIVED`. No additional status values exist in MVP 1.
  - `ACTIVE` may authenticate and use authorized staff functionality.
  - `ARCHIVED` cannot authenticate; existing sessions for the account are invalidated; the account remains stored for historical/audit purposes and is never deleted.
- Password hash via Node.js `crypto.scrypt`. Passwords must never be stored as plaintext. The stored record carries the salt and parameters scrypt needs for verification. No password-hashing dependency is added.
- First ADMIN provisioning uses a controlled backend bootstrap mechanism: it requires explicit administrator/developer control, never exposes ADMIN creation through the public API, never stores plaintext passwords in source code, and uses the same scrypt mechanism. AD-003 creates CASHIER accounts only.

## 8. Authentication Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## 9. Login Flow

1. Client submits staff credentials to `POST /api/auth/login`.
2. Backend validates input near the API boundary.
3. Backend authenticates server-side: the account must exist with status `ACTIVE`, and the password is verified with `crypto.scrypt`.
4. Backend creates a persistent `authSessions` record.
5. Backend sets the `gamehub_session` HttpOnly cookie.
6. Backend returns the authenticated staff identity without exposing secrets, password hashes, or session internals.

## 10. Logout Flow

1. Client calls `POST /api/auth/logout`.
2. Backend destroys the persistent session record.
3. Backend clears the `gamehub_session` cookie.
4. Backend returns a success envelope.

## 11. Session Restoration After Page Refresh

1. The browser automatically sends the `gamehub_session` cookie on refresh.
2. The frontend calls `GET /api/auth/me`.
3. The backend resolves the session: the record must exist, must not be expired, and the owning user must still exist with status `ACTIVE`. It then returns the staff identity and role.
4. The frontend restores the authenticated UI state from that response.

## 12. Authentication vs Authorization

- Authentication answers who the caller is.
- Authorization answers what the caller’s role is allowed to do.
- Both are enforced on the backend.

## 13. 401 vs 403 Behavior

- `401` unauthenticated: no valid session or session has expired or been destroyed.
- `403` forbidden: authenticated but the staff role is not authorized for the requested operation.
- Error responses use the standard error envelope and must not expose stack traces, database internals, credentials, secrets, or passwords.

## 14. Frontend Authentication Responsibilities

- Render login, logout, and session-restoration UI.
- Submit credentials and call `GET /api/auth/me` on boot/refresh.
- Redirect or gate UI on `401` and `403`.
- Perform client-side validation for UX only.
- Never decide roles, never trust local role state for authorization, and never expose backend secrets through `VITE_*` variables.

## 15. Backend Authentication Middleware Flow

- Parse and validate the `gamehub_session` cookie session server-side.
- Attach the authenticated staff identity to the request.
- Enforce authentication before protected handlers (`401` when missing or invalid).
- Enforce role authorization after authentication (`403` when the role is insufficient).
- Keep layer responsibilities intact: routes define paths, controllers handle request/response and status codes, services contain authentication logic and rules, repositories own data access through the official MongoDB Node.js Driver.

## 16. Non-Goals

- No JWT, OAuth, or other authentication approaches.
- No customer accounts or customer login sessions.
- No in-memory session Map as the final implementation.
- No status values beyond `ACTIVE` and `ARCHIVED`.
- No table creation, editing, archiving, maintenance, rates, reservations, or playing sessions in MVP 1.
- No MVP 2 or later business features.

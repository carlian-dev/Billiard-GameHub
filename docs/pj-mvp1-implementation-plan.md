# PJ — MVP 1 Implementation Plan (AD-001 through AD-004)

> Proposal for team/Carl review. Planning only — no application code, no commits, no branches created.
> Source of truth: `AGENTS.md`, `docs/mvp-roadmap.md`, `docs/requirements.md`, `docs/architecture.md`,
> `docs/authentication.md`, `docs/database.md`, `docs/api-conventions.md`, `docs/functional-requirements-tracking.md`.

## 1. Assigned Scope (confirmed)

Per `docs/mvp-roadmap.md` §1.2, Developer PJ holds:

- AD-001 Admin login
- AD-002 Admin logout
- AD-003 Create cashier accounts
- AD-004 View cashier accounts

Status: To Do. No functional requirement is implemented.

## 2. Requirement Meanings

- **AD-001 Admin login:** ADMIN authenticates with username + password against a persisted, `ACTIVE` staff account. Backend sets the HttpOnly `gamehub_session` cookie (7-day lifetime, `SameSite=Lax`, `Secure` in production). Identity restores via `GET /api/auth/me`.
- **AD-002 Admin logout:** ADMIN ends the authenticated session. Backend destroys the server-side session and clears the cookie via `POST /api/auth/logout`.
- **AD-003 Create cashier accounts:** ADMIN creates CASHIER accounts (`username`, `password`, `displayName`) via `POST /api/users`. Role forced `CASHIER`, status `ACTIVE`, password hashed with `crypto.scrypt`, unique username enforced (duplicate → `409`), hash never returned. Success → `201`.
- **AD-004 View cashier accounts:** ADMIN lists cashier accounts via `GET /api/users`. Cashiers only, no `passwordHash`/session/secrets. Success → `200` with `data.users`.

## 3. Module Mapping

- AD-001, AD-002 → Authentication & Authorization module.
- AD-003, AD-004 → Cashier Account Management (shares the `users` resource with JAZ's AD-005/AD-006).

## 4. Architecture Fit

Implemented along the existing chain:

```
React + Vite
    ↓ HTTP/JSON
Express
    ↓
Routes → Controllers → Services → Repositories → Official MongoDB Node.js Driver → MongoDB Atlas
```

- Backend is source of truth for authentication, roles, and uniqueness.
- Frontend is UI/UX only, never decides roles, never trusts local role state.
- Sessions are server-managed; the `gamehub_session` cookie is HttpOnly and never read by frontend JS.
- Database access stays in repositories using the official MongoDB Node.js Driver only.

## 5. Layer Fit

- **Database:** `users` (ADMIN + CASHIER staff accounts) and — pending decision — `authSessions` (persistent server sessions).
- **Backend:** extend `auth.service.js`/`auth.controller.js`; new `user.service.js`, `user.controller.js`, `user.routes.js`; extend `user.repository.js`.
- **Frontend:** Admin login page, logout action, session-restore on boot, Admin cashier create/list view via `frontend/src/lib/api.js`.

## 6. Relevant Existing Files

- Backend: `src/app.js`, `src/routes/index.js`, `src/routes/auth.routes.js`, `src/controllers/auth.controller.js`, `src/services/auth.service.js`, `src/repositories/user.repository.js`, `src/middleware/authContext.js`, `src/middleware/requireAuth.js`, `src/middleware/errorHandler.js`, `src/middleware/security.js`, `src/utils/errors.js`, `src/db/mongo.js`.
- Frontend: `src/App.jsx`, `src/main.jsx`, `src/lib/api.js`.

## 7. Files Likely Modified/Added

Modified:

- `backend/src/services/auth.service.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/repositories/user.repository.js`
- `backend/src/middleware/authContext.js` (session source, pending decision)
- `backend/src/routes/index.js`
- `frontend/src/App.jsx`
- `frontend/src/lib/api.js`
- `docs/functional-requirements-tracking.md` (status/assignee update only, after approval)

Added (proposed):

- `backend/src/controllers/user.controller.js`
- `backend/src/services/user.service.js`
- `backend/src/repositories/authSession.repository.js` (pending decision)
- `backend/src/routes/user.routes.js`
- ADMIN bootstrap script (pending decision on owner)
- Frontend Admin views/components
- Feature implementation documentation

## 8. Dependencies on Other Developers/Modules

- AD-001 depends on a stored `ACTIVE` ADMIN account → requires the controlled ADMIN bootstrap mechanism (`docs/authentication.md` §7); owner to be decided.
- AD-003/AD-004 depend on the `users` repository and `users` collection.
- Auth module is shared with JAM (CA-001/CA-002 use the same login/logout endpoints; CA-003 consumes the dashboard endpoint).

## 9. Potential Conflicts

- **PJ vs JAM:** AD-001/AD-002 and CA-001/CA-002 target the same `POST /api/auth/login` and `POST /api/auth/logout` endpoints and the same auth service. One shared implementation of the flow; role checks differ. Must be coordinated.
- **PJ vs JAZ:** AD-003/AD-004 and AD-005/AD-006 all touch `user.repository.js` and likely the same Admin cashier-management page.
- **Session persistence** (in-memory Map → `authSessions`) touches shared auth middleware used by all staff; ownership must be decided.

## 10. Proposed Implementation Order (modular plan)

| # | Scope | FR(s) | Deliverables |
|---|---|---|---|
| 1 | Shared prerequisites (decision-gated) | — | `authSessions` persistence + ADMIN bootstrap (owner: pending Carl decision) |
| 2 | Auth service evolution | AD-001, AD-002 | Real DB-backed login/logout, `ACTIVE` gate, scrypt, cookie set/clear, session create/destroy; demo-user handling decision |
| 3 | Users repository | AD-003, AD-004 | `createCashier`, `findCashiers`, `findByUsername`, unique-username check, id conversion |
| 4 | Cashier creation API | AD-003 | `POST /api/users` (ADMIN-only) → `201` |
| 5 | Cashier listing API | AD-004 | `GET /api/users` (ADMIN-only) → `200` |
| 6 | Admin frontend | AD-001–004 | Admin login, logout, cashier create/list UI |

Order on one feature branch: 2 → 3 → 4 → 5 → 6. No separate branch per FR needed. PR referencing AD-001–AD-004 for Carl review.

## 11. Validation Strategy

- Zod is NOT installed and there is no project-wide validation convention (verified).
- Continue with existing manual boundary validation (`400`/`422` with `details`).
- Recommend Zod later, progressively, only with Carl approval. Primary candidates: `POST /api/users`, `POST /api/auth/login`.

## 12. Testing Plan (proposed; no tests exist yet)

No test runner or scripts exist in any `package.json`. Proposed: Bun's built-in `bun test` (no new dependency), pending approval.

- **AD-001:** scrypt round-trip, ACTIVE/ARCHIVED gate (unit); valid ADMIN login → `200` + cookie, wrong password → `401`, malformed input → `400`, archived → `401`, no secret/hash leak (API).
- **AD-002:** session destroyed, cookie cleared → `200`; idempotent logout (unit + API).
- **AD-003:** unique-username check, forced role/status, hash stored, hash never projected (unit); ADMIN-only → `201`, anonymous → `401`, cashier → `403`, duplicate → `409`, missing fields → `400`/`422` (API).
- **AD-004:** returns cashiers only, no secrets (unit); ADMIN-only → `200` with `data.users`, empty list → `200 []`, anonymous → `401`, cashier → `403` (API).

## 13. Documentation Plan

Feature documentation (location per project convention) covering: implemented FR IDs, module purpose, frontend/backend/API changes, validation schemas, database changes, technical decisions, dependencies, testing performed, known limitations, notes for other developers.

Shared docs updated only for approved changes (e.g., tracking status after approval; `docs/database.md`/`docs/authentication.md` only for genuinely approved architecture changes).

## 14. Open Decisions for Team/Carl

1. Ownership of `authSessions` persistence and the ADMIN bootstrap mechanism (shared infra vs PJ scope).
2. Demo users: keep behind a dev flag after real DB auth, or remove.
3. PJ/JAM split on shared login/logout implementation.
4. PJ/JAZ coordination on Admin cashier-management page and `user.repository.js`.
5. Test tooling approval (`bun test`).
6. Frontend navigation approach (react-router vs minimal state-based) — new dependency requires approval.
7. Zod: deferred progressive introduction unless Carl approves now.

## 15. Scope Control

- Implement assigned FRs only. No tables, reservations, playing sessions, billing, F&B, payments, reports, or dashboards beyond admin scope.
- No new architecture, framework, database, or authentication approach without team approval.
- No unrelated module changes.
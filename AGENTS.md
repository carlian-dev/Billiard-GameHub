# AGENTS.md — GameHub / Billiard-GameHub

> Project foundation/shell exists alongside this documentation. Architecture and requirements are established.
> Functional requirements are still To Do unless explicitly marked otherwise. No functional requirement should be claimed as implemented.
> Source of truth: approved architecture, requirements, and development rules for this project, including `docs/mvp-roadmap.md`, `docs/authentication.md`, `docs/database.md`, and `docs/api-conventions.md`.
> Do not invent requirements, architecture, or requirement IDs.

## 1. OpenCode Role and Behavior

OpenCode is the **programmer / implementation agent**. It is NOT the project architect or requirements owner.

Follow strictly:

```
UNDERSTAND → INSPECT → PLAN → WAIT FOR APPROVAL → IMPLEMENT → TEST → REPORT
```

When asked to implement something:

1. Identify the official requirement code.
2. Understand the requirement.
3. Inspect current architecture and implementation.
4. Identify dependencies.
5. Propose an implementation plan.
6. Wait for developer / Carl review and approval.
7. Implement approved scope only.
8. Test.
9. Report changed files and results.
10. Commit.
11. Push.
12. Create Pull Request.
13. Carl reviews.
14. Integrate.

Rules:

- Inspect relevant existing code first before proposing changes.
- Explain affected files, dependencies, and possible conflicts.
- Propose a plan before making changes.
- Do not modify unrelated modules.
- Do not independently redefine requirements or architecture.
- If a requirement conflicts with current architecture:
  - Stop.
  - Explain the conflict.
  - Identify the affected architecture.
  - Propose options.
  - Wait for developer / Carl decision.

Carl owns architecture, foundation, shared infrastructure, integration, code review, and final technical decisions.

## 2. Technology Constraints (Hard)

Confirmed stack:

- Frontend: React + Vite + JavaScript
- Runtime / Package Manager: Bun (project's package manager and runtime/tooling choice; do not use npm as primary)
- Backend: Express + JavaScript
- API: JSON REST-style API
- Database: MongoDB Atlas, NoSQL document database
- Database access: Official MongoDB Node.js Driver only

DO NOT USE:

- PHP
- Laravel
- MySQL
- PostgreSQL
- Prisma
- Mongoose
- SQL databases

MongoDB is a hard architectural constraint. Do not introduce unnecessary technologies, libraries, infrastructure, or architectural patterns.

## 3. Architecture Rules

Use 3-layer backend architecture:

```
React + Vite
    ↓ HTTP/JSON
Express
    ↓
Routes → Controllers → Services → Repositories → Official MongoDB Node.js Driver → MongoDB Atlas
```

Responsibilities:

- **Routes:** HTTP route definitions only.
- **Controllers:** Handle HTTP requests/responses, parse request input, return appropriate HTTP status codes.
- **Services:** Contain GameHub business logic, enforce business rules, coordinate operations between modules/repositories.
- **Repositories:** Handle MongoDB data access. Keep database operations separated from business logic.
- **Frontend:** UI, forms, navigation, user interaction, displaying data, client-side validation, API communication.

Backend is final source of truth for:

- authorization
- table availability
- reservation conflicts
- billing calculations
- payment validity
- business rules

Planned base path: `/api/<resource>` — see `docs/architecture.md`. Do not implement endpoints unless assigned via an approved requirement and MVP scope.

## 4. NoSQL Rules

- MongoDB Atlas document database only.
- Use official MongoDB Node.js Driver.
- Initial planned collections only: `users`, `authSessions` (MVP 1 authentication sessions, separate from future playing-session `sessions`), `tables`, `rates`, `reservations`, `sessions` (future playing sessions), `transactions`, `products`, `activity_logs`.
- These are architecture definitions. Do not create collections as part of documentation or unrelated work.
- Keep database operations in repositories, separated from business logic.
- Keep domain concepts separate:
  - **Reservation:** future booking for a table.
  - **Session:** actual playing session.
  - **Transaction:** customer bill/payment record.
  - Workflow: `Reservation → Check-in → Session → Bill → Payment → Transaction = PAID`.

## 5. Security Rules

- Only `ADMIN` and `CASHIER` require accounts. Customer accounts are not required.
- Authentication must securely hash passwords, authenticate server-side, establish an authenticated session/credential, and identify the user on protected requests.
- Authorization must happen on the backend, verify the authenticated user's role, and never trust a role supplied by the frontend.
- `ADMIN` manages administrative configuration and records. `CASHIER` handles onsite operational activities. `CUSTOMER/GUEST` uses public reservation functionality.
- Do not unnecessarily merge `ADMIN` and `CASHIER` responsibilities. Example: Cashier controls operational `AVAILABLE ↔ OCCUPIED`; Admin controls maintenance/archive configuration.
- Environment secrets must never be hardcoded.
- `.env` must never be committed.
- `.env.example` should document required configuration.
- Never expose backend secrets through `VITE_*` frontend variables.
- Do not expose stack traces, database internals, credentials, secrets, or passwords in API responses.

## 6. Validation / Error Rules

- Validate all external input near the API boundary.
- Business rules belong in services.
- Frontend validation is for UX only. Backend validation is the source of truth.
- Server-side business rules that must eventually be enforced include: reservation overlap, reservation maximum duration, no-show grace period, table availability, maintenance/archived restrictions, duplicate active sessions, minimum billable duration, applicable rate, payment restrictions, transaction state, role authorization.
- Response conventions:
  - Success: `{ "success": true, "data": {} }`
  - Error: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message." } }`
  - Validation errors may include `"details": []`.
- Status conventions: `200` success, `201` created, `400` invalid request, `401` unauthenticated, `403` forbidden, `404` not found, `409` business conflict, `422` validation/business input issue, `500` unexpected error.

## 7. MVP Rules

MVP-first modular development (authoritative sequence in `docs/mvp-roadmap.md`):

- MVP 1: Foundation, Staff Access & Initial Operations
- MVP 2: Tables & Rates
- MVP 3: Reservations
- MVP 4: Playing Sessions
- MVP 5: Billing & F&B
- MVP 6: Payments & Digital Receipts
- MVP 7: Reports, History & Administrative Operations

Project foundation scope: repo/project setup, React+Vite foundation, Bun runtime/tooling + Express foundation, MongoDB Atlas connection foundation, official driver, env config, basic API/frontend structure, centralized error handling, auth/RBAC foundation, basic security, health-check endpoint, frontend-to-backend communication.

Project foundation does not include table management, reservations, walk-in sessions, session timer, billing, F&B ordering, payments, digital receipts, reports, advanced dashboards, cashier scheduling, or reservation administration. Implement assigned MVP scope only; do not build later MVP features early.

## 8. Development Workflow

Requirement-driven development only:

1. Identify official requirement code.
2. Understand requirement.
3. Inspect architecture/implementation.
4. Identify dependencies.
5. Propose plan.
6. Get approval.
7. Implement approved scope.
8. Test.
9. Report.

See `docs/development-guide.md` for Definition of Done and conflict handling. See `docs/functional-requirements-tracking.md` for tracking. See `docs/mvp-roadmap.md` for the authoritative MVP sequence, `docs/authentication.md` for the session/cookie contract, `docs/database.md` for `users`/`authSessions` concepts, and `docs/api-conventions.md` for envelopes, status codes, and layer responsibilities. Preserve official requirement IDs. Do not invent IDs.

## 9. Scope Control

- Implement assigned functional requirements only.
- Do not introduce new architectural decisions.
- Do not invent functional requirements.
- Do not build future MVP scope early.
- State machines, business rules, and API conventions in `docs/requirements.md` and `docs/architecture.md` are constraints, not implementation instructions.

## 10. Git Expectations

- Feature branches → integration branch → main branch.
- Commit and push only when requested per workflow.
- Create Pull Requests for Carl review.
- Keep changes scoped; no unrelated module changes.
- See `docs/git-workflow.md`.

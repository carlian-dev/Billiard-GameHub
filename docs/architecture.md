# GameHub Architecture

> Architecture constraints only. Not an instruction to implement now.
> Do not create collections, APIs, auth, or features as part of documentation.
> Source of truth: approved stack, 3-layer backend, modules, collections, domain separation, state machines, API conventions.

## 1. System Architecture

```
React + Vite
    ↓ HTTP/JSON
Express
    ↓
Routes → Controllers → Services → Repositories → Official MongoDB Node.js Driver → MongoDB Atlas
```

- Frontend communicates with backend via JSON REST-style API.
- Runtime / Package Manager: Bun (project's package manager and runtime/tooling choice; do not use npm as primary).
- Backend is final source of truth for authorization, table availability, reservation conflicts, billing calculations, payment validity, and business rules.
- No unnecessary technologies, libraries, infrastructure, or architectural patterns.

## 2. Frontend Architecture

- Framework: React + Vite + JavaScript.
- Runtime / Package Manager: Bun (project's package manager and runtime/tooling choice; do not use npm as primary).
- Responsibilities: UI, forms, navigation, user interaction, displaying data, client-side validation, API communication.
- Client-side validation is for UX only. Backend validation is the source of truth.
- Must never supply or decide authorization roles. Never expose backend secrets through `VITE_*` variables.

## 3. Backend Architecture

3-layer separation (Bun as runtime/tooling; Express + JavaScript backend):

- **Routes:** HTTP route definitions only. Planned base path `/api/<resource>`.
- **Controllers:** Handle HTTP requests/responses, parse request input, return appropriate HTTP status codes.
- **Services:** Contain GameHub business logic, enforce business rules, coordinate operations between modules/repositories.
- **Repositories:** Handle MongoDB data access. Keep database operations separated from business logic. Use official MongoDB Node.js Driver only.

Cross-cutting foundation: centralized error handling foundation, authentication foundation, RBAC foundation, basic security foundation, health-check endpoint, frontend-to-backend communication.

## 4. Module Boundaries

Future system will eventually contain:

1. Authentication & Authorization
2. Table Management
3. Rate Management
4. Customer Reservation
5. Walk-in & Reservation Check-in
6. Session Management
7. Billing
8. F&B
9. Payment
10. Dashboard
11. Audit Logging
12. Reports

Modules are logical boundaries. Do not implement them in documentation. Do not modify unrelated modules during future feature work.

Role boundary:

- `ADMIN` manages administrative configuration and records.
- `CASHIER` handles onsite operational activities.
- `CUSTOMER/GUEST` uses public reservation functionality.
- Example: Cashier controls operational `AVAILABLE ↔ OCCUPIED`; Admin controls maintenance/archive configuration.

## 5. MongoDB Architecture

- MongoDB Atlas, NoSQL document database only.
- Official MongoDB Node.js Driver only.
- No PHP, Laravel, MySQL, PostgreSQL, Prisma, Mongoose, or SQL databases.

### 5.1 Collection Plan (architecture definitions only)

Initial planned collections:

- `users`
- `authSessions` (MVP 1 authentication sessions; conceptually separate from future playing-session `sessions` below)
- `tables`
- `rates`
- `reservations`
- `sessions` (future playing sessions, not authentication sessions)
- `transactions`
- `products`
- `activity_logs`

Do not create collections as part of documentation or unrelated work.

### 5.2 Data-Access Rules

- All database operations live in repositories, separated from business logic.
- Business rules live in services.
- Input validation lives near the API boundary (controllers / validation layer).

## 6. Domain Separation

- **Reservation:** future booking for a table.
- **Session:** actual playing session.
- **Transaction:** customer bill/payment record.

Workflow:

```
Reservation → Check-in → Session → Bill → Payment → Transaction = PAID
```

Keep domain concepts separate in services, repositories, and future APIs.

## 7. State Machines (Constraints)

Table states: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `UNDER_MAINTENANCE`, `ARCHIVED`.

Conceptual transitions:

- `AVAILABLE → OCCUPIED`
- `AVAILABLE → RESERVED`
- `AVAILABLE → UNDER_MAINTENANCE`
- `AVAILABLE → ARCHIVED`
- `OCCUPIED → AVAILABLE`
- `RESERVED → OCCUPIED`
- `UNDER_MAINTENANCE → AVAILABLE`

Reservation: `CONFIRMED → CHECKED_IN | CANCELLED | EXPIRED`.

Session: `ACTIVE → ENDED | VOIDED`.

Transaction: `PENDING → PAID | VOIDED`.

## 8. API Conventions (Not Implementation)

Base path: `/api/<resource>`.

Planned resources:

- `/api/auth`
- `/api/tables`
- `/api/rates`
- `/api/reservations`
- `/api/sessions`
- `/api/transactions`
- `/api/products`
- `/api/reports`

Authentication endpoints:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Planned examples:

- `GET /api/tables`, `GET /api/tables/:id`, `POST /api/tables`, `PATCH /api/tables/:id`
- `GET /api/rates`, `POST /api/rates`, `PATCH /api/rates/:id`
- `GET /api/reservations/availability`, `POST /api/reservations`, `GET /api/reservations/:reference`, `POST /api/reservations/:reference/cancel`
- `POST /api/sessions`, `GET /api/sessions`, `GET /api/sessions/:id`, `POST /api/sessions/:id/end`, `POST /api/sessions/:id/extend`
- `GET /api/transactions`, `GET /api/transactions/:id`, `POST /api/transactions/:id/payment`
- `GET /api/products`, `POST /api/products`, `PATCH /api/products/:id`

### 8.1 Response Conventions

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message."
  }
}
```

Validation errors may include `"details": []`.

Status conventions: `200` success, `201` created, `400` invalid request, `401` unauthenticated, `403` forbidden, `404` not found, `409` business conflict, `422` validation/business input issue, `500` unexpected error.

Do not expose stack traces, database internals, credentials, secrets, or passwords.

## 9. Authentication / RBAC Architecture

- Only `ADMIN` and `CASHIER` require accounts. Customer accounts are not required.
- Authentication must securely hash passwords, authenticate server-side, establish an authenticated session/credential, and identify the user on protected requests.
- Authorization must happen on the backend, verify the authenticated user's role, and never trust a role supplied by the frontend.
- Backend is final authority for role authorization.

## 10. Validation / Error Architecture

- Validate all external input near the API boundary.
- Business rules in services.
- Future server-side enforcement includes: reservation overlap, maximum duration, no-show grace period, table availability, maintenance/archived restrictions, duplicate active sessions, minimum billable duration, applicable rate, payment restrictions, transaction state, role authorization.

## 11. Environment Configuration

- Environment secrets must never be hardcoded.
- `.env` must never be committed.
- `.env.example` should document required configuration.
- Never expose backend secrets through `VITE_*` frontend variables.
- Planned foundation items: env config, basic API/frontend structure, centralized error handling, auth/RBAC foundation, basic security, health-check endpoint.

# GameHub / Billiard-GameHub

A billiard table reservation and management system supporting customer reservations, walk-in sessions, playing-session tracking, table management, billing, F&B ordering, payments, digital receipts, administration, and reporting.

> Foundation stage: documentation only. No application code exists yet.
> Implementation follows MVP-first, requirement-driven development. See `AGENTS.md`.

## Technology Stack

- **Frontend:** React + Vite + JavaScript
- **Runtime / Package Manager:** Bun (project's package manager and runtime/tooling choice; do not use npm as primary)
- **Backend:** Express + JavaScript
- **API:** JSON REST-style API
- **Database:** MongoDB Atlas (NoSQL document database)
- **Database access:** Official MongoDB Node.js Driver only

Not used: PHP, Laravel, MySQL, PostgreSQL, Prisma, Mongoose, SQL databases.

## High-Level Architecture

```
React + Vite
    ↓ HTTP/JSON
Express
    ↓
Routes → Controllers → Services → Repositories → Official MongoDB Node.js Driver → MongoDB Atlas
```

- Routes: HTTP route definitions only.
- Controllers: request/response handling and status codes.
- Services: business logic and business rules.
- Repositories: MongoDB data access only.
- Backend is the source of truth for authorization, availability, conflicts, billing, payments, and business rules.

Planned API base path: `/api/<resource>`. See `docs/architecture.md`.

## Documentation Index

- `AGENTS.md` — OpenCode role, constraints, architecture/security/validation/MVP rules, workflow, scope, Git expectations.
- `docs/requirements.md` — Project scope, actors, confirmed business rules, workflows, domain separation, MVP roadmap.
- `docs/architecture.md` — System, frontend, backend, modules, MongoDB, collections, state machines, API, auth/RBAC, validation/error, environment.
- `docs/development-guide.md` — Developer and OpenCode workflows, requirement-driven development, module boundaries, testing, Definition of Done, conflicts.
- `docs/git-workflow.md` — Branch strategy, commits, pull requests, review/integration.
- `docs/functional-requirements-tracking.md` — Requirement tracking model, IDs, status/assignment by ADMIN / CASHIER / CUSTOMER / SYSTEM.
- `docs/team.md` — Carl / PJ / JAM / JAZ roles, ownership, workload, communication, OpenCode usage.

## Purpose

Establish the technical and process foundation (MVP 0) before building Tables + Rates (MVP 1), Reservations (MVP 2), Sessions (MVP 3), Billing + F&B (MVP 4), Payments + Receipt (MVP 5), and later reports and advanced admin features.

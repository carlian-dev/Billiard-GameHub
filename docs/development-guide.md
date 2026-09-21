# GameHub Development Guide

> Requirement-driven development only. Preserve official requirement IDs. Do not invent IDs.
> See `AGENTS.md` for OpenCode behavior and `functional-requirements-tracking.md` for tracking.

## 1. Developer Workflow

For feature work:

1. Identify official requirement code.
2. Understand requirement.
3. Inspect current architecture and implementation.
4. Identify dependencies.
5. Propose implementation plan.
6. Developer reviews and approves plan.
7. Implement approved scope only.
8. Test.
9. Report changed files and results.
10. Commit.
11. Push.
12. Create Pull Request.
13. Carl reviews.
14. Integrate.

## 2. OpenCode Workflow

Follow:

```
UNDERSTAND → INSPECT → PLAN → WAIT FOR APPROVAL → IMPLEMENT → TEST → REPORT
```

- Inspect relevant existing code first before proposing changes.
- Explain affected files, dependencies, and possible conflicts.
- Propose a plan before making changes.
- Do not modify unrelated modules.
- Do not independently redefine requirements or architecture.
- Do not introduce unnecessary technologies, libraries, infrastructure, or architectural patterns.

OpenCode is the programmer/implementation agent. It is NOT the project architect or requirements owner.

## 3. Requirement-Driven Development

- Implement assigned functional requirements only.
- Use official requirement codes from the approved requirements source.
- Do NOT invent requirement IDs, merge requirements, or rename IDs.
- Do not build future MVP scope early.
- MVP order: MVP 0 Foundation → MVP 1 Tables + Rates → MVP 2 Reservations → MVP 3 Playing Sessions → MVP 4 Billing + F&B → MVP 5 Payments + Digital Receipt → Later Reports/history/advanced admin.

MVP 0 does NOT include table management, reservations, walk-in sessions, session timer, billing, F&B ordering, payments, digital receipts, reports, advanced dashboards, cashier scheduling, or reservation administration.

## 4. Understand / Plan / Implement / Test Cycle

- **Understand:** Identify requirement code and expected behavior; check `requirements.md` and `architecture.md` constraints.
- **Plan:** List affected files, dependencies, conflicts; wait for developer/Carl approval.
- **Implement:** Approved scope only; respect module boundaries:
  - Routes: route definitions only.
  - Controllers: request/response, input parsing, status codes.
  - Services: business logic and business rules.
  - Repositories: MongoDB access via official driver.
  - Frontend: UI, forms, navigation, client validation, API communication.
- **Test:** Verify behavior; ensure backend remains source of truth for authorization, availability, conflicts, billing, payments, business rules.

## 5. Module Boundaries

Future modules: Authentication & Authorization, Table Management, Rate Management, Customer Reservation, Walk-in & Reservation Check-in, Session Management, Billing, F&B, Payment, Dashboard, Audit Logging, Reports.

- Keep database operations in repositories, separated from business logic.
- Keep business rules in services.
- Validate external input near the API boundary.
- Keep Reservation / Session / Transaction concepts separate.

## 6. Testing Expectations

- Test implemented requirement scope.
- Verify success and error paths using approved response conventions:
  - Success: `{ "success": true, "data": {} }`
  - Error: `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human-readable message." } }`
- Verify status codes: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.
- Ensure no stack traces, database internals, credentials, secrets, or passwords leak in responses.
- Ensure `.env` is not committed and secrets are not exposed via `VITE_*`.

## 7. Definition of Done

- Official requirement code identified and preserved.
- Plan was proposed and approved before implementation.
- Only approved scope implemented; no unrelated module changes.
- Architecture rules followed (Routes → Controllers → Services → Repositories → Driver → Atlas).
- Technology constraints followed (React+Vite+JavaScript, Bun as runtime/package manager, Express+JavaScript, MongoDB Atlas + official driver only; do not use npm as primary).
- Validation and business-rule placement followed (boundary validation; services enforce rules; backend is source of truth).
- Tests executed for implemented scope.
- Changed files and results reported.
- Commit / push / PR performed only when requested per workflow; Carl review completed before integrate.

## 8. Dependencies and Architecture Conflicts

If a requirement depends on unimplemented architecture, another MVP, or conflicts with current architecture:

- Stop.
- Explain the conflict.
- Identify the affected architecture.
- Propose options.
- Wait for developer / Carl decision.

Do not independently redefine requirements or architecture. Do not introduce new architectural decisions to resolve conflicts unilaterally.

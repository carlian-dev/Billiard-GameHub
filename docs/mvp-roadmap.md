# GameHub MVP Roadmap (Current)

> Current agreed development sequence. `docs/requirements.md` §7 reflects this same MVP 1–7 sequence.
> Source of truth for IDs: approved requirement IDs as listed here and in `docs/functional-requirements-tracking.md`. No IDs invented or renumbered.
> No application code is defined here. Nothing below claims any feature is implemented.

## 1. MVP 1 — Foundation, Staff Access & Initial Operations

Scope: project foundation plus staff authentication, cashier account administration, public customer landing, and the initial cashier dashboard. Authentication sessions, RBAC, validation, and error handling per `docs/authentication.md`, `docs/database.md`, and `docs/api-conventions.md`.

Supporting foundation:

- React + Vite
- Bun
- Express
- JavaScript
- MongoDB Atlas
- Official MongoDB Node.js Driver
- REST-style HTTP/JSON API
- Server-managed authentication sessions
- RBAC
- Validation and error handling

### 1.1 MVP 1 Modules

1. Staff Authentication — AD-001, AD-002, CA-001, CA-002
2. Cashier Account Management — AD-003, AD-004, AD-005, AD-006
3. Customer Landing — CU-001
4. Cashier Dashboard — CA-003

### 1.2 MVP 1 Assignments (Status: To Do)

| Developer | Requirements | Status |
|---|---|---|
| PJ | AD-001, AD-002, AD-003, AD-004 | To Do |
| JAZ | AD-005, AD-006, CU-001 | To Do |
| JAM | CA-001, CA-002, CA-003 | To Do |
| Carl | Project setup, Architecture, Integration, Review, Merge | To Do |

### 1.3 MVP 1 Dependency Order

- Authentication foundation → Cashier account management → Initial staff/customer interfaces.
- Authentication (AD-001, AD-002, CA-001, CA-002) is shared infrastructure for the Admin and Cashier requirements; account management and dashboards depend on it.

## 2. MVP 2 — Tables & Rates

- AD-009, AD-010, AD-011, AD-012, AD-016, AD-017, AD-018
- CA-017, CA-018, CA-019
- CU-002, CU-003

Depends on MVP 1 staff access. No MVP 2 work begins until MVP 1 is integrated.

## 3. MVP 3 — Reservations

- CU-004 through CU-014
- AD-028, AD-029, AD-030
- CA-015, CA-016
- Reservation-related system requirements: deferred/unassigned — pending approved MVP placement (see §8). No IDs guessed here.

Depends on MVP 1 guest/landing flow and MVP 2 table/rate availability.

## 4. MVP 4 — Playing Sessions

- CA-006 through CA-014
- Session-control system requirements (session control, table availability, reservation-to-session flow, applicable rates): deferred/unassigned — pending approved MVP placement (see §8). No IDs guessed here.

Depends on MVP 2 tables and MVP 3 reservations.

## 5. MVP 5 — Billing & F&B

- AD-031, AD-032, AD-033
- CA-020, CA-026, CA-027, CA-028
- SYS-007, SYS-008

Depends on MVP 4 sessions.

## 6. MVP 6 — Payments & Digital Receipts

- CA-021, CA-022, CA-023, CA-024, CA-025

Depends on MVP 5 billing.

## 7. MVP 7 — Reports, History & Administrative Operations

Purpose: administrator reporting/history, cashier duty/audit, and remaining system requirements, once their MVP placement is approved. Specific IDs for MVP 7 are deferred/unassigned — see §8. No IDs guessed here.

Depends on the transaction and operations data produced by MVP 2 through MVP 6.

## 8. Deferred / Unassigned Requirement IDs

The following approved IDs have no MVP placement in the existing approved documentation and are explicitly deferred rather than guessed:

- AD-007, AD-008, AD-013, AD-014, AD-015, AD-019, AD-020, AD-021, AD-022, AD-023, AD-024, AD-025, AD-026, AD-027
- CA-004, CA-005, CA-032, CA-033
- CU-015
- SYS-001, SYS-002, SYS-003, SYS-004, SYS-005, SYS-006, SYS-009

Carl to confirm placement before implementation.

## 9. Status and Working Rules

- Every functional requirement listed above has status To Do. No feature is implemented.
- Work stays requirement-driven: identify ID → understand → inspect → plan → wait for approval → implement → test → report → commit → push → PR → Carl review → integrate.
- Feature branches → integration → main. No unrelated module changes.

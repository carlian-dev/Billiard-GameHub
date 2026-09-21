# GameHub Requirements

> Source of truth for approved scope, actors, confirmed business rules, workflows, domain separation, and MVP roadmap.
> State machines, business rules, and API conventions here are constraints, not implementation instructions.
> Do not invent requirements or requirement IDs.

## 1. Project Scope

GameHub / Billiard-GameHub is a billiard table reservation and management system supporting:

- customer reservations
- walk-in sessions
- playing-session tracking
- table management
- billing
- F&B ordering
- payments
- digital receipts
- administration
- reporting

Main modules (future implementation, not built in this documentation task):

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

## 2. Actors

- **ADMIN:** Manages administrative configuration and records.
- **CASHIER:** Handles onsite operational activities.
- **CUSTOMER/GUEST:** Uses public reservation functionality. Customer accounts are NOT required; customer uses guest reservation flow.

Only `ADMIN` and `CASHIER` require accounts.

Important separation:

- Cashier controls operational table status `AVAILABLE ↔ OCCUPIED`.
- Admin controls maintenance/archive configuration.
- Do not unnecessarily merge `ADMIN` and `CASHIER` responsibilities.

## 3. Confirmed Business Rules

### 3.1 Rates

- Regular rate = ₱120/hour.
- Special rate = ₱180/hour.
- Special rate applies to special tables.
- Billing is calculated per minute.
- Minimum billable playing duration is 1 hour.
- Applicable rate used by the session must be retained.

### 3.2 Reservation

- Customer accounts are NOT required.
- Customer uses guest reservation flow.
- Reservation maximum duration = 5 hours.
- Overlapping reservations for the same table are prohibited.
- Customer may cancel anytime before the scheduled time.
- No-show grace period = 20 minutes.
- Reservation scheduled at 5:00 PM must be checked in by 5:20 PM.
- At 5:21 PM it is expired/cancelled.
- A table reserved at 5:00 PM can only be used for a walk-in if at least 1 full billable hour remains before the reservation.
  - Example: 4:00 PM to 5:00 PM is allowed.
  - Example: 4:30 PM to 5:00 PM is not allowed.

### 3.3 Sessions

- A table cannot have more than one active session.
- Session duration is tracked.
- Session can be extended.
- Ending a session triggers final charge calculation.
- Minimum billable duration is 1 hour.
- Applicable rate used by the session must be retained.

### 3.4 Payments

- Payment is only allowed after the game/session is completed.
- No partial payments.
- Payment methods:
  - Cash
  - GCash
- Change is calculated when applicable.
- Transaction becomes PAID only after the cashier records payment.
- Receipt is digital/on-screen.

### 3.5 F&B

- Admin can add/update/archive products.
- Cashier can view products and add F&B items to a bill.
- Cashier can update/remove unfinalized F&B items.
- Inventory/stock tracking is OUT OF SCOPE.

### 3.6 Server-Side Enforcement (future implementation)

The following must eventually be enforced server-side (backend is source of truth; frontend validation is UX only):

- reservation overlap
- reservation maximum duration
- no-show grace period
- table availability
- maintenance/archived restrictions
- duplicate active sessions
- minimum billable duration
- applicable rate
- payment restrictions
- transaction state
- role authorization

## 4. Domain Separation

Keep these concepts separate:

- **Reservation:** A future booking for a table.
- **Session:** The actual playing session.
- **Transaction:** The customer's bill/payment record.

Authoritative workflow:

```
Reservation
    ↓
Check-in
    ↓
Session
    ↓
Bill
    ↓
Payment
    ↓
Transaction = PAID
```

## 5. Workflows (Conceptual)

### 5.1 Reservation Workflow

Future booking for a table via guest flow, subject to overlap prohibition, maximum duration, availability, maintenance/archived restrictions, cancellation before scheduled time, and 20-minute no-show grace period.

### 5.2 Walk-in Workflow

Onsite use without a prior reservation, subject to table availability, maintenance/archived restrictions, duplicate-active-session prohibition, and reservation-buffer rule: at least 1 full billable hour must remain before an upcoming reservation.

### 5.3 Session Workflow

Actual playing session with tracked duration, possible extension, retained applicable rate, minimum 1-hour billable duration, per-minute calculation, and final charge calculation on session end.

### 5.4 Billing / Payment Workflow

Bill derived from completed session plus F&B items; payment only after completion; no partial payments; Cash/GCash; change when applicable; transaction becomes PAID only after cashier records payment; digital/on-screen receipt.

## 6. State Machines (Constraints)

Table states:

- `AVAILABLE`
- `OCCUPIED`
- `RESERVED`
- `UNDER_MAINTENANCE`
- `ARCHIVED`

Conceptual transitions:

- `AVAILABLE → OCCUPIED`
- `AVAILABLE → RESERVED`
- `AVAILABLE → UNDER_MAINTENANCE`
- `AVAILABLE → ARCHIVED`
- `OCCUPIED → AVAILABLE`
- `RESERVED → OCCUPIED`
- `UNDER_MAINTENANCE → AVAILABLE`

Reservation states:

- `CONFIRMED → CHECKED_IN`
- `CONFIRMED → CANCELLED`
- `CONFIRMED → EXPIRED`

Session states:

- `ACTIVE → ENDED`
- `ACTIVE → VOIDED`

Transaction states:

- `PENDING → PAID`
- `PENDING → VOIDED`

Detailed transition enforcement belongs to future MVPs. Do not implement state machines as part of documentation.

## 7. MVP Roadmap

Authoritative sequence in `docs/mvp-roadmap.md`:

- **MVP 1: Foundation, Staff Access & Initial Operations**
- **MVP 2: Tables & Rates**
- **MVP 3: Reservations**
- **MVP 4: Playing Sessions**
- **MVP 5: Billing & F&B**
- **MVP 6: Payments & Digital Receipts**
- **MVP 7: Reports, History & Administrative Operations**

The completed project foundation/shell (repo/project setup, React+Vite foundation, Bun runtime/tooling + Express foundation, MongoDB Atlas connection foundation, official driver, env config, basic API/frontend structure, centralized error handling, auth/RBAC foundation, basic security, health-check endpoint, frontend-to-backend communication) underpins MVP 1.

## 8. Confirmed Requirements vs Future Scope

### Confirmed in this foundation

- Technology stack, 3-layer architecture, collection plan, domain separation, business rules, state machines, API/response conventions, validation/error conventions, auth/RBAC architecture direction, MVP roadmap, team/workflow/Git rules — as documented here and in `architecture.md`.

### Future scope (build only assigned MVP scope)

- Table management, reservations, walk-in sessions, session timer, billing, F&B ordering, payments, digital receipts, reports, advanced dashboards, cashier scheduling, reservation administration.
- Later MVP features must not be built early.

Official functional requirement IDs are tracked in `functional-requirements-tracking.md`. Preserve IDs exactly. Do not invent IDs.

# GameHub Database Architecture (MVP 1)

> Agreed database architecture and decisions required for **MVP 1 — Foundation, Staff Access & Initial Operations**.
> Source of truth: `AGENTS.md`, `docs/requirements.md`, `docs/architecture.md`, `docs/authentication.md`, approved requirement IDs.
> No application code is defined here. No new technologies or authentication methods are introduced.

## 1. Database Overview

- MongoDB Atlas, NoSQL document database.
- Official MongoDB Node.js Driver only.
- Backend-only database access. The React frontend must never access MongoDB directly.
- MVP 1 covers staff access and initial operations:
  - AD-001 Admin login, AD-002 Admin logout
  - AD-003 Create cashier accounts, AD-004 View cashier accounts, AD-005 Update cashier account information, AD-006 Archive cashier accounts
  - CU-001 Customer landing (public, no customer accounts)
  - CA-001 Cashier login, CA-002 Cashier logout, CA-003 Cashier dashboard table statuses
- This document designs only what MVP 1 needs. Later MVP collections are listed as future scope without detailed design.

## 2. MongoDB Atlas Architecture

- Single Atlas database selected by `DB_NAME`.
- Connection configured by `MONGODB_URI` and never hardcoded or committed.
- One shared driver client owned by `backend/src/db`.
- Connection check uses a lightweight `ping` and creates no collections.
- Atlas may remain unconfigured/disconnected during foundation verification; the backend must handle that state safely without leaking internals.

## 3. Database Access Through the Repository Layer

- All driver calls live in repositories. Services contain business rules. Controllers handle request/response. Routes define paths only.
- Existing foundation already follows this shape: `backend/src/db/mongo.js` owns the client; `backend/src/repositories/user.repository.js` performs lookups and contains no business logic.
- No repository may be imported by the frontend. No database handle may cross the HTTP boundary.

## 4. MVP 1 Collections

- `users`
- `authSessions`

No other collections are designed here.

## 5. User / Staff Account Document Structure

- `users` stores ADMIN and CASHIER staff accounts only. Customer accounts do not exist.
- Conceptual fields:
  - Identity: unique staff username.
  - Display name for staff administration display.
  - Role: `ADMIN` or `CASHIER`.
  - Status: `ACTIVE` or `ARCHIVED` (see §9); no other values exist in MVP 1.
  - Password hash via `crypto.scrypt` (see §10).
  - Timestamps: creation and update times (see §8).
- Exact field names and validation rules are implementation detail within this concept and must stay inside the repository layer.

## 6. Authentication Session Document Structure

- `authSessions` persists the server-managed sessions from `docs/authentication.md`.
- Concept per session record:
  - Authenticated user reference (the staff account the session belongs to).
  - Hashed session token (hash of the `gamehub_session` cookie value; the raw token is never stored as the lookup key in plaintext responses and never returned in database responses).
  - Creation time.
  - Expiration time (7-day session lifetime).
  - Last activity time, where appropriate for session validation and expiry.
- Cookie attributes (`HttpOnly`, `SameSite=Lax`, `Secure` in production) remain HTTP-layer concerns; the database stores session identity and lifetime, not cookie flags.

## 7. ObjectId Usage

- `users._id` is the staff account identity used by session user references.
- `authSessions` references the owning staff account by that user identity.
- API callers use opaque string forms where needed; the backend converts and validates identity values before repository use.

## 8. Created / Updated Timestamp Conventions

- Store a creation time on every MVP 1 document.
- Store an update or last-activity time where the record can change (staff updates, session activity).
- Timestamps support account administration, session expiry, and future audit needs.

## 9. User Account Status Representation

- Staff status uses exactly two values: `ACTIVE` and `ARCHIVED`. No additional status values exist in MVP 1.
- `ACTIVE` accounts may authenticate and use authorized staff functionality.
- `ARCHIVED` accounts cannot authenticate; their existing `authSessions` records must fail validation. The account remains stored for historical/audit purposes and is never deleted.
- Enforcement belongs in services at login and on session use, using repository-read account state; the repository itself performs no authorization logic.

## 10. Password Storage Requirements

- Project standard: Node.js `crypto.scrypt`. No password-hashing dependency is added.
- Never store plaintext passwords. Store the salt and parameters scrypt needs for verification alongside the hash.
- Never return password hashes in API responses or database-backed read models.
- The exact low-level scrypt call shape is handled during coding.

## 11. Session Persistence

- Sessions persist in `authSessions` (MongoDB). The foundation in-memory Map is not the final implementation.
- Sessions are server-managed and revocable: logout and expiry destroy or invalidate the stored session.
- Lookup is by hashed session token. The raw cookie value is not used as a database key and is not exposed through database responses.
- Expired sessions must not authenticate. Session restoration after page refresh works through the cookie plus `GET /api/auth/me`, per `docs/authentication.md`.
- No JWT, OAuth, or other authentication architecture is introduced.

## 12. Relevant Indexes

- `users`: unique lookup by staff username; secondary lookup support by role and account state for administration (AD-004/AD-005/AD-006).
- `authSessions`: unique lookup by hashed session token; lookup support by owning user; expiry support by expiration time.
- Index names and options are implementation detail. No future-MVP indexes are defined here.

## 13. Relationship Between Users and Sessions

- One staff account may hold multiple sessions (for example, separate browsers), but each session belongs to exactly one staff account.
- Session records carry the owning user reference; user records do not embed sessions.
- Archiving or deactivating a staff account must prevent new logins and must cause existing sessions for that account to fail validation.

## 14. Data Access Responsibilities

- Repositories: driver calls, identity conversion/validation, index-backed lookups, safe “not configured/disconnected” behavior.
- Services: credential checks, ARCHIVED gate, session creation/destruction/expiry, role checks.
- Controllers/routes: input parsing, status codes, envelope shape, cookie set/clear.
- Frontend: API communication only; no direct database access and no role or session decisions.

## 15. Security Considerations

- Secrets only in environment (`MONGODB_URI`, session/auth secrets); `.env` never committed; `.env.example` documents keys.
- Never expose password hashes, session tokens or hashes, connection strings, stack traces, or database internals in responses.
- Never expose backend secrets through `VITE_*` frontend variables.
- `401` for missing/invalid/expired sessions; `403` for authenticated but unauthorized roles.

## 16. Future Collection Scope

- Later MVPs will need tables, rates, reservations, playing sessions, transactions, F&B, payments, and reports. Those collections are not designed here.
- `docs/architecture.md` lists a broader initial collection plan; only `users` and `authSessions` are in scope for MVP 1 database work in this document.
- Customer reservations continue to use reference-plus-contact lookup with no customer accounts.

# GameHub Team

## 1. Roles

- **Head Developer: Carl**
  - Owns architecture, project foundation, shared infrastructure, integration, code review, final technical decisions.

- **Feature Developer 1: PJ**
- **Feature Developer 2: JAM**
- **Feature Developer 3: JAZ**
  - Own assigned functional requirements, implementation, testing, pull requests.

- **OpenCode:** Programmer / implementation agent. NOT project architect or requirements owner. Follows `UNDERSTAND → INSPECT → PLAN → WAIT FOR APPROVAL → IMPLEMENT → TEST → REPORT`.

## 2. Responsibilities

| Owner | Owns |
|-------|------|
| Carl | Architecture, foundation, shared infrastructure, integration, code review, final technical decisions |
| PJ / JAM / JAZ | Assigned functional requirements, implementation, testing, pull requests |
| OpenCode | Implementation of approved scope only, testing, reporting changed files/results |

## 3. Weekly Workload (Target)

- PJ: 4 functional requirements/week
- JAM: 3 functional requirements/week
- JAZ: 3 functional requirements/week
- Total: 10 functional requirements/week

Work is requirement-driven. Use official requirement codes. Do not invent IDs.

## 4. Ownership Model

- Carl owns cross-cutting foundation and integration.
- Feature developers own assigned requirements end-to-end (implement → test → PR).
- OpenCode does not independently redefine requirements or architecture and does not modify unrelated modules.
- MVP-first order: MVP 0 Foundation → MVP 1 Tables + Rates → MVP 2 Reservations → MVP 3 Playing Sessions → MVP 4 Billing + F&B → MVP 5 Payments + Digital Receipt → Later Reports/history/advanced features.

## 5. Communication / Dependency Rules

- Identify dependencies before implementing.
- Propose plan and wait for developer/Carl approval.
- If requirement conflicts with architecture: stop, explain conflict, identify affected architecture, propose options, wait for developer/Carl decision.
- Keep Pull Requests scoped; Carl reviews before integrate.
- See `docs/development-guide.md` and `docs/git-workflow.md`.

## 6. OpenCode Usage Model

- Inspect relevant existing code first.
- Explain affected files, dependencies, possible conflicts.
- Propose plan before making changes.
- Implement approved scope only.
- Test and report changed files/results.
- Commit/push/PR only when requested; follow feature → integration → main.

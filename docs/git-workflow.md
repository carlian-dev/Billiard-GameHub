# GameHub Git Workflow

> Keep changes scoped. No unrelated module changes.
> Commit/push/PR only when requested per workflow. Carl reviews before integrate.

## 1. Branch Strategy

```
Feature branches → integration branch → main branch
```

- **Feature branches:** Individual requirement implementation by PJ / JAM / JAZ.
- **Integration branch:** Carl-owned integration of reviewed features.
- **Main branch:** Stable, reviewed, integrated state.

## 2. Feature Branches

- Create one branch per assigned requirement scope.
- Implement approved scope only.
- Do not modify unrelated modules.
- Do not build future MVP scope early.
- Keep MongoDB, architecture, and technology constraints intact.

## 3. Integration Branch

- Carl owns shared infrastructure, integration, and final technical decisions.
- Feature work merges to integration only after Pull Request review.
- Resolve dependencies and conflicts at integration with Carl decision if requirements conflict with architecture.

## 4. Main Branch

- Updated only from integration after review.
- Represents reviewed, integrated foundation/features.
- No direct feature commits to main.

## 5. Commit Conventions

- Commit only when requested per workflow.
- Keep commits scoped to the approved requirement.
- Include requirement code in commit message when applicable.
- Never commit `.env` or secrets.
- Verify status/diff scope before committing; stage only intended files.

## 6. Pull Request Process

Workflow:

1. Implement approved scope.
2. Test.
3. Report changed files and results.
4. Commit.
5. Push.
6. Create Pull Request.
7. Carl reviews.
8. Integrate.

- PR must reference official requirement code(s).
- PR description must list changed files, dependencies, and test results.
- No unrelated changes in the same PR.

## 7. Review / Integration Process

- Carl owns code review, architecture, foundation, shared infrastructure, integration, and final technical decisions.
- Address review feedback within the same requirement scope.
- Do not expand scope during review without approval.
- Integration confirms MVP scope control and architectural consistency.

## 8. Rules Against Unrelated Changes

- Do not modify unrelated modules.
- Do not introduce unnecessary technologies, libraries, infrastructure, or architectural patterns.
- Do not independently redefine requirements or architecture.
- If a conflict is found during branching/integration: stop, explain conflict, identify affected architecture, propose options, wait for developer/Carl decision.

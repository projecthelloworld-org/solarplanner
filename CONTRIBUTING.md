# Contributing To Hello Solar Planner

Thank you for helping improve Hello Solar Planner. Contributions from community networks, solar practitioners, field teams, designers, translators, and developers are welcome.

## Before You Start

- Read [README.md](README.md) for the project overview.
- Read [SPEC.md](SPEC.md) before changing calculations or report behavior.
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for module ownership and data flow.
- Search existing issues before opening a duplicate.

## Development Setup

Requirements:

- Node.js 20.19 or newer
- npm

Install and run:

```bash
npm ci
npm run dev
```

Before submitting a merge request:

```bash
npm run check
```

## Branches And Commits

- Create a short-lived branch from the stable open-source branch.
- Use descriptive branch names such as `fix/csv-export` or `feature/project-import`.
- Keep commits focused and use clear imperative messages.
- Do not mix unrelated formatting or generated-file changes into a feature commit.

Open pull or merge requests against the stable open-source branch. Keep organization-specific deployment changes outside reusable planner contributions.

## Coding Guidelines

- Use TypeScript in strict mode.
- Keep calculation and costing logic independent from DOM rendering.
- Prefer small modules with one clear responsibility.
- Use existing project types rather than duplicating object shapes.
- Escape user-controlled content before inserting it into HTML.
- Keep calculations deterministic and cover formula changes with tests.
- Preserve the no-framework architecture unless a major-version proposal is accepted.
- Do not add dependencies for behavior that can be implemented clearly with browser or language APIs.

## Changing Calculations

Calculation changes have a high impact. A merge request that changes formulas must include:

- the formula before and after the change
- the reason and source for the change
- updated assumptions or defaults, if applicable
- representative input/output examples
- updated tests and documentation
- confirmation that Fully DC and Hybrid behavior were both reviewed

## Documentation

Update the relevant document with every user-visible change:

- `README.md`: project overview and quick start
- `USER_MANUAL.md`: user workflows
- `SPEC.md`: functional behavior and formulas
- `docs/DEPLOYMENT.md`: installation and operations
- `CHANGELOG.md`: release-facing summary

## Merge Request Checklist

- [ ] The change is scoped and understandable.
- [ ] `npm run check` passes.
- [ ] New or changed behavior is documented.
- [ ] Calculation changes include tests or documented verification cases.
- [ ] No user data, credentials, local files, or generated secrets are committed.
- [ ] The safety disclaimer remains visible in reports.
- [ ] Mobile and desktop layouts were checked for UI changes.

## Reporting Security Issues

Follow [SECURITY.md](SECURITY.md). Do not disclose a security issue in a public issue before maintainers have had time to respond.

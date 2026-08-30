# Codebase Review And Improvement Roadmap

Review date: 2026-08-30

## Summary

The v1 codebase has a sound small-app foundation: strict TypeScript, pure calculation modules, JSON defaults, a reproducible Vite build, and a static Docker deployment. The first hardening milestone now adds engine tests, central input validation, cautious adequacy language, safe CSV serialization, and recoverable versioned browser storage. The main remaining risks are a large UI entry module, direct HTML string rendering, incomplete browser-level verification, and browser-only persistence.

## Completed Hardening Milestone

Completed after the v1.0.1 review:

- corrected Hybrid inverter sizing to use AC demand and credible AC surge
- corrected multi-controller adequacy capacity
- added Vitest with calculation, equipment, validation, and CSV tests
- added numeric bounds and visible load-table validation feedback
- blocked invalid efficiency and derate assumptions
- added a browser storage schema version and recovery copy for unreadable state
- replaced data-URI CSV export with Blob download and formula-injection protection
- changed `Pass` to `Preliminary checks met`
- updated Kenya/Uganda starter pricing and documented its evidence and limitations

## What Is Working Well

- Calculation, equipment, costing, and recommendation logic are already separated from the DOM.
- Shared TypeScript interfaces define the main data contracts.
- JSON files make assumptions, products, and sample data transparent.
- The app has no backend operational burden.
- Docker/Nginx deployment is simple for partners.
- The report contains adequacy warnings and a clear safety disclaimer.

## Priority Improvements

### 1. Expand Automated Coverage

Priority: highest remaining verification task.

Vitest is now installed and covers core sizing, controller totals, validation, and CSV safety. Extend it to cover:

- autonomy effects on battery sizing
- DC vs Hybrid efficiency behavior
- additional costing edge cases and price-snapshot behavior
- normalization of older LocalStorage projects

Formula tests should use explicit fixtures with expected numeric outputs.

### 2. Split `src/main.ts`

Status: in progress. The first extraction reduced `src/main.ts` from 1,158 to about 750 lines.

Completed:

- shared escaping, cloning, identifiers, and formatting under `utils/`
- saved-state normalization and persistence under `app/persistence.ts`
- planning bundle orchestration under `engine/planner.ts`
- report and CSV assembly under `exports/project-report.ts`
- interface-level tests for persistence recovery and report exports

Remaining:

- panel renderers under `components/`
- event controllers and bootstrap under `app/`

Recommended extraction order:

1. Completed: `utils/html.ts` and `utils/format.ts`
2. Completed: `app/persistence.ts`
3. Completed: `engine/planner.ts`, `exports/csv.ts`, and `exports/project-report.ts`
4. Next: panel renderers under `components/`
5. Then: event controllers and bootstrap under `app/`

Keep the no-framework approach, but make each module independently testable.

### 3. Harden Rendering And Validation

- Escape all user-controlled text before inserting it into HTML.
- Extend central validation to imported project files when portability is added.
- Validate imported or migrated project data against a schema.
- Add a user-facing recovery download/import action for preserved LocalStorage data.

### 4. Add Project Portability

LocalStorage is convenient but device-specific. Add JSON project export/import before introducing a backend. Include a data schema version and migration functions.

### 5. Improve Accessibility

- Add a keyboard and screen-reader pass for accordions, table controls, statuses, and report generation.
- Ensure status is never communicated by color alone.
- Add descriptive table captions and validation feedback.
- Test zoom, narrow desktop, and mobile behavior.

### 6. Improve Release Confidence

- Add browser smoke tests for sample load, Calculate, equipment reset, report, and CSV.
- Add dependency update automation.
- Add a Docker image build job once the GitLab runner supports container builds.
- Publish release notes and immutable tags.

### 7. Make Pricing Regional, Traceable, And Maintainable

The v1 defaults now use a dated Kenya/Uganda retail baseline documented in `docs/PRICING.md`. This is more representative than the original generic USD values, but it remains a planning estimate.

Next steps:

- store price profile, country, source date, tax status, and source references with catalogue data
- provide separate Kenya, Uganda, and custom price profiles instead of one blended baseline
- distinguish verified products from broad balance-of-system allowances
- define the contents of distribution, cabling, earthing, and monitoring kits before presenting them as comparable unit prices
- record low, typical, and high prices so reports can show a cost range instead of false precision
- add price age warnings and a documented six-month review cycle
- preserve the price snapshot used by each project and report
- support local-currency source prices without repeatedly converting rounded USD values
- add delivery, taxes, remote-site logistics, installation, and replacement costs as explicit fields

## Suggested v2 Milestones

### v2.0 Foundation

- module split
- broader engine and browser coverage
- formal schema migrations beyond the current storage version marker
- complete safe-rendering audit
- project-specific assumption and price snapshots

### v2.1 Portability

- project JSON import/export
- reusable project templates
- optional localization support
- Kenya, Uganda, and custom price profiles with dated source metadata

### v2.2 Procurement And Lifecycle Costing

- product catalogue with manufacturer, model, warranty, ratings, and supplier references
- low/typical/high market price ranges
- component-based balance-of-system bills of materials
- shipping, tax, installation, maintenance, and battery replacement costs
- quote comparison and procurement-ready exports

### v2.3 Collaboration

- optional backend adapter
- authenticated shared projects
- audit/version history

The backend should remain optional so community deployments can continue using the static version.

## Dependency Policy

Prefer browser APIs and small, well-maintained packages. New dependencies should have a clear owner, active maintenance, compatible license, and a benefit that outweighs deployment and supply-chain cost.

## Definition Of Done For Structural Changes

- behavior is covered by tests
- public types and persisted data are documented
- no calculation logic is duplicated in UI or report templates
- build and GitLab CI pass
- user and deployment documentation are updated
- migration impact is recorded in the changelog

# Codebase Review And Improvement Roadmap

Review date: 2026-07-15

## Summary

The v1 codebase has a sound small-app foundation: strict TypeScript, pure calculation modules, JSON defaults, a reproducible Vite build, and a static Docker deployment. The main risks are limited automated verification, a large UI entry module, direct HTML string rendering, and browser-only persistence.

## What Is Working Well

- Calculation, equipment, costing, and recommendation logic are already separated from the DOM.
- Shared TypeScript interfaces define the main data contracts.
- JSON files make assumptions, products, and sample data transparent.
- The app has no backend operational burden.
- Docker/Nginx deployment is simple for partners.
- The report contains adequacy warnings and a clear safety disclaimer.

## Priority Improvements

### 1. Add Automated Engine Tests

Priority: highest for v2.

Add a lightweight test runner and cover:

- daily Wh, peak, surge, and critical load calculations
- sun-hour effects on solar and MPPT sizing
- autonomy effects on battery sizing
- DC vs Hybrid efficiency behavior
- equipment rounding and adequacy warnings
- costing, exchange rate, installation, and contingency
- normalization of older LocalStorage projects

Formula tests should use explicit fixtures with expected numeric outputs.

### 2. Split `src/main.ts`

The file currently combines state, persistence, formatting, report/CSV orchestration, HTML rendering, table collection, and event binding.

Recommended extraction order:

1. `utils/escape.ts` and `utils/format.ts`
2. `app/storage.ts` and `app/state.ts`
3. `exports/csv.ts` and `exports/report.ts`
4. panel renderers under `components/`
5. event controllers under `app/`

Keep the no-framework approach, but make each module independently testable.

### 3. Harden Rendering And Validation

- Escape all user-controlled text before inserting it into HTML.
- Add central numeric bounds and validation messages.
- Validate imported or migrated project data against a schema.
- Prevent zero/invalid efficiency values from producing infinite results.
- Add a visible recovery path when LocalStorage is corrupted or unavailable.

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

## Suggested v2 Milestones

### v2.0 Foundation

- module split
- test runner and engine coverage
- schema versioning and migrations
- safe HTML utilities and validation

### v2.1 Portability

- project JSON import/export
- reusable project templates
- optional localization support

### v2.2 Collaboration

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

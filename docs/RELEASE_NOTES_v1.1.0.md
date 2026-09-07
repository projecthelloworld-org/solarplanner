# Hello Solar Planner v1.1.0

Release date: 2026-08-30

## Overview

Version 1.1.0 is the first reliability and maintainability release after the initial open-source launch. It strengthens calculation behavior, saved-project recovery, input validation, regional price assumptions, report exports, automated verification, and module boundaries.

The release remains a planning estimator. It does not replace site assessment, component compatibility checks, protection design, cable sizing, or review by a qualified solar/electrical technician.

## Planning Changes

- Hybrid inverter capacity is now based on AC running demand and the credible surge case across AC loads. DC loads no longer inflate the inverter requirement.
- Multiple MPPT controllers now contribute their combined current capacity to adequacy checks and exports.
- The previous `Pass` label is now `Preliminary checks met`, making clear that the result is a high-level capacity comparison rather than certified design approval.
- Project, load, equipment, price, exchange-rate, and sizing-assumption inputs now have explicit validation bounds.

These corrections may change Hybrid inverter recommendations and adequacy results when an existing project is recalculated.

## Pricing Changes

- Starter product prices now use a dated Kenya/Uganda retail baseline.
- Sources, conversion method, limitations, and the recommended six-month review process are documented in `docs/PRICING.md`.
- Existing projects keep their saved editable prices. Updated defaults are most visible in new or reset sample projects.

Regional defaults remain planning estimates, not supplier quotations. Users should replace them with current local prices before procurement.

## Reliability And Security

- Browser state now carries a schema version.
- Unreadable saved state is preserved under a recovery key when browser storage permits, rather than being deleted.
- Invalid saved values are normalized before they reach sizing calculations.
- CSV output uses Blob-backed downloads and protects spreadsheet applications from formula injection.
- Known vulnerable transitive development dependencies were updated.
- GitHub Actions now verifies the application and deployment image alongside the existing GitLab pipeline.

## Test Coverage

The project now uses Vitest. Fifteen automated tests cover:

- daily energy and load normalization;
- sun-hour and autonomy behavior;
- AC inverter running and surge sizing;
- controller capacity and adequacy status;
- costing and currency conversion;
- validation bounds;
- persistence recovery and schema versioning;
- CSV escaping, selected-system content, and filenames.

## Maintainer Changes

The first `src/main.ts` decomposition phase is complete:

- `src/app/persistence.ts` owns browser storage and project normalization;
- `src/engine/planner.ts` composes planning results;
- `src/exports/project-report.ts` owns printable report and CSV assembly;
- `src/utils/` contains shared formatting and HTML utilities.

The resulting boundaries make persistence and export behavior independently testable while preserving the no-framework architecture.

## Upgrade Notes

1. Back up important v1.0.x projects using PDF and CSV before deployment.
2. Deploy the v1.1.0 static build or container image.
3. Open an existing project and click **Calculate** to apply the corrected sizing logic.
4. Review Hybrid inverter sizing, controller capacity, adequacy warnings, and local prices.
5. Generate a fresh report and have the plan reviewed by a qualified technician.

No server-side migration is required because the default application remains static and browser-based.

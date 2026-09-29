# Changelog

All notable changes to Hello Solar Planner are documented here.

The project follows [Semantic Versioning](https://semver.org/). Release tags use the format `vMAJOR.MINOR.PATCH`.

## Unreleased

Use this section for changes that have not yet been included in a tagged release.

## 1.3.2 - 2026-09-29

- Clarify equipment line totals, price sources and independent option cost breakdowns.
- Regenerate both equipment options on Calculate while preserving quotations and flagging changed equipment.
- Add individual reference-price resets and consistent PDF/CSV price evidence.
- Broaden pricing guidance to indicative African market planning estimates.

See the [release notes](docs/RELEASE_NOTES_v1.3.2.md) for the updated Calculate behavior.

## 1.3.1 - 2026-09-29

- Show advanced load fields appropriate to each appliance's AC/DC type.
- Preserve voltage, advanced entries and pending edits when switching types.
- Ignore inactive AC details in DC calculations and validation, and omit them from DC report details.

## 1.3.0 - 2026-09-29

- Use precise requirements for equipment selection and independent Fully DC and Hybrid plans.
- Apply product-specific inverter efficiency and optional unloaded energy with clear assumptions.
- Add optional startup groups, VA, duration, supply frequency and voltage ranges.
- Add battery operating and charging checks and temperature-aware PV/controller input checks.
- Distinguish passed, failed and unverified checks in the dashboard, PDF and CSV.
- Preserve saved equipment and quotations when upgrading and when switching system options.
- Expand reports with specification sources, installed margins, usable storage and modeled autonomy.
- Simplify user-facing documentation and separate maintainer records.

See the [release notes](docs/RELEASE_NOTES_v1.3.0.md) for existing-project guidance.

## 1.2.0 - 2026-09-07

- Add 12/24/48 V catalogue selection, native small 24 V and 48 V batteries, and input-voltage-specific inverter references with traceable prices.
- Require documented battery string limits; flag unresolved products and unknown BMS ratings.
- Account for integrated MPPT capacity and avoid duplicate generated controller costs.
- Preserve reference IDs, existing custom equipment and quotes through saved-project normalization. Reports and CSV show selected inverter input voltage/type and included MPPT.
- Preserve uncalculated load drafts across sidebar changes; additions and deletions also wait for Calculate. Hold report/export actions while edits are pending.
- Keep form nodes and keyboard focus during sidebar recalculation; add visible focus, accessible row controls, error associations, table scrolling, reduced-motion support and mobile reflow fixes.
- Size controller quantities for the installed rounded panel array; compare edited arrays against controller capacity in the planner, PDF and CSV.
- Round batteries to complete nominal-voltage strings; flag incompatible banks, unconfirmed AC-to-DC replacements, and unsupported assumptions about parallel inverters.
- Generate one adequately rated inverter; show contextual notes about idle consumption, BMS limits, peak/surge, reserve and solar recovery.
- Exclude zero-hour loads from peak/surge; empty projects generate zero equipment and an attention status. Preserve fractional energy through sizing.
- Align starter battery, controller and inverter specifications with pricing. Raise the 450 W panel allowance to USD 110; retain saved project prices.
- Select load-appropriate catalogue sizes instead of forcing full-hub components onto light loads. Add 100 W panels, 40 Ah batteries, 20 A controllers, 300 W inverters, and compact balance-of-system allowances.
- Keep the 2.56 kWh battery at its evidence-backed USD 500 class price, while allowing a one-router plan to use a smaller USD 100 battery class and omit optional monitoring.
- Preserve cents in costing, reconcile converted totals and force USD exchange rate to one.
- Keep the planner usable when browser storage is unavailable. Improve selected-report consistency and print pagination.
- Add numerical regression coverage and a documented accessibility, calculation and pricing review. No runtime dependencies added.

## 1.1.0 - 2026-08-30

### Changed

- Updated starter equipment and sample-project prices to a dated Kenya/Uganda retail baseline.
- Added regional pricing sources, limits, and a six-month refresh method in `docs/PRICING.md`.
- Expanded the product roadmap to cover country price profiles, price ranges, source metadata, procurement, and lifecycle costing.
- Replaced the overconfident `Pass` label with `Preliminary checks met` and retained the qualified-review warning.
- Added central validation bounds for projects, loads, equipment, and sizing assumptions.
- Added versioned browser storage and preserved unreadable saved data under a recovery key instead of deleting it.
- Reworked CSV downloads to use a browser Blob and protected spreadsheet exports from formula injection.
- Extracted persistence, project normalization, planning orchestration, formatting, and report/CSV assembly from `src/main.ts` into independently testable modules.

### Fixed

- Corrected Hybrid inverter sizing to use AC running load and a credible AC surge case rather than total DC + AC demand.
- Counted total MPPT current across multiple controllers in equipment checks and exports.

### Added

- Added Vitest and regression coverage for calculations, sun-hour sensitivity, inverter sizing, controller totals, validation, and CSV serialization.
- Added persistence recovery, schema-version, normalization, report export, and filename tests.
- Added GitHub Actions verification for tests, production builds, and the deployment image while retaining GitLab CI support.

### Security

- Updated vulnerable transitive development dependencies; `npm audit` reports zero known vulnerabilities.

## 1.0.1 - 2026-07-25

### Fixed

- Equipment quantities, capacities, prices, exchange rates, and sizing assumptions can now be edited without the application rerendering on every keystroke.
- Equipment accordions and the user's page position remain stable when an edited value is committed.
- Printable reports now use consistent A4 margins and keep technical, equipment, recommendation, and financial tables together where they fit.
- Report headings no longer become separated from their tables, and the report footer no longer creates a blank trailing page.

## 1.0.0 - 2026-07-15

First supported open-source release.

### Added

- Fully DC and Hybrid DC + AC solar planning options.
- Editable project configuration, electrical loads, equipment, assumptions, and USD-based pricing.
- Load-driven battery, solar array, MPPT controller, and inverter sizing.
- Equipment adequacy checks with Pass and Needs attention states.
- Local browser project storage.
- Printable/PDF reports and CSV exports for the selected system option.
- Hello Hub Lite sample project.
- Docker and Docker Compose production deployment.
- User, deployment, architecture, contribution, security, and release documentation.
- GitLab CI build verification.

### Safety

- Reports clearly state that estimates require review by a qualified solar/electrical technician.

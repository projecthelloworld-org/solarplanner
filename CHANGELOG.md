# Changelog

All notable changes to Hello Solar Planner are documented here.

The project follows [Semantic Versioning](https://semver.org/). Release tags use the format `vMAJOR.MINOR.PATCH`.

## Unreleased

Use this section for changes that have not yet been included in a tagged release.

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

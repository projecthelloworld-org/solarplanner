# Hello Solar Planner

Hello Solar Planner is an open-source, browser-based solar planning tool for Project Hello World, community networks, and practitioners designing power systems for connectivity hubs.

It converts an editable electrical load table into two planning options:

- **Fully DC** for systems that can power loads through DC distribution
- **Hybrid DC + AC** for systems that need both direct DC supply and inverter-backed AC power

The planner estimates energy demand, battery storage, solar array capacity, charge-controller current, inverter capacity, equipment adequacy, and project costs. It also generates a printable report and a spreadsheet-friendly CSV export.

Current supported release: **v1.0.0**

> **PHW branch:** this branch adds the Project Hello World tools landing page for `tools.myhellohub.org`. The reusable planner remains available at `/solar/`. Partner deployments should normally use the `v1.0.0` tag from `master`.

> Hello Solar Planner provides planning estimates, not certified electrical design. A qualified solar/electrical technician must review the final design and installation.

## Open-Source Philosophy

Hello Solar Planner is an open-source project by Project Hello World. Communities, partners, and practitioners are free to use, adapt, and modify it for their needs under the [MIT License](LICENSE).

The default deployment has no backend, no accounts, and no telemetry. Project data remains in the user's browser unless the user exports it.

## Features

- Editable project name, country, system voltage, sun hours, autonomy days, currency, and manual USD exchange rate
- Editable DC and AC load table with quantity, watts, runtime, voltage, surge multiplier, and critical-load flag
- Explicit **Calculate** action so the plan does not change while a user is still typing
- Fully DC and Hybrid DC + AC sizing shown side by side
- Generated solar panels, batteries, controllers, inverter, and balance-of-system equipment
- Manual equipment and unit-price edits with live adequacy warnings
- **Use generated values** reset based on the current calculated load
- Pass or Needs attention status for each system option
- Selected system option controls report and CSV output
- Deliberate **Generate Report** step before report content is rendered
- Browser print/save-to-PDF and CSV export
- Browser LocalStorage project persistence
- Hello Hub Lite sample project
- Responsive desktop/tablet/mobile dashboard
- Production Docker and Docker Compose deployment

## Documentation

| Document | Audience | Purpose |
| --- | --- | --- |
| [USER_MANUAL.md](USER_MANUAL.md) | Planner users | Complete step-by-step operating guide |
| [SPEC.md](SPEC.md) | Technical reviewers | Functional behavior, formulas, and assumptions |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Self-hosters | Docker, static hosting, Dokploy, HTTPS, upgrades, and troubleshooting |
| [docs/PHW_DEPLOYMENT.md](docs/PHW_DEPLOYMENT.md) | PHW operators | `tools.myhellohub.org` branch-specific Dokploy deployment |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Developers | Modules, data flow, persistence, and v2 target structure |
| [docs/CODEBASE_REVIEW.md](docs/CODEBASE_REVIEW.md) | Maintainers | v1 assessment and prioritized v2 roadmap |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributors | Development and merge-request workflow |
| [docs/RELEASING.md](docs/RELEASING.md) | Maintainers | Semantic versioning, branches, tags, and release checklist |
| [SECURITY.md](SECURITY.md) | Deployers/reporters | Supported versions, private reporting, and privacy model |
| [CHANGELOG.md](CHANGELOG.md) | Everyone | Release history |

## Quick Start

Requirements:

- Node.js 20.19 or newer
- npm

Install and start the development server:

```bash
npm ci
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Verify and build:

```bash
npm run check
```

Preview the production build:

```bash
npm run preview
```

## Docker Compose

For a partner or production-style deployment:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:8080
```

Check status:

```bash
docker compose ps
```

Stop:

```bash
docker compose down
```

The container exposes `/healthz` for deployment health checks. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for HTTPS, Dokploy, upgrades, customization, and troubleshooting.

## Basic Workflow

1. Load **Sample** or create a **New Project**.
2. Enter project voltage, sun hours, autonomy, currency, and selected System Option.
3. Add or edit electrical loads.
4. Click **Calculate**.
5. Review daily energy, peak load, surge load, and critical-load energy.
6. Review Fully DC and Hybrid recommendations.
7. Adjust equipment quantities, capacities, or prices if needed.
8. Resolve or document any Needs attention warnings.
9. Click **Generate Report**.
10. Print/save PDF or export CSV.
11. Ask a qualified technician to review the plan before procurement or installation.

## Calculation Summary

Each load contributes:

```text
running watts = quantity x watts
daily Wh = running watts x hours per day
```

Battery storage is based on adjusted daily energy, autonomy, reserve factor, and usable depth of discharge.

Solar sizing uses sun hours:

```text
recommended solar array W =
  adjusted daily Wh
  / sun hours
  / array derate factor
  x battery reserve factor
```

MPPT sizing uses array watts, system voltage, and a safety factor. Hybrid inverter sizing uses peak load, surge load, and inverter headroom.

The complete formulas, rounding rules, and option behavior are documented in [SPEC.md](SPEC.md).

## Project Structure

```text
src/
  assets/                 Bundled images and logos
  data/                   Assumptions, product defaults, branding, and sample project
  engine/                 Calculations, equipment checks, costing, recommendations
  templates/              Eta printable report template
  types/                  Shared TypeScript contracts
  main.ts                 v1 application state, rendering, events, and exports
  styles.css              Dashboard, responsive, report, and print styles
docs/                     Architecture, deployment, review, and release guides
Dockerfile                Production multi-stage image
docker-compose.yml        Self-hosted service definition
nginx.conf                Static server and health endpoint
```

## Editable Defaults

Defaults are transparent JSON files:

- `src/data/assumptions.json`: efficiency, reserve, derating, installation, contingency, and safety text
- `src/data/default-products.json`: starter equipment capacities and USD unit prices
- `src/data/sample-project.json`: Hello Hub Lite example
- `src/data/brand-profiles.json`: internal/legacy report branding metadata

Rebuild after changing JSON defaults.

## Data And Privacy

Projects are stored under the browser LocalStorage key:

```text
hello-solar-planner-state
```

There is no server-side project storage in v1. Clearing browser data can remove saved projects, and projects are not synchronized between devices. Use PDF and CSV exports as portable records.

Do not embed secrets in source files or JSON defaults. This is a static frontend, so anything bundled into it can be viewed by users.

## Releases And Branches

Release tags follow Semantic Versioning:

```text
vMAJOR.MINOR.PATCH
```

- `master` is the reusable open-source product and source of release tags.
- `phw` contains the Project Hello World hosted tools landing page and Dokploy-specific integration.
- Production deployments should pin to an immutable release tag where possible.

See [docs/RELEASING.md](docs/RELEASING.md) before preparing a release.

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md) and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

Before opening a merge request:

```bash
npm ci
npm run check
```

Calculation changes must include the formula rationale, representative examples, documentation updates, and automated tests when the v2 test harness is introduced.

## Known v1 Limitations

- No automated engine or browser test suite yet
- Browser-local persistence only
- No project JSON import/export
- No user accounts or collaboration backend
- Manual exchange-rate entry only
- English-only interface
- `src/main.ts` still combines several UI responsibilities and is a planned v2 refactor

The prioritized improvement plan is in [docs/CODEBASE_REVIEW.md](docs/CODEBASE_REVIEW.md).

## License

Hello Solar Planner is released under the [MIT License](LICENSE).

## Safety Disclaimer

Hello Solar Planner is for planning estimates only and is not certified electrical design. Final installation must be reviewed by a qualified solar/electrical technician and comply with local electrical, structural, grounding, battery, overcurrent protection, and lightning protection requirements.

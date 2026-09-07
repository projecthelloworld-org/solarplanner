# Architecture

## Overview

Hello Solar Planner is a client-only TypeScript application built with Vite. It uses Eta for the printable report template and browser LocalStorage for project persistence. There is no application server or database in the default deployment.

```text
User input
  -> Project state
  -> Calculation engine
  -> Equipment generation and adequacy checks
  -> Costing and recommendations
  -> Dashboard, report, and CSV renderers
  -> LocalStorage / browser downloads / print
```

## Source Layout

```text
src/
  app/                    Persistence and saved-project normalization
  assets/                 Static assets bundled by Vite
  data/                   Default JSON data and sample project
  engine/                 Pure planning, equipment, and costing logic
  exports/                Report and CSV generation
  templates/              Eta report template
  types/                  Shared TypeScript contracts
  utils/                  Shared escaping, identifiers, and formatting
  main.ts                 Application rendering, UI state, and event binding
  styles.css              Dashboard, report, responsive, and print styles
```

## Module Responsibilities

### `src/engine/calculations.ts`

Transforms project loads and assumptions into daily energy, peak and surge demand, battery size, array size, controller current, and inverter size.

This module should remain deterministic and independent of the browser DOM.

### `src/engine/equipment.ts`

Creates generated equipment quantities and checks whether the active equipment plan meets calculated requirements.

### `src/engine/costing.ts`

Creates system-specific cost lines and applies installation, contingency, and exchange-rate assumptions.

### `src/engine/recommendations.ts`

Creates explanatory Fully DC and Hybrid recommendation text.

### `src/engine/planner.ts`

Composes calculation, equipment, costing, and recommendation results into the bundle consumed by the dashboard and selected report. It keeps orchestration out of the DOM layer without duplicating formulas.

### `src/app/persistence.ts`

Owns the persisted state format, project normalization, schema version, recovery copy, and LocalStorage error handling. Its storage interface is injectable so these behaviors can be tested without a browser.

### `src/exports/project-report.ts`

Builds the selected printable Eta report and the spreadsheet-friendly CSV from the same planning bundle.

### `src/templates/report.eta`

Defines the printable report structure. The report receives already-calculated data and should not become a second calculation engine.

### `src/main.ts`

Owns application startup, transient UI state, dashboard HTML rendering, table collection, and event binding. It delegates persistence, planning orchestration, formatting, and report/CSV generation to focused modules.

## Data Sources

- `assumptions.json`: efficiency, reserve, derating, installation, contingency, and disclaimer defaults
- `default-products.json`: starter product capacities and USD prices
- `sample-project.json`: Hello Hub Lite example
- `brand-profiles.json`: report branding data

JSON defaults are compiled into the static application. Changing them requires rebuilding the deployment image.

## State And Persistence

The browser stores the full application state under:

```text
hello-solar-planner-state
```

The app normalizes saved projects on load so newly introduced fields receive defaults. There is no cross-device synchronization, authentication, or server backup.

## Calculation Boundary

The load table becomes the demand source of truth when the user clicks **Calculate**. Manual equipment edits remain active until the user clicks **Use generated values**.

The dashboard calculates both options. `selectedSystem` filters only report and CSV output.

## Extension Boundaries

Contributions should preserve these boundaries:

- calculation, equipment selection, and costing remain deterministic and independent of the DOM;
- report and CSV output consume the same planning bundle as the dashboard;
- browser persistence is isolated behind the persistence module;
- user-controlled content is escaped before HTML rendering; and
- the application remains usable as a static deployment without a backend.

Proposed structural work belongs in the public [roadmap](../ROADMAP.md) and should be discussed before introducing a frontend framework or server dependency.

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
  assets/                 Static assets bundled by Vite
  data/                   Default JSON data and sample project
  engine/                 Pure planning, equipment, and costing logic
  templates/              Eta report template
  types/                  Shared TypeScript contracts
  main.ts                 Application state, rendering, events, CSV/report orchestration
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

### `src/templates/report.eta`

Defines the printable report structure. The report receives already-calculated data and should not become a second calculation engine.

### `src/main.ts`

Currently owns application startup, state normalization, LocalStorage, dashboard rendering, event binding, report generation, and CSV export. This is functional for v1 but is the main refactor target for v2.

## Data Sources

- `assumptions.json`: efficiency, reserve, derating, installation, contingency, and disclaimer defaults
- `default-products.json`: starter product capacities and USD prices
- `sample-project.json`: Hello Hub Lite example
- `brand-profiles.json`: legacy/internal report branding data

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

## v2 Target Structure

The recommended v2 split is:

```text
src/
  app/
    bootstrap.ts
    state.ts
    storage.ts
  components/
    project-panel.ts
    load-table.ts
    equipment-panel.ts
    recommendations.ts
    report-gate.ts
  exports/
    csv.ts
    report.ts
  engine/
  templates/
  types/
  utils/
    escape.ts
    format.ts
```

This keeps UI changes from affecting calculations and makes focused testing possible without introducing a frontend framework.

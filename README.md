# Hello Solar Planner

Hello Solar Planner is a lightweight, no-framework TypeScript web application for early-stage solar planning. It is designed for Project Hello World and community network partners who need a practical way to estimate solar power for community connectivity equipment.

The app helps a user define a project, enter electrical loads, generate equipment quantities, check whether edited equipment can still handle the load, estimate costs, and produce a printable report or CSV export.

Hello Solar Planner is an open-source project by Project Hello World, free for communities, partners, and practitioners to use, adapt, and modify based on their needs.

Hello Solar Planner is for planning estimates only. It is not certified electrical design. Final system design and installation must be reviewed by a qualified solar or electrical technician.

## Documents

- [README.md](README.md) - project overview, setup, and day-to-day usage.
- [USER_MANUAL.md](USER_MANUAL.md) - step-by-step guide for using the planner.
- [SPEC.md](SPEC.md) - detailed product behavior, calculations, data flow, report structure, and safety notes.

## What The App Does

Hello Solar Planner supports a one-page workflow:

1. Define the project context.
2. Enter the load table.
3. Click **Calculate** to update sizing.
4. Review the Fully DC and Hybrid DC + AC options.
5. Edit equipment quantities, capacities, and unit prices.
6. Check adequacy warnings.
7. Print/save a PDF report or export a CSV report.

The planner creates two system options:

- **Fully DC system** - a direct-current architecture that avoids inverter losses where loads can run on DC.
- **Hybrid DC + AC system** - a mixed system that keeps DC supply for efficient network loads while adding inverter capacity for AC devices.

The planner shows both options for comparison. The selected **System Option** controls which one is included in the report and CSV export.

## Core Features

- Create and save projects in browser LocalStorage.
- Enter project details such as country, currency, exchange rate, system voltage, sun hours, autonomy days, and brand profile.
- Add load items with quantity, watts, hours per day, current type, voltage, surge multiplier, and critical load flag.
- Generate equipment from the load demand.
- Edit generated quantities, capacities, and USD unit prices.
- Preserve manual equipment edits until **Use generated values** is clicked.
- Show **Pass** or **Needs attention** adequacy checks for each system option.
- Print/save a browser PDF report.
- Export a focused CSV report.

## Tech Stack

- TypeScript
- Vite
- Eta templates
- Plain HTML and CSS
- LocalStorage
- JSON data files
- No React, Vue, Angular, Svelte, or frontend framework

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the app at:

```text
http://127.0.0.1:5173/
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Run With Docker Compose

Build and run the production container:

```bash
docker compose up --build
```

Open the app at:

```text
http://localhost:8080
```

Stop the container:

```bash
docker compose down
```

The Docker setup builds the Vite app and serves the static `dist/` files with Nginx. Saved projects still live in the user's browser LocalStorage, so no database volume is required.

## Project Structure

```text
src/
  data/
    assumptions.json
    brand-profiles.json
    default-products.json
    sample-project.json
  engine/
    calculations.ts
    costing.ts
    equipment.ts
    recommendations.ts
  templates/
    report.eta
  types/
    project.ts
  main.ts
  styles.css
```

## Basic Usage

Use the **Project Summary** panel to set project-level fields. **System Option** selects the option used in the report and CSV. **Brand profile** affects branding only; it does not change calculations, pricing, or assumptions.

Enter loads in the load table, then click **Calculate**. The app intentionally does not recalculate on every keystroke, so users can finish editing before the plan changes.

Use **Equipment & Pricing** to adjust generated equipment and USD unit prices. Manual edits stay in place when loads change, and warnings update against the latest calculated requirement. Click **Use generated values** to reset equipment quantities and capacities from the current loads.

Open **Report generation** to print/save the selected option as PDF or export a CSV with the project summary, load table, sizing summary, equipment plan, selected recommendation, warnings, and financial detail.

## Data Files

Editable defaults live in `src/data`:

- `default-products.json` - starter equipment, capacities, and unit costs.
- `assumptions.json` - efficiencies, derates, reserve factors, installation, contingency, and disclaimer text.
- `brand-profiles.json` - report/UI branding profiles.
- `sample-project.json` - Hello Hub Lite sample project.

## Calculation Summary

The load table is the source of truth after the user clicks **Calculate**. The engine calculates daily energy, peak load, surge load, adjusted energy, battery size, solar array size, MPPT current, and Hybrid inverter size.

Solar sizing uses sun hours:

```text
recommended solar array W =
  adjusted daily Wh
  / sun hours
  / array derate factor
  x battery reserve factor
```

For the complete formulas and behavior rules, see [SPEC.md](SPEC.md).

## Safety Disclaimer

Hello Solar Planner is for planning estimates only and is not certified electrical design. Final installation must be reviewed by a qualified solar/electrical technician and comply with local electrical, structural, grounding, and lightning protection requirements.

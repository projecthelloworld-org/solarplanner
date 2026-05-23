# Hello Solar Planner Specification

This document describes the intended behavior, calculations, data flow, reporting, and limitations for Hello Solar Planner.

## Product Intent

Hello Solar Planner is a simple open-source planning tool for Project Hello World and community network partners. It helps users estimate solar system requirements for connectivity equipment such as routers, access points, tablets, lights, USB charging stations, monitoring gateways, and technician devices.

Hello Solar Planner is free for communities, partners, and practitioners to use, adapt, and modify based on their needs.

The tool is designed for early planning and comparison. It is not a certified electrical design package.

## System Options

The app calculates and displays two options:

- **Fully DC system** - all loads are treated as DC-supported loads and adjusted through DC distribution efficiency.
- **Hybrid DC + AC system** - DC loads use hybrid DC efficiency and AC loads use inverter efficiency.

Both option cards remain visible in the planner so users can compare them. The project-level **System Option** field selects which option appears in the report and CSV export. New projects default to **Fully DC**.

## User Workflow

1. The user enters project details in **Project Summary**.
2. The user edits the load table.
3. The user clicks **Calculate** to apply load changes.
4. The app recalculates demand, sizing, generated equipment, costs, adequacy status, report data, and CSV data.
5. The user can manually edit equipment quantities, capacities, and prices.
6. Manual equipment edits are preserved while warnings update against the latest load-based requirement.
7. The user can click **Use generated values** to reset equipment quantities and capacities from the current load demand.
8. The user opens **Report generation** to print/save PDF or export CSV for the selected system option.

## Project Fields

Project Summary includes:

- project name
- country
- currency
- manual USD exchange rate
- system voltage
- sun hours
- autonomy days
- brand profile
- System Option

The brand profile affects branding, tagline, colors, and report footer only. It does not currently affect calculations, prices, assumptions, or equipment generation.

## Load Fields

Each load item includes:

- name
- quantity
- watts
- hours per day
- current type: DC or AC
- voltage
- surge multiplier
- critical load flag

The load table is the source of truth for demand after the user clicks **Calculate**.

## Calculation Engine

The main calculation engine lives in `src/engine/calculations.ts`.

### Load Energy

Each load is converted into running watts and daily energy:

```text
running watts = quantity x watts
daily Wh = running watts x hours per day
```

Example:

```text
3 access points x 12 W x 24 h/day = 864 Wh/day
```

### Total Daily Energy

```text
total daily Wh = sum(daily Wh for every load)
```

This is the unadjusted daily energy required by the listed devices.

### Peak Load

```text
peak load W = sum(quantity x watts for every load)
```

This estimates the simultaneous running load if all listed loads are operating at once.

### Surge Load

Each load has a surge multiplier. The app estimates the worst surge case by assuming one load group surges while all other loads continue running:

```text
surge watts for load = running watts x surge multiplier
system surge W = highest value of:
  peak load W - load running watts + load surge watts
```

This is mainly used for Hybrid inverter sizing.

### Critical Energy

```text
critical daily Wh = sum(daily Wh for critical loads)
```

This helps show how much of the demand is marked as essential.

## Option Energy Adjustments

### Fully DC Adjusted Energy

The Fully DC option assumes all loads are supplied through DC distribution:

```text
fully DC adjusted daily Wh = total daily Wh / DC distribution efficiency
```

If the DC distribution efficiency is `94%`, the planner divides by `0.94` to account for expected losses.

### Hybrid DC + AC Adjusted Energy

The Hybrid option treats DC and AC loads separately:

```text
DC load adjusted Wh = DC load daily Wh / hybrid DC efficiency
AC load adjusted Wh = AC load daily Wh / inverter efficiency
hybrid adjusted daily Wh = sum(DC adjusted Wh + AC adjusted Wh)
```

This means AC loads usually require more stored and generated energy because inverter losses are included.

## Battery Sizing

Battery sizing uses adjusted daily energy, autonomy days, reserve factor, and usable depth of discharge:

```text
required battery Wh =
  adjusted daily Wh
  x autonomy days
  x battery reserve factor
  / battery depth of discharge
```

Battery sizing is rounded up to the next 100 Wh.

Interpretation:

- More autonomy days increases battery size.
- A higher reserve factor increases battery size.
- A lower usable depth of discharge increases required installed battery capacity.
- Sun hours do not affect battery Wh sizing.

## Solar Array Sizing

Solar array sizing uses adjusted daily energy and sun hours:

```text
recommended solar array W =
  adjusted daily Wh
  / sun hours
  / array derate factor
  x battery reserve factor
```

Solar array sizing is rounded up to the next 10 W.

Interpretation:

- Lower sun hours require more solar panel watts.
- Higher sun hours reduce required solar panel watts.
- A lower array derate factor increases required panel watts.
- The reserve factor adds planning margin for real-world variation.

## MPPT Controller Sizing

MPPT current is based on recommended solar array watts, system voltage, and MPPT safety factor:

```text
recommended MPPT current A =
  recommended solar array W
  / system voltage
  x MPPT safety factor
```

MPPT sizing is rounded up to the next 5 A.

Interpretation:

- Larger solar arrays require more controller current.
- Lower system voltage requires more controller current for the same solar array.
- The safety factor adds headroom.

## Hybrid Inverter Sizing

The Hybrid option sizes an inverter from peak load and estimated surge:

```text
inverter base W = max(peak load W, surge load W x 0.55)
recommended inverter W = inverter base W x inverter headroom factor
```

The result is rounded up to the next 100 W.

The Fully DC option does not require an inverter.

## Generated Equipment

Equipment generation lives in `src/engine/equipment.ts`.

Generated values use calculated requirements and editable defaults:

- panel quantity is rounded up from required solar array W and default panel watts
- battery quantity is rounded up from required battery Wh and default battery voltage/Ah
- MPPT amps are rounded up using the configured MPPT amp step
- Hybrid inverter count and watts are rounded up using the configured inverter watt step

Solar and battery equipment are shared across Fully DC and Hybrid options. The generator uses the larger requirement between the two options so the shared equipment can support either path.

## Editable Equipment And Pricing

The side panel keeps equipment quantities, capacities, and prices together in accordions:

- Currency
- Solar Panels
- Batteries
- DC Controller
- Hybrid Inverter
- DC Distribution
- AC Distribution
- Cabling
- Earthing
- Monitoring
- Sizing Assumptions

Currency is folded by default. Solar Panels is open by default. Prices are entered as USD base unit prices, and totals are displayed in the selected project currency using the manual exchange rate.

## Adequacy Checks

Adequacy checks compare the current equipment plan against the calculated requirements.

The app checks:

- current solar array W vs recommended solar array W
- current battery Wh vs required LiFePO4 battery Wh
- current MPPT/controller amps vs recommended MPPT current
- current Hybrid inverter W vs recommended inverter size

If all required values are met, the option shows **Pass**.

If one or more values are below recommendation, the option shows **Needs attention** and lists specific warnings, for example:

```text
Solar array is 900 W; recommendation is 1,000 W.
Battery storage is 2.56 kWh; recommendation is 3.20 kWh.
```

Users can still print or export reports when a plan needs attention. The report and CSV preserve the edited equipment and warnings.

## Costing

Costing lives in `src/engine/costing.ts`.

The app uses editable USD unit prices and the manual exchange rate on the project:

```text
converted amount = USD amount x USD exchange rate
```

Examples:

```text
solar panel cost = panel quantity x USD unit price per panel
battery cost = battery quantity x USD unit price per battery
controller cost = controller quantity x USD unit price per controller
inverter cost = inverter quantity x USD unit price per inverter
```

Balance-of-system categories use quantity times USD unit price:

- DC distribution
- AC distribution
- cabling
- earthing
- monitoring

Installation and contingency are calculated from editable assumption rates.

## Reports

The report section is folded by default and appears below the planner. The top page-level print button has been removed; report actions live at the start of the report section.

The printable/PDF report includes only the selected System Option:

- Executive Summary
- Project Summary
- Load Table
- Technical Sizing Summary
- Generated / Edited Equipment Plan
- Selected system recommendation
- Financial Summary
- Assumptions
- Safety Disclaimer

Printing uses the browser print flow, so the user can print or save as PDF.

## CSV Export

The CSV export mirrors the core tabular/report detail for the selected System Option.

The CSV includes only:

- Project Summary
- Load Table
- Technical Sizing Summary
- Generated / Edited Equipment Plan
- Selected system recommendation with status and warnings
- Financial Summary and cost detail

The CSV export is intended to be opened in spreadsheet software for further review and editing.

## Local Storage

Projects are saved in the browser using LocalStorage under the key:

```text
hello-solar-planner-state
```

Clearing browser storage resets saved projects and local assumptions.

## Data Files

Editable defaults live in `src/data`:

- `default-products.json` - starter products, capacities, and unit costs
- `assumptions.json` - efficiencies, derates, reserve factors, installation, contingency, and disclaimer text
- `brand-profiles.json` - report/UI branding profiles
- `sample-project.json` - Hello Hub Lite sample project

## Main Modules

- `src/main.ts` - app state, rendering, event handling, report and CSV export
- `src/engine/calculations.ts` - load and sizing calculations
- `src/engine/equipment.ts` - generated equipment and adequacy checks
- `src/engine/costing.ts` - cost estimates
- `src/engine/recommendations.ts` - system recommendation text
- `src/templates/report.eta` - printable report template
- `src/types/project.ts` - shared TypeScript types
- `src/styles.css` - layout, responsive styles, and print styles

## Assumptions And Limitations

- Solar and battery equipment are shared across Fully DC and Hybrid options.
- Controllers and inverter values are option-specific.
- Manual equipment edits are preserved until **Use generated values** is clicked.
- Load-table edits are applied when the user clicks **Calculate**.
- Exchange rates are manually entered; there is no live currency lookup.
- Prices are planning assumptions and should be edited for local markets.
- The planner is not a replacement for engineering review.

## Safety Disclaimer

Hello Solar Planner is for planning estimates only and is not certified electrical design. Final installation must be reviewed by a qualified solar/electrical technician and comply with local electrical, structural, grounding, and lightning protection requirements.

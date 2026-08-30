# Hello Solar Planner User Manual

Hello Solar Planner is a practical planning tool for estimating solar power systems for community connectivity hubs. It helps you enter electrical loads, compare a Fully DC option with a Hybrid DC + AC option, review equipment needs, estimate costs, and generate a report.

This manual is written for community teams, partners, field technicians, and practitioners using the planner.

## Important Safety Note

Hello Solar Planner is for planning estimates only. It is not certified electrical design. Final system design and installation must be reviewed by a qualified solar or electrical technician and must follow local electrical, structural, grounding, and lightning protection requirements.

## Opening The App

If you are running the app locally:

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

If you are using Docker Compose:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

## Main Screen Overview

The app uses a single-page dashboard layout.

The top area contains:

- project selector
- **New Project**
- **Sample**

The left column contains:

- project configuration
- equipment and pricing
- sizing assumptions

The main area contains:

- key energy/load cards
- loads table
- system option comparison
- report generation

## Starting A Project

### Use The Sample Project

Click **Sample** to load the Hello Hub Lite sample project. This gives you a useful starting point with routers, access points, tablets, lights, USB charging, monitoring equipment, and a laptop charger.

### Create A New Project

Click **New Project** to create a new project based on the default project structure.

Saved projects are stored in your browser using LocalStorage. There is no server database.

## Project Configuration

Use the **Project** panel to set the planning context.

### Project Name

The name of the site, hub, or installation you are planning.

### Country

The country where the system may be installed. This is used for project context and reporting.

### System Voltage

The nominal DC system voltage, such as `12`, `24`, or `48`.

This affects MPPT/controller current sizing. For the same solar array watts, a lower voltage needs more controller current.

### Sun Hours

The expected average usable sun hours per day.

This affects solar array sizing:

- lower sun hours increase the required solar panel watts
- higher sun hours reduce the required solar panel watts

### Autonomy Days

The number of days the system should run from battery storage without enough solar charging.

This affects battery sizing:

- more autonomy days increase the required battery storage
- fewer autonomy days reduce the required battery storage

### System Option

This selects which system option appears in the report and CSV export.

Options:

- **Fully DC**
- **Hybrid DC + AC**

Both options remain visible in the dashboard for comparison, but only the selected option is included in the generated report and CSV.

## Entering Loads

The **Loads** table is the source of truth for demand. The system sizing is based on the load table after you click **Calculate**.

Each row represents one device type or load group.

### Load Table Columns

| Column | Meaning |
| --- | --- |
| Name | Device or load group name. |
| Qty | Number of devices. |
| Watts (W) | Power draw for one device. |
| Hours / Day | Estimated daily run time. |
| Type | Whether the load is DC or AC. |
| Voltage (V) | Operating voltage for the device. |
| Surge (x) | Startup/surge multiplier. |
| Critical | Whether the load is essential. |

### Add A Load

Click **Add load** to add a new row.

Edit the row fields, then click **Calculate** when you are ready to update the sizing.

### Delete A Load

Click the **x** button at the end of a load row to remove it.

### Calculate

Click **Calculate** after editing the load table.

The planner does not recalculate on every keystroke. This lets you finish editing a table before the system recommendation changes.

When you click **Calculate**, the app updates:

- daily energy
- peak load
- surge load
- critical load energy
- Fully DC sizing
- Hybrid DC + AC sizing
- equipment adequacy checks
- cost estimates
- report data
- CSV data

## Understanding The KPI Cards

The four cards above the load table summarize the current calculated demand.

### Total Daily Energy

Total estimated energy used by all loads per day.

### Peak Load

Estimated running watts if all listed loads are operating at once.

### Surge Load

Estimated worst-case surge load. This is mainly important for inverter sizing in Hybrid systems.

### Critical Load Energy

Daily energy from loads marked as critical.

This helps separate essential loads from optional or flexible loads.

## Equipment And Pricing

The **Equipment & pricing** panel contains generated equipment values and editable prices.

The planner generates equipment from the current load requirements, but you can edit the values manually.

### Use Generated Values

Click **Use generated values** to reset equipment quantities and capacities from the current load-based recommendation.

This is useful when you have manually edited equipment and want to return to the calculator's generated plan.

This does not replace your load table.

### Currency

Set:

- selected currency
- manual USD exchange rate

All unit prices are entered in USD. Converted totals use the exchange rate you enter.

The values initially shown are dated Kenya/Uganda regional planning baselines, not supplier quotations. Confirm current local prices, delivery, taxes, warranty, and installation costs before procurement. See `docs/PRICING.md` for the baseline method and sources.

### Solar Panels

Set:

- number of panels
- watts per panel
- USD price per panel

Solar panels are shared across the Fully DC and Hybrid options.

### Batteries

Set:

- number of batteries
- battery voltage
- Ah per battery
- USD price per battery

Battery storage is shared across the Fully DC and Hybrid options.

### DC Controller

Set:

- number of controllers
- MPPT/controller amps
- USD price per controller

This applies to the Fully DC option.

### Hybrid Inverter

Set:

- number of controllers
- MPPT/controller amps
- number of inverters
- watts per inverter
- USD price per inverter

This applies to the Hybrid DC + AC option.

### Balance-Of-System Items

These categories cover supporting equipment:

- DC Distribution
- AC Distribution
- Cabling
- Earthing
- Monitoring

Each category has:

- quantity
- USD unit price

### Sizing Assumptions

The assumptions section contains editable planning factors such as:

- default panel watts
- default battery voltage and Ah
- MPPT amp step
- inverter watt step
- DC efficiency
- Hybrid DC efficiency
- inverter efficiency
- battery depth of discharge
- battery reserve factor
- PV derate
- MPPT safety factor
- inverter headroom factor
- installation rate
- contingency rate

Only change these values if you understand the local design assumptions or have guidance from a qualified technician.

## System Options

The planner shows two system options.

### Fully DC System

This option assumes the system can supply loads through DC distribution.

It is often useful when devices can run directly from DC power or through small DC converters.

The Fully DC option does not include inverter sizing.

### Hybrid DC + AC System

This option keeps DC supply for network loads while adding inverter capacity for AC devices.

It includes inverter sizing and AC distribution cost where needed.

## Adequacy Status

Each option shows a status:

- **Preliminary checks met**
- **Needs attention**

### Preliminary Checks Met

The edited/generated equipment meets the planner's high-level capacity comparisons. It does not mean the equipment is electrically compatible or that the installation is certified.

### Needs Attention

One or more edited equipment values are below the calculated requirement.

For example:

```text
Solar array is 900 W; recommendation is 1,000 W.
Battery storage is 2.56 kWh; recommendation is 3.20 kWh.
```

You can still generate a report when a plan needs attention. The warning will be included so the reviewer understands the issue.

## Reports

The report is hidden until you intentionally generate it.

Click **Generate Report** when you are ready to review the selected system option.

After generating the report, you can use:

- **Print / Save PDF**
- **Export CSV**

### Print / Save PDF

Click **Print / Save PDF** to open the browser print dialog.

From there you can:

- print the report
- save it as a PDF

The PDF report includes the selected system option only.

### Export CSV

Click **Export CSV** to download a spreadsheet-friendly CSV file.

The CSV includes:

- Project Summary
- Load Table
- Technical Sizing Summary
- Generated / Edited Equipment Plan
- Selected system recommendation with status and warnings
- Financial Summary and cost detail

## What The Report Includes

The report includes:

- project summary
- load table
- technical sizing summary
- generated or edited equipment plan
- selected system recommendation
- adequacy status and warnings
- financial summary
- assumptions
- safety disclaimer

Only the selected **System Option** is included in the report.

## How Costs Work

Costs are based on editable USD unit prices.

Examples:

```text
solar cost = panel quantity x USD price per panel
battery cost = battery quantity x USD price per battery
controller cost = controller quantity x USD price per controller
inverter cost = inverter quantity x USD price per inverter
```

The selected currency total is calculated using:

```text
converted amount = USD amount x USD exchange rate
```

Installation and contingency are calculated from the editable assumption rates.

## How The Main Sizing Works

The planner uses the load table to calculate demand.

### Daily Energy

```text
daily Wh = quantity x watts x hours per day
```

### Battery Sizing

Battery storage depends on:

- adjusted daily energy
- autonomy days
- reserve factor
- usable depth of discharge

Sun hours do not affect battery Wh sizing.

### Solar Array Sizing

Solar array sizing depends on:

- adjusted daily energy
- sun hours
- PV derate factor
- reserve factor

Lower sun hours increase the recommended solar array watts.

### MPPT Controller Sizing

MPPT/controller current depends on:

- recommended solar array watts
- system voltage
- MPPT safety factor

### Hybrid Inverter Sizing

Hybrid inverter size depends on:

- AC running load
- the credible surge case across AC loads
- inverter headroom factor

## Saving And Storage

Projects are saved in the browser using LocalStorage.

This means:

- saved projects are available in the same browser on the same device
- clearing browser storage may remove saved projects
- no login or server database is required
- if saved data becomes unreadable, the planner preserves a recovery copy in browser storage and opens the sample project

## Recommended Workflow

1. Start with **Sample** or **New Project**.
2. Enter project details.
3. Add or edit loads.
4. Click **Calculate**.
5. Review the KPI cards.
6. Review both system options.
7. Edit equipment quantities or prices if needed.
8. Check whether each option shows **Preliminary checks met** or **Needs attention**.
9. Choose the desired **System Option**.
10. Click **Generate Report**.
11. Print/save PDF or export CSV.
12. Share the report with a qualified technician for review.

## Troubleshooting

### The numbers did not change after editing a load

Click **Calculate** after editing the load table.

### My manual equipment edits disappeared

Manual equipment edits are reset when you click **Use generated values**.

### The report shows the wrong option

Check the **System Option** field in the Project panel. The report and CSV include only the selected option.

### Costs look wrong

Check:

- USD unit prices in Equipment & pricing
- selected currency
- USD exchange rate
- installation rate
- contingency rate

### Saved projects disappeared

The app stores projects in browser LocalStorage. Clearing browser data can remove saved projects.

## Open-Source Use

Hello Solar Planner is an open-source project by Project Hello World. It is free for communities, partners, and practitioners to use, adapt, and modify based on their needs.

## Final Reminder

Use this tool as a planning estimate. Before procurement or installation, have the final design reviewed by a qualified solar/electrical technician.

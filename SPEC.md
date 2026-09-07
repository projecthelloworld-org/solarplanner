# Hello Solar Planner v1 Specification

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
8. The user clicks **Generate Report** when ready to render the selected system report.
9. The user prints/saves PDF or exports CSV from the rendered report section.

## Project Fields

Project Summary includes:

- project name
- country
- currency
- manual USD exchange rate
- system voltage
- sun hours
- autonomy days
- System Option

The v1 user interface does not expose a Brand Profile selector. Report branding metadata does not affect calculations, prices, assumptions, or equipment generation.

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

Edits, added rows, and deleted rows remain drafts until Calculate. Sidebar edits do not discard those drafts. Pending load edits hide report actions and report content so an old result cannot be exported as the new plan. Blank numeric fields are errors, not zero. Drafts stay in memory while switching projects in the same session; only calculated loads are saved across reloads. New Project starts with an empty load list; Sample creates the example setup.

## Calculation Engine

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

Rows with zero quantity or zero hours are inactive and excluded from both power and energy sizing. Watts may be fractional. Internal energy arithmetic retains fractions; presentation rounds to two decimal places. Surge assumes the entire largest-starting group starts together with other groups running, not that every group starts simultaneously.

### Surge Load

Each load has a surge multiplier. The app estimates the worst surge case by assuming one load group surges while all other loads continue running:

```text
surge watts for load = running watts x surge multiplier
system surge W = highest value of:
  peak load W - load running watts + load surge watts
```

The whole-system value is a dashboard demand indicator. Hybrid inverter sizing uses the equivalent running and surge values calculated from AC loads only.

### Critical Energy

```text
critical daily Wh = sum(daily Wh for critical loads)
```

This helps show how much of the demand is marked as essential.

The critical flag does not remove other loads from autonomy or equipment sizing.

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

This is required **nominal** storage; depth of discharge has already been accounted for once. Installed nominal Wh is quantity x nameplate voltage x Ah. Usable Wh is nominal Wh x DoD. Do not compare usable installed Wh against this nominal requirement. Energy capacity does not establish that battery/BMS peak discharge current is sufficient.

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

Generation and adequacy checks also calculate current from the **installed** panel count x panel watts. The displayed requirement is the greater of demand-based and installed-array current. Compatible whole controllers cover both this current and documented PV input power; Hybrid integrated MPPT contributes once. Multiple controllers need independently allocated PV strings and coordinated battery charging. The planner checks nominal voltage and rated input power but cannot validate string Voc, Isc, cold-weather voltage or BMS charge limits without those site specifications. The 1.25 factor remains an editable planning margin; approved PV oversizing/clipping can differ.

Interpretation:

- Larger solar arrays require more controller current.
- Lower system voltage requires more controller current for the same solar array.
- The safety factor adds headroom.

## Hybrid Inverter Sizing

The Hybrid option sizes an inverter from AC loads only. DC loads do not pass through the inverter and therefore do not increase its power rating.

```text
AC peak load W = sum(running watts for AC loads)
AC surge load W = highest value of:
  AC peak load W - AC load running watts + AC load surge watts

recommended inverter W = max(
  AC peak load W x inverter headroom factor,
  AC surge load W
)
```

The result is rounded up to the next 100 W.

Generation filters single inverters by nominal input voltage and continuous wattage, then compares inverter plus separate-controller cost against integrated-MPPT combinations. It never invents wattage beyond the catalogue. The old inverterWattStep field remains readable for compatibility but is no longer a sizing limit or visible setting. Edited multi-inverter plans retain aggregate watts but show Needs attention; integrated MPPT is only credited for one matched unit. Continuous W, VA/power factor, surge duration and temperature must still be checked. Efficiency remains an operating allowance; idle consumption is not separately inferred.

The Fully DC option does not require an inverter. A Hybrid project with no AC loads also has a zero inverter requirement.

## Generated Equipment

Generated values use calculated requirements, voltage-compatible product IDs, and editable unit-size preferences:

- panel candidates at or below the configured largest unit are compared by installed cost; a lower component count wins when its equipment cost is within 30% of the cheapest candidate
- battery candidates must form native-voltage banks or explicitly approved series strings, within documented parallel limits; unknown limits permit only a single native-voltage unit. Known continuous discharge limits also affect quantity. The saved V x Ah preference is used when feasible; a larger compatible class is allowed when necessary
- controllers must support the project voltage; quantity covers both current and documented PV input power. Preferred controller amps are used when compatible; 48 V can use the documented 60 A class even if an older preference is smaller
- one compatible Hybrid inverter is selected by combined inverter/controller cost; included MPPT contributes once, and separate controllers cover the remaining current and PV power. A missing product remains unresolved, with zero generated quantity and an incomplete-estimate warning
- monitoring is not automatically added to a single light-load group; it remains editable and is included for multi-load or larger generated plans

For bank topology, 12.8/25.6/51.2 V LiFePO4 maps to 12/24/48 V. The project selector offers those three nominal classes; older custom voltages remain readable with a review warning. Arithmetic series ratios alone do not approve wiring. Unknown BMS limits, incompatible edited ratings and missing product identities require attention. Empty projects generate no equipment quantities.

Equipment plans persist product IDs for panels, batteries, DC/Hybrid controllers and inverters. Specifications resolve from the authoritative JSON catalogue, never from imported user-supplied metadata. Edited capacities invalidate their selected identity. Product selectors apply the named reference's capacity and base price; manual price edits and saved equipment remain intact during recalculation. DC and Hybrid controllers have independent references, quantities and prices. The optional hybridControllerUnitUsd defaults to the legacy controller price when absent. Selecting a compatible single inverter recalculates its supplementary controller quantity; subsequent manual quantity edits remain possible. Battery/inverter source notes identify comparable pricing and revision uncertainty. Catalogue records include optional supported voltages, current/connection/PV limits, inverter type, MPPT capacity and price evidence. Legacy missing fields remain unverified rather than being silently inferred.

Solar and battery equipment are shared across Fully DC and Hybrid options. The generator uses the larger requirement between the two options so the shared equipment can support either path. Catalogue choice is a transparent budgeting heuristic, not a supplier recommendation or component compatibility approval.

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

Starter prices use dated Kenya/Uganda retail observations and explicit allowances, not a statistically representative market average. An untouched generated plan uses the catalogue price matching its selected product class and a compact or hub-scale balance-of-system allowance. Any price edit freezes the current equipment and all displayed prices; Use generated values resets quantities/capacities while retaining those edited prices. Existing projects with local prices remain local. The source checks and limits are documented in `docs/PRICING.md`.

## Adequacy Checks

Adequacy checks compare the current equipment plan against the calculated requirements.

The app checks:

- current solar array W vs recommended solar array W
- current battery Wh vs required LiFePO4 battery Wh
- total current capacity across the selected MPPT/controllers vs recommended MPPT current
- current Hybrid inverter W vs recommended inverter size

If all required values are met, the option shows **Preliminary checks met**. This is a capacity comparison, not certification of component compatibility, protection, cable sizing, or installation design.

If one or more values are below recommendation, the option shows **Needs attention** and lists specific warnings, for example:

```text
Solar array is 900 W; recommendation is 1,000 W.
Battery storage is 2.56 kWh; recommendation is 3.20 kWh.
```

Users can still print or export reports when a plan needs attention. The report and CSV preserve the edited equipment and warnings.

Needs attention also covers an empty demand list, an incompatible battery bank, more than four parallel battery strings, AC loads still listed in a Fully DC plan, assumed parallel inverters, and clearly mismatched starter panel/inverter prices. Contextual planning notes identify DC conversion, BMS ratings, surge assumptions and pricing limits; these are carried into PDF and CSV. This extends the existing adequacy explanation, without adding a component-design workflow.

## Costing

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

Installation = equipment subtotal x installation rate. Contingency = (equipment subtotal + installation) x contingency rate. USD line totals and these two allowances are rounded to cents; each converted line is rounded to two decimals and the displayed total sums those displayed lines. USD projects always use exchange rate 1. Totals are preliminary allowances and do not claim tax, delivery, or mounting is included. A generated hybrid inverter with integrated MPPT is costed once; a separate controller is added only when the documented integrated capacity does not cover the requirement.

Sun hours represent equivalent full-sun hours, preferably for the low-sun design season, not sunrise-to-sunset duration. The derate factor is a combined allowance for generation, environmental and charging losses. Autonomy increases battery capacity but does not increase the daily solar-energy formula; the reserve does not guarantee a recharge interval after prolonged cloudy weather. The planner has no hourly dispatch/weather simulation. Sizing assumptions currently remain shared across projects within a browser; project-specific snapshots are deferred.

## Reports

The report area appears below the planner as a compact **Generate Report** action. Report content and export actions are not rendered until the user deliberately clicks the button. The top page-level print button has been removed; report actions appear with the generated report.

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

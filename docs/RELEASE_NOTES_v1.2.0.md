# Hello Solar Planner v1.2.0

Release date: 2026-09-07

## Changes

- Voltage-aware catalogue and reference selectors support 12/24/48 V systems, including native 25.6 V / 50 Ah and 51.2 V / 100 Ah batteries. Product IDs persist through storage. Series/parallel approval is no longer inferred from voltage arithmetic.
- Inverters are selected by input voltage and continuous watts. Integrated MPPT contributes capacity once and is not separately charged; supplementary controllers cover residual requirements. Missing compatible products remain unresolved instead of being invented.
- Public regional price observations and manufacturer specification links are attached to catalogue records and the equipment reference CSV. Unknown limits and comparable-class prices remain explicit.
- Load drafts survive sidebar edits. Add/remove also wait for Calculate; pending edits hold the report and exports.
- Sidebar updates retain keyboard focus, open accordions and the table's scroll position. Row controls are named, errors associated, and focus indicators visible. Narrow-screen and reduced-motion behavior are improved.
- Controllers are sized and costed as whole units for the installed array. Battery counts form complete nominal series strings. Inverter generation uses one adequately sized unit; edited parallel assumptions are flagged.
- Empty plans no longer receive a successful status or a generated shopping list. Zero-hour loads do not inflate peak demand. Fractional energy survives sizing and reports.
- Fully DC plans containing AC equipment now require attention. Notes explain conversion, idle consumption, battery/BMS limits, surge and cloudy-day recovery.
- Generated equipment now selects among practical regional product sizes instead of applying the largest starter unit to every load. The 25.6 V / 100 Ah battery remains an evidence-backed USD 500 class, while light projects can use smaller battery, panel, controller, inverter, and accessory classes.
- Costing retains cents; converted lines reconcile with totals. USD exchange rate is fixed at one.
- Report and CSV show the same selected-system equipment requirements, warnings, notes and prices. Print margins and row handling are retained and pagination improved.
- Browser storage denial falls back to an in-memory session with an explicit notice.

## Scope And Limits

The release keeps the static, browser-only deployment model and adds no runtime dependencies or backend. It does not add project-file import/export, country-specific pricing profiles, or certified engineering design. Calculation rationale is documented in the [calculation method](CALCULATIONS.md), and price evidence is documented in the [pricing methodology](PRICING.md).

## Upgrade

Deploy the v1.2.0 build. Existing calculated loads, equipment edits and prices remain. Use Calculate to apply the reviewed formulas and inspect warnings. Use generated values to regenerate quantities/capacities from that project's saved defaults; prices remain unchanged. Use a new Sample to inspect the current starter values. The previous v1.1.0 tag remains immutable.

Some totals change: zero-hour loads are inactive, controller quantities cover installed panels, batteries round to complete strings, inverter counts use a single suitably rated unit, and cents are retained. Sizing assumptions remain shared within a browser.

The existing `mpptAmpStep` setting is now a preferred controller rating. Compatibility takes priority when no preferred-size product fits. The legacy inverter watt-step field is retained in saved data but is no longer used to invent larger inverter ratings. Generated catalogue prices update when using untouched starter prices; manually supplied quotes remain preserved.

## Verification

- Automated checks cover 53 regression cases, TypeScript checking, and the production build.
- Browser checks cover 48 V regeneration, incompatible manual inverter warnings, integrated-MPPT selection without duplicate controller cost, and matching equipment details in the report and CSV.
- Chromium checks: staged load edits, invalid/blank inputs, preserved manual equipment, currency conversion, keyboard focus, local table scrolling, report gating, real CSV download and blocked browser storage. Layout checked from 320 to 1440 CSS pixels.
- The selected Hybrid sample was exported as a four-page A4 PDF and visually inspected page by page: white page backgrounds, margins, intact rows, readable text and embedded fonts. Other browsers and printer settings can paginate differently.
- Docker production build and local serving checked. Browser-only project storage still requires users to keep the same browser/origin; reports are not restorable project backups.

This verification is not a formal WCAG or PDF/UA certification. Screen-reader user testing and maintained cross-browser automation remain documented roadmap priorities.

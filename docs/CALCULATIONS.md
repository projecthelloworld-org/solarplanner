# Calculation Method And Validation Notes

Method reviewed for v1.2.0 on 2026-09-07. This document explains the planner's numerical relationships, validation examples, and practical limits.

## Formula Review

| Relationship | Planner behavior and rationale |
| --- | --- |
| Device energy | Quantity x input W x hours/day is appropriate. Keep fractional energy internally. A row with zero quantity or hours is inactive for both energy and peak/surge. Blank values are invalid. |
| Simultaneous demand | Sum active running watts. The worst single-group startup is group surge plus other groups' running power. It is a stated approximation; multiple groups restarting after an outage can exceed it. |
| DC versus hybrid | Divide DC energy by distribution efficiency; in Hybrid divide only AC energy by inverter efficiency. Fully DC is conditional on replacing AC equipment at the entered wattages, now an explicit attention item. |
| Battery storage | Adjusted Wh/day x autonomy x reserve / DoD, rounded up to 100 Wh. This returns nominal storage. Count x nameplate V x Ah is also nominal, so compare directly. DoD is applied once. |
| Battery topology | Nameplate 12.8/25.6/51.2 V corresponds to 12/24/48 V. Generate only native-voltage units or documented series strings within approved parallel limits. Unknown BMS current remains a warning; known continuous current also constrains generation. |
| PV daily energy | Adjusted Wh / peak sun hours / derate x reserve, rounded up to 10 W. Keep the existing 0.75 derate as a combined environmental/conversion/charging allowance, not a measured site value. Select low-season sun hours. Extra autonomy alone does not assure rapid recovery. |
| Controller | Use installed panel power, nominal system voltage and headroom, rounded up to 5 A. Select compatible controllers and check input-power limits. Include integrated MPPT once; external controllers cover residual requirements. PV string allocation and BMS charging remain installer checks. |
| Inverter | AC-only max(running W x headroom, group-start surge), rounded up to 100 W. Select one documented unit with matching input voltage and sufficient continuous watts. No synthetic fallback products. Multiple edited inverters trigger a warning; VA, temperature rating and surge duration remain explicit limits. |
| Money | Quantity x USD unit price; installation on subtotal; contingency on subtotal plus installation. Round currency components to cents and sum converted displayed components. Never multiply USD prices by a foreign-currency exchange rate when displaying USD. |
| Product selection | Compare compatible catalogue combinations that meet the calculated requirement. Prefer the cheapest installed equipment, but accept up to 30% equipment premium to reduce component count. Prefer battery candidates with no more than four parallel strings. This is a maintainability/cost heuristic, not electrical approval. |

### Explicit Numerical Fixture

40 W DC for 24 hours and 100 W AC for 2 hours = 1,160 Wh/day. At 100% DC efficiency and 80% AC inverter efficiency, Hybrid adjusted energy is 960 + 200/0.8 = 1,210 Wh/day. With 2 days, reserve 1.2 and DoD 0.8, nominal battery requirement is 3,630 Wh, rounded to 3,700 Wh. With 4 peak sun hours and PV derate 0.75, solar requirement is 484 W, rounded to 490 W. Demand-side controller requirement at 24 V and 1.25 headroom is 25.52 A, rounded to 30 A. Installing two 450 W panels instead requires 900/24 x 1.25 = 46.875 A, rounded to 50 A, satisfied by one 60 A controller.

This is a test fixture, not a recommended efficiency configuration.

### Small-Load Sanity Check

One 18 W DC router operating 24 hours/day is 432 Wh/day. At 24 V with standard assumptions it requires about 1.0 kWh nominal battery and 150 W PV. The voltage-aware catalogue generates one 200 W panel, one native 25.6 V / 50 Ah battery, and one 20 A controller. Compact accessory allowances and no dedicated monitoring give USD 580.58 including 16% installation and 10% contingency. The battery price is a comparable-class allowance, not a matching brand quote. Local review must cover BMS, protection, cabling, earthing, mounting, and actual component specifications.

## Evidence And Interpretation

- [Virginia Tech energy-use guidance](https://ext.vt.edu/content/pubs_ext_vt_edu/en/2901/2901-9014/2901-9014.html) supports watts x operating time and measuring device consumption. Use measured input watts where possible, not charger output wattage or only a maximum label.
- [Victron MPPT matching guidance](https://www.victronenergy.com/blog/2014/03/28/matching-victron-energy-solar-modules-to-the-new-mppt-charge-regulators/) explains battery-side conversion, current limits and PV oversizing. Our 1.25 factor is a conservative editable allowance, not a universal electrical standard. Manufacturer-approved clipping/oversizing requires checks the planner cannot infer.
- [Victron battery design guidance](https://www.victronenergy.com/media/pg/Lithium_Battery_Smart/en/system-design-and-bms-selection-guide.html) and [installation guidance](https://www.victronenergy.com/media/pg/Lithium_Battery_Smart/en/installation.html) support checking voltage topology and manufacturer limits, rather than relying on aggregate Wh.
- [Victron parallel inverter configuration](https://www.victronenergy.com/live/ve.bus:manual_parallel_and_three_phase_systems) requires compatible matched units and configuration. Arbitrary inverter quantities cannot establish a shared output.
- [Inverter technical specifications](https://www.victronenergy.com/media/pg/Inverter_VE.Direct_230V_-_HW15/en/technical-specifications.html) distinguish continuous W, VA, surge, temperature and idle consumption. The planner now states these limits beside its recommendation.

The efficiency, reserve, and DoD defaults are transparent planning allowances. They are not validated for every site or manufacturer. Battery charge/discharge current, PV Voc/Isc, and cable/protection calculations are outside the captured data. An installer review remains necessary.

## Input Handling And Accessibility

- Uncalculated loads remain drafts, including additions/deletions; sidebar edits preserve them. Reports are held during pending edits. Empty and invalid inputs cannot silently become a successful plan.
- Sidebar edits refresh results while preserving input elements and focus. Keyboard users can continue to the next field. Load row names, checkboxes, captions, error associations, live pending status and report focus are explicit.
- Responsive layout is checked at 1440, 1280, 1050, 768, 390 and 320 CSS pixels; table scrolling is local and keyboard accessible. The 320-pixel layout exercises the reflow expected from a 1280-pixel viewport at 400% zoom, but does not replace assistive-technology testing.
- [W3C focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html), [labels](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) informed the repairs. This is a focused accessibility pass, not a claim of complete WCAG conformance or a screen-reader certification.

## Remaining Practical Limits

The model is daily-energy based, not hourly dispatch or worst-month weather simulation. Battery aging/temperature, idle consumption, simultaneous restarts, conversion hardware, component current/voltage ratings, taxes/delivery/mounting, and battery recovery after poor weather require local assessment. Idle consumption can be captured in the existing load table; exclude an inverter-idle row when assessing Fully DC. Critical is a priority label, not a separate autonomy scenario. Shared browser assumptions and browser-only persistence remain documented constraints.

Automated regression cases cover numerical fixtures, no-load and fractional-load cases, AC-only inverter sizing, rounded-panel controller requirements, battery strings, manual plans and prices, exports, currency, and browser storage recovery. Release-level verification is summarized in the [v1.2.0 release notes](RELEASE_NOTES_v1.2.0.md).

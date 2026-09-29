# Calculation validation and saved-project upgrades

For contributors and maintainers. These cases verify general calculation rules; they are not production defaults or instructions for planner users.

## Reproducible acceptance cases

| Case | Expected behavior |
| --- | --- |
| Mathias entered loads | 1,155 Wh/day, 165 W running, 175 W group startup, 900 Wh critical. Its 24 V AC values conflict with documented 230 V inverter outputs and remain unchanged. |
| Mathias with matching AC supply and INV14 | Manufacturer 85% produces 1,358.823529 Wh/day before optional idle. Manual 88% gives 1,312.5 Wh/day. |
| 100 W AC × 10.4 h, 88%, 1.5 days, reserve 1.15, DoD 0.8 | 2,548.295455 Wh nominal requirement accepts one 2,560 Wh battery; no early rounding to 2,600 Wh. |
| Same load for 10.5 h | DC and hybrid can select one and two 2,560 Wh batteries respectively. |
| Two 100 W, 5× startup rows | 600 W when separate; 1,000 W when grouped or all-load restart is selected. |
| 40 W DC × 24 h + 100 W AC × 2 h, DC efficiency 1, AC 0.8, 2 days, reserve 1.2, DoD 0.8, 4 PSH, derate .75 | 1,210 adjusted Wh, 3,630 nominal battery Wh, 484 PV W; controller demand 25.208333 A at 24 V and 1.25 factor. |

## Persistence

Schema v2 migrates legacy equipment and prices into both independent option records. Old default 88% efficiency becomes manufacturer mode; non-default efficiency becomes an explicit override. Original storage is backed up before saving migrated data. If the backup cannot be written, saving is held until it can be preserved. Repeated migration does not overwrite the backup or duplicate settings.

## Equipment selection revision 2.1

The balanced-fit tests verify the inclusive 10% equipment-subtotal window, proportional excess ranking and deterministic tie breaks. They also cover the controller cost of larger panels, smaller native batteries without inferred series/parallel approval, exclusion of known charge-setting conflicts, price evidence consistency and dashboard/report agreement.

With the current catalogue and defaults, the two-DC-load fixture totals USD 2,335.08 for each option. It selects five 100 W panels, two 25.6 V 100 Ah batteries and one 30 A controller. This differs from the historical v1.3.2 total of USD 2,188.34 because the complete-combination fit rule changed. Keep historical release figures tied to their release; they are not universal mathematical invariants.

A single-router fixture selects a 160 W panel, a 25.6 V 50 Ah battery and a 10 A controller, totaling USD 631.62. A 12 V fixture using 5 W for eight hours can select one 12.8 V 20 Ah battery. Generic references keep missing electrical ratings unverified.

Browser checks cover reference selection, immediate capacity/price changes, quotation resets and preservation, reload persistence, collapsed unverified checks, keyboard operation and narrow layouts. PDF/CSV checks cover selection explanation, capacity fit and shared price classification.

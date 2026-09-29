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

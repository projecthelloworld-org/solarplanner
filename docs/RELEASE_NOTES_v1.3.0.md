# Hello Solar Planner v1.3.0

Release date: 2026-09-29

## More Accurate Planning

- Equipment selection uses precise requirements before rounding values for display.
- Fully DC and Hybrid options have independent equipment, costs and saved quotations.
- Hybrid estimates use the selected inverter's efficiency, with an explicit manual override when needed.
- Startup groups, power factor, startup duration and optional unloaded inverter hours support more detailed estimates.
- Advanced settings cover battery operating and charging limits, panel temperature ratings and controller input assignments.

## Clearer Equipment Checks and Reports

- Checks distinguish **passed**, **failed** and **unverified** results.
- Entered appliance voltage and frequency are checked against inverter output. Appliance values are preserved.
- Reports show assumptions and their sources, calculated requirements, installed capacity, usable battery energy, modeled autonomy and unresolved checks.
- PDF and CSV remain available when equipment information is incomplete.
- User guides focus on planning workflows; developer and validation records are kept separately.

## Existing Projects

Saved equipment and quotations are retained for both options. Subsequent edits apply to the selected option. **Use generated values** refreshes that option's equipment while preserving entered price overrides.

Projects using the previous default inverter efficiency switch to manufacturer mode. A previously customized efficiency is retained. Review the upgrade notice, calculate your loads and check the recommendations before issuing a new report.

Calculated recommendations may change because of more precise sizing, product-specific losses and additional compatibility checks. PDF and CSV exports are records of a plan, not restorable project backups.

## Availability

- `v1.3.0`: standalone planner from `master`.
- `v1.3.0-phw`: Project Hello World hosted variant, with the tools landing page and planner at `/solar/`.

Both variants use the same planning calculations. The planner remains a planning estimate and requires qualified technical review before procurement or installation.

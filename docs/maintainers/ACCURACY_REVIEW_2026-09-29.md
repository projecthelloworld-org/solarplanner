> Historical maintainer review of the pre-update calculator. Findings describe the system at the time of review, not current behavior. See the [current calculation guide](../CALCULATIONS.md).

# Calculation and equipment accuracy review

Reviewed 29 September 2026 against the supplied Mathias CN CSV, all four pages of its PDF, and the current application code.

## Finding

The supplied report is arithmetically consistent with the current formulas and entered values. The current code reproduces the supplied CSV exactly, ignoring its byte-order mark and trailing whitespace. The important improvements concern equipment selection, compatibility checks, equipment-specific losses, and how the report communicates what has been verified.

Appliance quantities, wattages, hours, voltages and starting multipliers are treated as user-provided facts. This review does not substitute appliance values or infer them from appliance names. The tool remains responsible for using the entered values consistently and identifying conflicts with the equipment it recommends.

This pass records findings and concrete acceptance cases. Application behavior has not been changed.

## 1. Mathias CN calculation reconciliation

| Output | Calculation | Result |
| --- | --- | --- |
| Daily load energy | 15 × 5 + 20 × 20 + 30 × 6 + 20 × 5 × 5 | 1,155 Wh/day |
| Running load | 15 + 20 + 30 + 20 × 5 | 165 W |
| Starting load | Largest single group starting while the others run: 165 − 100 + 100 × 1.1 | 175 W |
| Critical energy | Freezer 400 + lights 500 | 900 Wh/day |
| Adjusted hybrid energy | 1,155 ÷ 0.88 | 1,312.5 Wh/day |
| Nominal battery requirement | 1,312.5 × 1.5 × 1.15 ÷ 0.80 | 2,830.08 Wh, rounded up to 2,900 Wh |
| Minimum PV requirement | 1,312.5 ÷ 6 ÷ 0.75 × 1.15 | 335.42 W, rounded up to 340 W |
| Demand-only controller target | 340 ÷ 24 × 1.25 | 17.71 A, rounded up to 20 A |
| Installed-array controller target | 450 ÷ 24 × 1.25 | 23.44 A, rounded up to 25 A |
| Inverter target | max(165 × 1.25, 175) | 206.25 W, rounded up to 300 W |
| Installed nominal storage | 2 × 25.6 × 100 | 5,120 Wh |

The report correctly uses the larger controller target, 25 A, and selects a 30 A unit. Its 450 W panel and two 2.56 kWh batteries meet the current energy-based targets. A single 2.56 kWh battery does not meet this particular project's unrounded 2.830 kWh requirement.

At the configured 80% depth of discharge, the installed bank offers 4,096 Wh of usable battery-side energy. Dividing by the modeled 1,312.5 Wh/day gives about 3.12 days without solar, before unmodeled standby consumption, temperature and aging effects. Maintaining the additional 15% design allowance reduces this calculated duration to about 2.71 days. Neither quantity is a measured autonomy guarantee.

The arithmetic uses the nominal 25.6 V battery rating for stored energy and the 24 V system class for controller sizing. Those serve different purposes; their difference is not itself an error.

The critical flag does not change autonomy sizing: all loads are included. That behavior is already disclosed in the report.

Code: [load and sizing calculations](../../src/engine/calculations.ts), [installed-array checks](../../src/engine/equipment.ts).

## 2. Changes with the greatest accuracy benefit

### A. Check AC output compatibility against the entered load voltage

**Classification: missing compatibility check. Priority: high.**

The application checks inverter battery-input voltage, but never compares its AC output voltage with the AC loads. The selected INV14 has 230 V AC output, while the supplied loads specify 24 V AC. Accepting the user's values means reporting this conflict, rather than silently treating them as compatible.

A separate reproduction with one 100 W AC load entered at 24 V, two hours/day and 1× surge produces the INV14 and “Preliminary checks met” with zero warnings. Changing the supplied Mathias loads from 24 V AC to 230 V AC leaves every sizing result and warning unchanged. Unchanged energy arithmetic is appropriate; unchanged compatibility assessment is not.

Add inverter output voltage/frequency and supported load-supply ranges. Report a mismatch or an unverified result where the necessary specification is absent. Do not automatically rewrite a user's appliance voltage. New-load defaults also deserve attention: the current interface seeds appliance voltage from the battery bus and retains it when the user changes the load to AC.

Acceptance case: the 24 V AC reproduction must flag the conflict with a 230 V inverter. A matching 230 V load should clear that specific conflict.

Code: [selection](../../src/engine/equipment.ts), [compatibility evaluation](../../src/engine/equipment.ts), [new-load defaults](../../src/main.ts).

### B. Preserve unrounded requirements when selecting equipment

**Classification: avoidable oversizing from rounding before selection. Priority: high.**

The battery requirement is rounded to 100 Wh before equipment quantities are calculated. This adds a discontinuity on top of the explicit 15% reserve.

Reproduction: one 100 W AC load for 10.4 hours/day, with the same 24 V, six peak sun hours and 1.5-day autonomy settings. Its raw nominal requirement is **2,548.30 Wh**. One 2,560 Wh battery meets that energy target. The engine rounds the requirement to 2,600 Wh, then recommends **two batteries totaling 5,120 Wh**.

Keep exact requirements for capacity comparisons and round only the displayed values. If an extra procurement margin is desired, represent it explicitly rather than introducing it through formatting. The display must still make clear why the selected equipment meets the underlying requirement.

Acceptance case: this fixture must not require two batteries solely because 2,548.30 Wh was rounded to 2,600 Wh. The original Mathias fixture must continue to require more than one 2,560 Wh battery.

Code: [rounding](../../src/engine/calculations.ts), [battery generation](../../src/engine/equipment.ts).

### C. Generate equipment for the selected option

**Classification: intentional shared-plan behavior that can overstate a selected option. Priority: medium.**

The generator takes the larger DC/hybrid battery and PV requirements, even when the exported report presents only one option.

Reproduction: one 100 W AC row for 10.5 hours/day with the same project settings, selecting the conditional Fully DC replacement option. The report's DC battery target is 2,500 Wh, but its shared plan installs 5,120 Wh because the hybrid alternative requires more than one 2,560 Wh battery. One 2,560 Wh unit meets the selected DC energy target. This case remains distinct from early rounding: the hybrid unrounded requirement itself exceeds 2,560 Wh.

Generate separate plans for each option, or clearly identify a deliberately shared plan and explain which alternative drives each larger component. Preserve manually edited plans rather than overwriting them on an option switch.

Code: [shared requirements](../../src/engine/equipment.ts), [selected report bundle](../../src/engine/planner.ts).

### D. Use equipment-specific losses with an explicit override

**Classification: generic assumption differs from the selected product. Priority: high.**

Green Cell lists the INV14 at 85% efficiency and 0.4 A no-load current. Its output is 230 V/50 Hz, with 300 W continuous and 600 W momentary power; startup duration is not specified on that page. [Manufacturer specifications](https://greencell.global/pl/przetwornice/2428-przetwornica-napiecia-inwerter-green-cell-24v-na-230v-300w600w-czysta-sinusoida.html).

Using 85% in the existing constant-efficiency formula, with every appliance input unchanged, gives:

| Quantity | Current 88% assumption | 85% sensitivity |
| --- | ---: | ---: |
| Adjusted energy | 1,312.50 Wh/day | 1,358.82 Wh/day |
| Rounded battery requirement | 2.9 kWh | 3.0 kWh |
| Rounded PV requirement | 340 W | 350 W |

The installed 450 W panel and 5.12 kWh bank still meet those energy targets. A published efficiency is not a complete part-load performance curve; treat this as a better documented planning input, not a measured site result.

Store equipment efficiency and its source, allow an explicit user override, and identify which value the report uses. No-load energy needs an explicit unloaded operating duration. Do not automatically add no-load draw across all operating hours on top of an efficiency figure that may already include operating losses.

Code: [generic assumptions](../../src/data/assumptions.json), [hybrid energy calculation](../../src/engine/calculations.ts), [idle workaround](../../src/engine/equipment.ts).

### E. Separate continuous power, startup power and duration

**Classification: conservative simplification, with other constraints unverified. Priority: medium.**

The inverter target combines running demand and startup demand into a single continuous-watt requirement. Product startup ratings are not used. A 100 W AC load with a 5× startup allowance creates a 500 W target and selects a 2 kW inverter from the current catalogue. This does not establish that a smaller product is suitable; it shows that the model cannot distinguish continuous duty from a short startup event.

Compare continuous W, continuous VA, startup W/VA and supported duration separately. Preserve “unverified” when power factor or duration is unavailable. Do not label a published surge wattage as an independently verified VA rating.

The existing single-group startup convention is mathematically consistent but depends on row grouping. Two 100 W, 5× devices in one quantity-two row give 1,000 W startup; entered as two rows they give 600 W. An explicit startup-group rule would make this assumption less dependent on table organization.

Code: [combined inverter target](../../src/engine/calculations.ts), [group startup](../../src/engine/calculations.ts), [product selection](../../src/engine/equipment.ts).

## 3. Equipment checks that remain incomplete

The Mathias report correctly flags its missing battery discharge rating. A manufacturer manual for FLA24100 provides recommended operating limits of 100 A and 2,500 W, with 150 A/3,750 W permitted for 15 seconds, subject to temperature and state of charge. These are operating specifications, not established BMS trip thresholds. Catalogue entries should capture the matching revision and distinguish those concepts. [Felicity manual, printed page 04](https://doc.felicitysolar.com/manual/Lithium-battery/FLA%2024V/FLA24100%20User%20Guide%20-%20EN.pdf).

Current battery screening divides power by nominal bus voltage. A general reproduction with 1,120 W of DC demand and 94% efficiency gives 49.65 A at 24 V, below a 50 A limit; at an illustrative 22.4 V it becomes 53.19 A. A product-specific minimum operating voltage is needed before claiming the full current range is adequate. This illustration does not establish the minimum voltage of the catalogue's 50 A battery.

PV/controller checks compare aggregate watts and output amps. They cannot verify cold open-circuit voltage, hot operating voltage, input short-circuit current or string allocation because the necessary panel/string data is absent. Battery charge limits and charge-voltage settings also need explicit representation. Existing notes acknowledge much of this; reports should show these checks as unverified rather than burying them among general notes.

Battery aging, temperature, solar recovery time and actual operating schedules remain modeling assumptions. Their omission is not an arithmetic defect. A recovery-days target could be added separately from autonomy if recovery sizing becomes part of the tool's scope.

## 4. Make the exported result independently understandable

1. Include the complete assumptions in CSV. It currently omits the efficiency, depth of discharge, reserve, PV derate and sizing-factor section present in the PDF. Also include peak, startup and critical energy values, calculation version and generation date.
2. Show raw requirement, selected capacity and margin with units. Distinguish nominal battery Wh, usable Wh and modeled autonomy.
3. Export exact selected product identities, relevant ratings, specification sources and known/unknown checks. The controller is currently reduced to a generic “30 A” description.
4. Explain whether an equipment recommendation serves the selected option or both alternatives.
5. Generate the summary from actual load types. The supplied all-AC plan currently says it keeps efficient DC supply for network loads.
6. Identify the boundary of each loss factor. The 75% PV factor is a combined allowance; additional loss modeling must avoid counting the same loss twice.

Code: [CSV export](../../src/exports/project-report.ts), [PDF sizing and capacity tables](../../src/templates/report.eta), [hybrid summary](../../src/engine/recommendations.ts).

## 5. Validation and recommended order

The current full check passes: **53 automated tests**, TypeScript checking and production build. Additional direct engine runs reproduced the supplied CSV, the AC-voltage false pass, early-rounding overcapacity, shared-plan overcapacity, grouping-dependent surge, and the 85% efficiency sensitivity. Passing existing tests verifies the current contract; it does not fill the missing physical checks.

Implement AC compatibility and exact requirement comparisons first. Next make loss assumptions product-aware and plans option-specific. Then separate startup capability from continuous power, extend battery/controller compatibility checks, and export their evidence and assumptions. Keep the original Mathias numerical fixture and the boundary cases above as regression cases when implementing those changes.

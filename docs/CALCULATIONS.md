# How the Planner Calculates Your System

The planner uses the appliance values you enter to estimate energy demand and equipment needs. It does not estimate appliance wattage from a device name. Your report records the calculation method revision and the assumptions used.

## Energy and sizing

- Running watts = quantity × input watts; daily Wh = running watts × hours/day. Zero quantity or hours excludes a row. Fractional demand is retained.
- Fully DC energy = total daily Wh / DC efficiency. AC rows in this option remain conditional DC replacements and require review.
- Hybrid energy = DC Wh / DC efficiency + AC Wh / effective inverter efficiency + explicitly modeled unloaded inverter energy.
- Efficiency precedence: project manual override, manual equipment rating, matching manufacturer rating, generic fallback. The report records the value and source. Published efficiency without a load curve remains a planning approximation.
- Unloaded inverter Wh = no-load watts × **energized but unloaded** hours. Blank hours mean omitted/unverified; zero is an explicit zero. This overhead affects hybrid only. Loaded operation already includes conversion loss; do not add another idle appliance row.
- Nominal battery Wh = adjusted Wh/day × autonomy days × reserve / DoD. Installed nominal Wh = battery count × nameplate V × Ah. DoD is applied once to the requirement.
- PV watts = adjusted Wh/day / peak sun hours / PV derate × reserve. The PV derate covers array/environment/controller/charging losses, excluding inverter loss already accounted for above.
- Controller output amps = max(required PV, installed PV) / nominal system voltage × MPPT factor. The factor is a planning allowance, not universal electrical-code compliance.
- Equipment is compared against the full calculated requirement before numbers are rounded for display. Equipment quantities are whole units, rounded up to meet demand.
- Usable battery Wh = nominal Wh × DoD. Modeled no-solar autonomy = usable Wh / adjusted daily Wh. A second displayed value also retains the configured reserve factor. Aging, temperature and unresolved losses are not inferred.

## Startup and inverter capacity

Running demand assumes all active rows operate together. In the default mode, each unnamed row starts separately while other rows keep running. All rows sharing a startup-group name start together. The alternate all-load mode restarts every active row together.

Continuous real power uses AC running watts × headroom. Continuous VA uses each AC row's running watts / power factor, with the same headroom. Startup W derives from the entered multiplier; startup VA and duration are independently optional. Group duration uses the longest entered startup duration, conservatively retaining the group's peak for that interval. Missing duration or VA is not inferred from running power factor.

Short-term inverter capacity is credited only when W, VA and duration cover the event. Otherwise startup watts remain part of the conservative continuous-watt selection target. Equipment with known inverter incompatibilities is excluded from generated recommendations. Missing specifications produce unverified checks. If no compatible inverter is available, the inverter requirement remains unresolved and energy sizing uses the stated fallback efficiency. Output voltage and frequency are checked independently from battery-input voltage. An explicit appliance voltage range accepts inverter output within it; absent a range, nominal values must match.

## Independent equipment plans

DC and Hybrid keep independent equipment and quotations. **Calculate** regenerates both options. **Use generated values** resets only the selected option. Quantity edits change costs immediately; choosing a different reference applies its price. Retained quotations need review when the equipment changes.

### Balanced equipment selection

The planner compares complete combinations of panels, batteries, controllers and, when needed, an inverter. Supporting equipment allowances are included in the cost comparison. Each inverter uses its own effective efficiency when calculating energy and equipment requirements.

Among eligible combinations within 10% of the lowest equipment subtotal, the planner chooses the closest combined fit for solar watts, nominal battery energy and controller output current. Each capacity is compared with its own requirement as a proportion, so different units can be considered together. Controller requirements follow the installed array. All configured reserves are already included.

This rule can choose a slightly more expensive plan or a larger array if it gives a better combined fit. It does not guarantee the smallest individual component or the fewest units. The 10% selection window adds no charge and is separate from the optional ±10% budgeting range and contingency.

Each combination uses one panel type, one battery type and one separate controller type, at the quantities needed for the modeled requirements. Mixed equipment types are not modeled. Unit-size preferences and the preference for at most four parallel battery strings remain in effect. Unknown series or parallel permissions are not assumed.

Known incompatibilities exclude a combination. Missing specifications may support a provisional estimate with unverified checks. If no complete compatible combination is available, the plan identifies unresolved equipment and an incomplete estimate. Open **Required and installed capacity** to compare the selected equipment with the calculated demand.

Battery counts cover energy and documented running/starting/charging limits. Native-voltage units or documented complete series strings are required; parallel approval is not invented. Current screening uses documented minimum operating voltage where available. Nominal-voltage screening cannot establish a pass without that minimum. Continuous operating ratings, timed maxima and BMS trip thresholds are distinct concepts.

Integrated MPPT is counted once for a single matched inverter. Separate controllers cover remaining requirements. Optional assignments associate series/parallel module strings with each physical controller/input. Temperature coefficients are **percent per °C**, referenced to 25°C; design bounds are cell temperatures. Checks compare corrected Voc and Vmp against absolute and tracking limits and use corrected Isc × parallel count × the explicit Isc factor (default 1.25). Missing temperatures, coefficients, input limits or allocations remain unverified. Charge current/power and charge/float settings are checked against battery-bank limits.

## Verification status and reports

Each applicable check is passed, failed or unverified. Only a plan with no failed or unverified checks receives Preliminary checks met. These are modeled planning checks, not installation certification. Reports remain exportable with failed or missing checks.

Both PDF and CSV include calculation revision/date, effective assumptions, precise requirements, installed capacity/margins, storage/autonomy, product source information, optional inputs and per-check evidence. Manufacturer ratings and user overrides are distinguished. The primary report remains an estimate; detailed evidence follows it.

## Specification evidence and limitations

- [Green Cell INV14 manufacturer table](https://greencell.global/pl/przetwornice/2428-przetwornica-napiecia-inwerter-green-cell-24v-na-230v-300w600w-czysta-sinusoida.html): selected-product loss/output evidence. Startup duration/VA remain unknown.
- [Felicity FLA24100 manual, printed page 04](https://doc.felicitysolar.com/manual/Lithium-battery/FLA%2024V/FLA24100%20User%20Guide%20-%20EN.pdf): revision-specific battery operating and charging limits, with temperature/SOC caveats.
- Catalogue entries retain their own specification links and revision/basis notes. Distributor-hosted manufacturer sheets are identified; peak efficiency ranges are not silently treated as measured operating efficiency.

Hourly dispatch, weather forecasts, guaranteed recovery after cloudy days, cable/protection sizing, structural design and installation certification remain outside the model.

Reports identify the calculation revision used. Changes to equipment references or selection rules can change generated recommendations and totals; saved custom equipment and quotations are retained.

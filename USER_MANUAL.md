# Hello Solar Planner User Manual

Use Hello Solar Planner to estimate solar power needs for a community hub, compare equipment options and prepare a report for technical review.

The planner provides estimates. Have a qualified solar or electrical technician review the final design and installation.

## Start a Project

Open the planner in your browser. Choose **New Project** for an empty load table or **Sample** to explore the Hello Hub Lite example. Use the project selector to return to a saved project.

Enter the following project details:

| Field | What to enter |
| --- | --- |
| Project name | The site or installation name. |
| Country | The project location for the report. |
| System voltage | Nominal battery-system voltage: 12, 24 or 48 V. |
| Sun hours | Expected daily peak sun hours for the site; use a suitable low-season value. |
| Autonomy days | The number of days the battery should support the loads without solar input. |
| System option | The option you want to edit and include in the report. |
| Currency and exchange rate | Display currency and its value per USD. Unit prices are entered in USD. |

Peak sun hours describe the day's available solar energy as equivalent hours at full sunlight. They are different from daylight hours.

## Enter Your Appliances

Each load row represents one device type or a group of identical devices. The planner uses the values you enter; it does not infer power consumption from the device name.

| Field | Meaning |
| --- | --- |
| Name | Appliance or device group. |
| Quantity | Number of devices. |
| Watts | Input power consumed by one device, ideally measured. |
| Hours/day | Expected daily operating time. |
| AC/DC | The type of supply required by the appliance. |
| Voltage | Appliance supply voltage. This may differ from battery-system voltage. |
| Surge multiplier | Startup watts as a multiple of running watts. |
| Critical | Marks essential loads for the critical-energy total. |

Changing AC/DC type keeps the voltage you entered. Confirm both against the appliance label or documentation.

Use **Add load** to add a row and the row's remove button to delete it. Zero quantity or zero operating hours excludes a load from demand. All active loads, including non-critical loads, contribute to battery and solar sizing.

### Apply Changes

Click **Calculate** after editing loads. Added rows, removed rows and advanced load details also wait for this step. Calculate regenerates equipment for **both** options, replacing manual equipment quantities and capacities. Entered quotations are retained and flagged for review if their equipment changes.

While changes are pending, the results show the last calculation and report generation is held. You can edit other settings without losing unfinished load entries, but calculate before refreshing or leaving the page: unfinished load edits are not saved across reloads.

Correct any highlighted invalid values. Required numbers cannot be blank; optional advanced fields may remain blank when the information is unknown.

### Optional Load Details

Open **Advanced** on a load to enter:

- Running power factor
- Startup VA per device and startup duration
- AC frequency
- Supported minimum and maximum supply voltage
- Startup group name

Power factor, startup VA and AC frequency appear only for AC appliances. Startup duration, supply-voltage range and startup group are available for both AC and DC. Switching type updates the fields immediately, preserves your voltage and previous entries, and waits for **Calculate** to update results. Inactive AC details are ignored for DC loads and omitted from their report details.

Enter these values only when you have supporting measurements or specifications. Watts and VA describe different limits; one should not be substituted for the other.

By default, one row starts while the other active loads keep running. Rows with the same startup group name start together. You can also select **all active loads restart together** in the advanced equipment settings.

## Read the Demand Results

| Result | Meaning |
| --- | --- |
| Total daily energy | Energy used by all active loads each day, before system losses. |
| Peak load | Running watts if all active loads operate together. |
| Surge load | Startup watts under the selected startup assumption. |
| Critical-load energy | Daily energy used by loads marked critical. |

Critical-load energy identifies priority demand. It does not create a separate critical-only backup scenario.

## Compare System Options

**Fully DC** estimates a system supplied through DC distribution. If you entered AC appliances, this option assumes suitable DC replacements at the entered wattages. Confirm replacements and their consumption before relying on the estimate. No inverter is included.

**Hybrid DC + AC** uses an inverter for AC appliances and a direct DC supply path for DC devices. Equipment losses are included in adjusted daily energy.

Both options remain available for comparison. Each has independent equipment, engineering details and prices. Switching options returns to that option's saved choices. The selected option appears in the PDF and CSV.

## Review Equipment and Prices

Open **Equipment & pricing** to review panels, batteries, controllers, inverters and supporting items such as cabling, distribution, earthing and monitoring.

Select a panel, battery, controller or inverter reference to see its capacity and USD unit price, or enter custom equipment values. Selecting another reference applies its price and replaces any quotation entered for that item. Changing quantity updates the line total immediately without changing the unit price.

Changing capacity manually can leave the equipment without a matching reference. Its electrical ratings and price then need review.

Each equipment section shows **quantity × unit price = line total**. The price labels mean:

| Price label | Meaning |
| --- | --- |
| **Named product reference** | A planning price associated with a specific catalogue product. Confirm a current quotation. |
| **Representative size estimate** | A price based on comparable equipment. It does not verify the brand or electrical ratings of your equipment. |
| **User quotation** | A unit price you entered. Review it if the associated equipment changes. |
| **Unverified allowance** | A budget allowance without a matching equipment price, including supporting installation items. |

Use **Use reference price** to remove an entered quotation. If the capacity has no matching reference, the remaining price is still an unverified allowance. Prices are not automatically scaled from watts or Ah.

Prices are indicative African market planning estimates. A ±10% variation around the listed estimates may be used for initial budgeting; this is a planning assumption, not a measured market range or a verified comparison with global averages. Actual costs may fall outside this range. Confirm current local quotations before procurement.

The optional ±10% range does not automatically change planner totals. It is separate from the existing contingency allowance; do not add it again as a contingency for the same cost uncertainty. Confirm delivery, tax, warranty, mounting and installation scope. See the [pricing guide](docs/PRICING.md).

Each option card identifies generated or manually edited equipment and separates required solar capacity from installed panels. Open **Equipment and cost breakdown** to compare installed items, prices, installation and contingency. For DC-only loads, generated DC and Hybrid options can cost the same because no inverter is needed. Different installed quantities or quotations can make either option more expensive.

### How Equipment Is Chosen

Generated plans choose the closest combined capacity fit among eligible equipment combinations within 10% of the cheapest equipment subtotal. Existing safety margins remain included. Open **Required and installed capacity** to see the requirement, installed capacity and excess percentage for panels, batteries and controllers. A larger array may sometimes reduce controller excess, so the balanced choice is not always the smallest array or the fewest units. Unit-size preferences and documented battery connection limits still apply.

This selection window is separate from the optional ±10% budgeting assumption and from contingency; it adds no automatic charge. Existing quotations can change which combination is most economical. Review retained quotations whenever their associated equipment changes.

### Reset Equipment

**Use generated values** recalculates equipment for the selected option and clears its manual equipment-rating overrides. It preserves your entered price overrides, the other option's edits and your load table.

### Understand Capacities

- **Battery nominal energy** is the nameplate capacity. For example, 25.6 V × 100 Ah gives 2,560 Wh.
- **Usable battery energy** allows for the selected depth of discharge. The required nominal battery size already includes this allowance.
- **Modeled autonomy** estimates runtime without solar from usable storage and adjusted daily demand. The report also shows autonomy retaining the configured reserve.
- **Controller current** covers the larger of the required solar array and the installed array. Adding panels can increase controller needs.
- **Inverter capacity** is checked against AC supply, running watts, VA and startup demand. Adding inverter quantities does not establish that they can share a load.

Solar sizing covers typical daily energy plus the reserve allowance. It does not guarantee a specific recovery time after cloudy days.

## Advanced Equipment Settings

Open **Advanced equipment checks** for the selected option when you have additional equipment information. Leave unknown optional values blank.

Matching catalogue ratings appear as guidance. Entered ratings are your overrides and are identified separately in reports. Clearing an override returns to the catalogue rating where available. Selecting a different product clears that component's previous rating overrides.

### Inverter Efficiency and Unloaded Operation

Manufacturer mode uses the selected inverter's documented efficiency when available. Otherwise the planner uses the stated fallback. Choose **Manual override** to supply a project efficiency. The report identifies the effective value and its source.

Enter **energized but unloaded hours/day** only for time when the inverter is on without supplying an AC load:

- Blank omits this energy and leaves the check unverified.
- Zero states that there is no unloaded operation.
- A positive value adds no-load energy to the Hybrid option when a no-load rating is available.

Loaded conversion losses are already included through efficiency. Do not also add an inverter-idle appliance row for the same consumption. Unloaded hours must fit alongside the longest entered AC operating time.

### Battery Ratings

Optional ratings cover minimum operating voltage, continuous and timed startup limits, charging limits, and charge/float voltage settings.

Battery current is assessed at minimum operating voltage when known. A nominal-voltage estimate remains unverified if minimum voltage is unavailable. Use recommended operating limits from the matching documentation; a BMS trip threshold is not an operating rating.

Series and parallel arrangements must have the appropriate manufacturer approval. An unresolved or zero generated battery quantity means the plan is incomplete.

### Panels and Controller Inputs

Optional panel ratings include open-circuit voltage (Voc), maximum-power voltage (Vmp), short-circuit current (Isc) and temperature coefficients.

Temperature coefficients are percentages per degree Celsius relative to 25°C. Design minimum and maximum temperatures refer to the solar cells, not simply surrounding air.

Assign series modules and parallel strings to each physical controller input. Use one allocation row per input. The planner checks temperature-adjusted voltage and current against the available controller ratings. Missing ratings or allocations leave checks unverified.

The default Isc planning factor is 1.25 and can be edited. Integrated inverter MPPT capacity is counted once; a separate controller covers any additional requirement.

## Understand Check Results

| Result | Meaning |
| --- | --- |
| **Passed** | The available inputs meet this modeled requirement. |
| **Failed** | A known value conflicts with a requirement or limit. |
| **Unverified** | Information is missing or the arrangement has not been established. |

**Preliminary checks met** means every applicable modeled check passed. **Needs attention** means at least one check failed or remains unverified.

**Unverified checks (count)** starts closed. Click it, or use Enter or Space, to see the missing information. Failed checks and the overall status stay visible. Open **All equipment checks** for the complete list.

Review the individual results and planning notes to see what needs correction or confirmation. For example, a voltage mismatch is a failure; an unknown output frequency is unverified.

Neither status replaces installation design or certification. You can still export a plan with failed or unverified checks so a technician can review the outstanding information.

## Create and Share a Report

Choose the required system option and click **Generate Report** after calculating pending load changes.

Use **Print / Save PDF** to open the browser print dialog, or **Export CSV** to download a spreadsheet-friendly report.

Both formats include:

- Project details and entered loads
- Selected equipment, line costs and price basis
- Effective assumptions and their source
- Calculated requirements, installed capacities, margins and excess percentages
- Nominal and usable battery energy and modeled autonomy
- Product references, specification sources and manual ratings
- Passed, failed and unverified checks
- Calculation revision and report date

The report covers the selected option. To share both options, select and generate each separately.

## Save and Reopen Projects

Projects are saved in the same browser on the same device and site address. There is no login or automatic synchronization. Clearing browser data can remove projects.

Keep PDF and CSV records of important plans. These exports cannot currently restore an editable project.

When older projects are opened, saved equipment and quotations are retained for both options. Projects that used the old default efficiency switch to manufacturer mode; a previously customized efficiency is retained. Review any upgrade notice and recalculate before issuing a fresh report, because generated recommendations may change.

If the planner displays a storage or recovery warning, follow its guidance and keep an exported record before clearing browser data. Work done while saving is unavailable may only last for the current session.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| Results do not reflect load edits | Click **Calculate** and correct highlighted inputs. |
| Manual equipment values changed | **Calculate** regenerates both options. **Use generated values** resets only the selected option. |
| Report shows the wrong option | Select the intended system option and generate the report again. |
| A smaller unit has a higher price | Prices come from separate equipment references; compare their features and local quotations. Price is not proportional to capacity. |
| Costs look wrong | Review unit prices, equipment quantities, currency, exchange rate, installation and contingency rates. |
| Equipment is unresolved | Review failed and unverified checks; obtain a matching specification or quotation. |
| A project is missing | Check the browser, device and site address used to create it. Clearing browser data may remove saved projects. |

## Keyboard and Smaller Screens

Use Tab to move between controls, and Enter or Space to open expandable sections. On narrow screens, scroll the load table within its panel to reach additional columns. Highlighted errors identify the row and field that needs attention.

## Further Reading

See the [calculation guide](docs/CALCULATIONS.md) for formulas and model boundaries and the [pricing guide](docs/PRICING.md) for price evidence. Hosting and development instructions are in the [maintainer documentation](docs/maintainers/README.md).

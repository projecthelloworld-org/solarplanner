# Pricing Guide

Prices are indicative African market planning estimates. A ±10% variation around the listed estimates may be used for initial budgeting; this is a planning assumption, not a measured market range or a verified comparison with global averages. Actual costs may fall outside this range. Confirm current local quotations before procurement.

## Using the Estimates

Unit prices are editable USD amounts. Generated equipment uses the price for its selected reference; some prices match named products, while others are allowances for a comparable equipment class. Prices do not establish product compatibility or availability.

The reference observations date from August–September 2026. They are not live supplier quotations. Compare equipment specifications, warranty, tax and delivery terms before replacing an allowance with a local quotation.

## Optional Budgeting Range

The optional ±10% range does not automatically change planner totals. It is separate from the existing contingency allowance; do not add it again as a contingency for the same cost uncertainty.

For example, a listed USD 500 allowance gives an illustrative range of USD 450–550. This is a way to explore a budget, not a prediction that a supplier's price will fall within that range. No global price benchmark is applied by the planner.

## Reference Prices

These examples are unit allowances, not complete installed-system quotations. The [equipment reference CSV](../EQUIPMENT_PRICING_REFERENCE.csv) provides the full catalogue, product references and source notes.

| Category | Specification or allowance | USD reference |
| --- | --- | ---: |
| Solar panel | 200 W monocrystalline | 65 |
| Solar panel | 450 W monocrystalline | 110 |
| LiFePO4 battery | 12.8 V, 100 Ah / 1.28 kWh | 220 |
| LiFePO4 battery | 25.6 V, 100 Ah / 2.56 kWh | 500 |
| MPPT controller | 30 A, 12/24 V planning class | 75 |
| MPPT controller | 60 A, 12/24/48 V planning class | 150 |
| Integrated inverter | 12 V, 1 kW with 60 A MPPT | 220 |
| Integrated inverter | 24 V, 2 kW with 60 A MPPT | 310 |
| Integrated inverter | 48 V, 5 kW with 80 A MPPT | 570 |
| DC distribution | Small-system protection allowance | 100 |
| AC distribution | Small-system protection allowance | 90 |
| Cabling | Small hub cable and connector allowance | 140 |
| Earthing | Small hub earthing and lightning allowance | 140 |
| Monitoring | Battery and energy monitoring allowance | 150 |

## How Your Total Is Calculated

- Equipment quantities are multiplied by their unit prices.
- Supporting items such as cabling, protection, earthing and monitoring use editable allowances.
- Installation is added at the configured rate, initially 16% of the equipment subtotal.
- Contingency is added at the configured rate, initially 10% of equipment plus installation.
- The selected display currency uses the exchange rate you enter. Selecting a country does not automatically change prices or exchange rates.

The optional ±10% budgeting range described above is not an additional charge in this calculation.

## Keeping Local Quotations

DC and Hybrid options keep independent prices. Manual price edits survive **Calculate** and **Use generated values**. Calculate regenerates both equipment plans. Selecting a different named product instead applies its reference price for that item. Use **Use reference price** to clear an override. Changed or unknown equipment references are flagged beside retained quotations. Review a retained quotation when equipment changes: a price for one product may not apply to its replacement.

Integrated MPPT capacity is included in a hybrid inverter's price once. Any separately required controller is costed separately.

## Before Procurement

Obtain quotations for matching equipment and confirm delivery, tax, warranty, mounting and installation scope. Cable lengths, protection requirements, lightning exposure and remote-site work can change the total substantially. These costs are not reliably covered by supplier listing prices or broad allowances.

Keep quotation dates and specification evidence with the project records. The [maintainer evidence record](maintainers/PRICING_EVIDENCE.md) preserves the original research and its limitations.

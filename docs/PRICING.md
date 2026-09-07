# Regional Pricing Baseline

Baseline observations: August-September 2026. Last catalogue review: 2026-09-07.

## Current Voltage-Aware References

The [equipment reference CSV](../EQUIPMENT_PRICING_REFERENCE.csv) is the public catalogue summary. It includes stable product IDs, nominal voltages, known limits, manufacturer-document links, price observations, and evidence notes. Contributors can regenerate it with `node scripts/export-equipment-reference.mjs` after changing catalogue records.

| Reference class | USD unit allowance | Evidence and limits |
| --- | ---: | --- |
| SNADI 25.6 V / 50 Ah, 1.28 kWh | 180 | Manufacturer documents this class and 50 A continuous discharge. Kenya 24 V / 50 Ah comparator is KES 22,000 (about USD 170); it is not a SNADI quotation. Series/parallel limits remain unknown. |
| Felicity FLA48100 51.2 V / 100 Ah, 5.12 kWh | 950 | Uganda named listing at UGX 3,500,000 (about USD 921). Manufacturer documents parallel expansion; conflicting revision-specific current claims are left unresolved. |
| Green Cell INV14 24 V / 300 W standalone | 45 | Senetic Kenya gross price KES 5,367.74 (about USD 41); listing is out of stock. |
| Victron Phoenix 48/250, 200 W continuous | 130 | Voltwise Kenya KES 16,216 (about USD 125). Manufacturer specifies 200 W at 25 C and 175 W at 40 C; 250 VA must not be treated as 250 W. |
| MUST PV18-2024 VPM 24 V / 2 kW, integrated 60 A MPPT | 310 | Solar Store Kenya KES 40,000 (about USD 309). Confirm the exact VPM revision. |
| MUST PV18-5048 VHM 48 V / 5 kW, integrated 80 A MPPT | 570 | Kenya observations KES 68,000 and 74,000, approximately USD 525-572. Reference uses documented 3,840 W PV input limit for the 80 A revision. |

Source links and original observations are attached to the corresponding JSON records and CSV rows. New entries use the retained KES 129.46/USD comparison basis and rounded UGX 3,800/USD; these are explicit comparison assumptions, not a fresh foreign-exchange survey. Some older observations are carried forward from the September review. No two-country average is claimed where only one comparable observation is available. Tax/delivery uncertainty, out-of-stock status and brand mismatches are recorded. The SRNE Shiner2430 comparator is a published trade tier above UGX 10 million, not a confirmed single-unit retail price.

The 12.8 V small classes are available for native 12 V use. The planner does not wire batteries in series or parallel unless the catalogue records documented approval. A missing compatible product leaves an incomplete plan and a review warning. Under the default assumptions, a small 24 V router plan uses one native 25.6 V / 50 Ah battery. Any resulting total remains an allowance, not a verified installed quotation.

Prices do not imply interchangeability. Specification sources define the named reference; comparable-class price evidence does not verify a seller's product against it. In particular, a generic battery listing cannot inherit another manufacturer's BMS or series-connection approval.

## Purpose

Hello Solar Planner ships with editable USD price assumptions so a new project has a useful starting estimate. The baseline uses Kenya and Uganda retail observations with a country-balanced approach where comparable evidence is available. These are regional starter allowances, not statistically representative country or world averages. A complete comparable supplier sample is not available for every category.

These values are not supplier quotations, procurement guarantees, or global commodity indices. Final prices vary by brand, warranty, tax treatment, delivery location, availability, exchange rate, and installer requirements.

## Exchange Rates Used

- Kenya: `1 USD = 129.46 KES`, Central Bank of Kenya indicative rate dated 2026-08-28.
- Uganda: `1 USD = 3,790 UGX`, rounded regional conversion used for the survey date.

Local listing prices were converted to USD for comparison. The app continues to let users enter their own exchange rate and unit prices.

## Core Regional Reference Values

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

### Additional Small-System References

| Category | Planning class | USD allowance | How it is used |
| --- | --- | ---: | --- |
| Solar panel | 100 W monocrystalline | 45 | Candidate for very light arrays; 200 W remains the typical single-router result under standard assumptions. |
| LiFePO4 battery | 12.8 V, 40 Ah / 512 Wh | 100 | Candidate for light native 12 V plans; series, parallel, and BMS limits are unverified. |
| MPPT controller | 20 A, 12/24 V class | 50 | Candidate for small installed arrays; generation still checks current from actual panel watts. |
| Pure sine inverter | 300 W class | 50 | Candidate for light AC demand; input voltage, continuous rating, waveform and surge duration still require a matching quote. |
| DC distribution | Compact system allowance | 40 | Used for generated arrays up to 300 W. |
| AC distribution | Compact system allowance | 50 | Used for generated arrays up to 300 W when AC demand exists. |
| Cabling/connectors | Compact system allowance | 50 | Used for generated arrays up to 300 W; cable length and conductor size remain unknown. |
| Earthing/surge | Compact system allowance | 70 | Used for generated arrays up to 300 W; lightning exposure can require substantially more. |

The 100 W panel allowance is supported by a Kenya price of KES 3,128 and Uganda listings around UGX 144,000-190,000. The 40 Ah battery allowance is anchored by a Uganda listing at UGX 368,900 (about USD 97 at the retained survey conversion). The 20 A controller allowance is supported by Uganda listings around UGX 149,000-200,000 (about USD 39-53); higher-grade units can cost much more. The 300 W inverter allowance is deliberately above common low-end Kenya/Uganda marketplace prices to avoid treating the cheapest asking price as a quality benchmark. Evidence examples: [Chloride Exide Kenya 100 W panel](https://www.chlorideexide.com/product-page/100-watts-panel-mono-ce-12v), [KWT Uganda panel range](https://kwttechmart.ug/collections/solar-panels), [Jumia Uganda 40 Ah LiFePO4](https://www.jumia.ug/other-40ah-12.8v-lifepo4-solar-battery-512wh-with-usb-dc-output-260181220.html), [KWT Tech Mart 20 A MPPT](https://kwttechmart.ug/products/solarland-20a-mppt-solar-charge-controller-reliable-charge), [Solar Trust Uganda 20 A MPPT](https://jiji.ug/central-division/power-equipments/mppt-charge-controller-20a-9Zb8zYx9XWScu9zpWn3lKbVh.html), [Jumia Uganda 300 W inverter range](https://www.jumia.ug/mlp-300w-inverter/), and [TDK Kenya 300 W inverter](https://www.tdk.co.ke/product/300-watt-pure-sine-wave-inverter/).

The USD 500 allowance for a 25.6 V / 100 Ah battery is supported by comparable Kenya observations around USD 473-510 and a [Uganda 24 V / 2.5 kWh listing](https://jiji.ug/central-division/power-equipments/24v-2-5kwh-deep-cycle-lifepo4-solar-battery-dJu8ErWNEJvd2dcNm40S4aXm.html) at UGX 2.1 million. This larger class should be selected only when the calculated storage requirement needs it; light projects can use a smaller compatible native-voltage reference.

## Evidence Summary

The baseline uses multiple current retail observations where comparable products were available:

- The USD 110 allowance for a 450 W panel uses direct-retailer examples. It is a budgeting allowance, not a claim that every panel has comparable quality.
- Kenya 200 W panels were commonly around KES 3,700-4,900. Uganda listings commonly ranged from UGX 333,000 to UGX 465,000. The country-balanced midpoint supports USD 65.
- Kenya 12.8 V 100 Ah LiFePO4 listings commonly ranged from KES 22,500 to KES 48,500, with a midpoint around KES 29,000-32,000. Uganda listings around UGX 693,000-925,000 produced a similar USD range. The baseline is USD 220.
- Kenya 25.6 V 100 Ah batteries were observed around KES 55,000-75,000. Uganda observations ranged from about UGX 1.47 million to UGX 2.31 million. The baseline is USD 500.
- Controller research excluded very low-cost units where genuine MPPT operation or specifications were unclear. The selected values represent recognizable MPPT product classes rather than the lowest advertised controller.
- The named 24 V / 2 kW integrated inverter reference was listed at KES 40,000, supporting a rounded USD 310 allowance before unconfirmed tax and delivery.

## Source Examples

Sources are examples used to establish the range, not endorsed suppliers:

- Central Bank of Kenya indicative exchange rates: https://www.centralbank.go.ke/rates/forex-exchange-rates/
- Kenya solar-panel comparison: https://www.pricekenya.co.ke/c/solar-panels
- Uganda 450 W panel listing: https://jiji.ug/central-division/solar-energy-products/450w-mono-panel-iFf9twbl5CWarCljoADoxZZ5.html
- Uganda 200 W panel listings: https://www.jumia.ug/mlp-200w-solar-panels/
- Kenya 12.8 V 100 Ah battery: https://reenpowerandsolarenterprises.co.ke/product/lithium-valley-lfp100-12-1-28kwh-battery/
- Uganda 12.8 V and 25.6 V battery comparison: https://www.jumia.ug/mlp-battery-100ah/
- Kenya 25.6 V 100 Ah battery: https://sunstoreltd.com/product.php?id=191
- Uganda 25.6 V 100 Ah battery: https://fairpricemallug.com/product/lc-star-2400w-2-4kwh-24v-100ah-lithium-battery-lifepo4-solar-energy-storage/
- Kenya quality MPPT range: https://solarstore.co.ke/solar-charge-controllers/mppt/
- Uganda MPPT examples: https://blisonenergy.com/product/12v-24v-mppt-solsr-controller-30a-shiner-2430/ and https://sonicsolarug.com/products
- Kenya 2 kW hybrid inverter: https://www.jumia.co.ke/infinisolar-2kw-24v-hybrid-inverter-80a-mppt-145vdc-pv18-2024-vpm-326415557.html
- Uganda hybrid inverter examples: https://www.eluxenergies.com/
- Kenya DC protection components: https://sisutechnology.co.ke/product-category/solar-accessories/
- Uganda distribution board: https://www.solarmarket.ug/product/6way-distribution-board-for-solar-pv-systems-solar-market-uganda-gkcbd

## Important Limits

The distribution, cabling, earthing, and monitoring figures are allowances, not true product averages. Their scope is currently too broad for direct market comparison. Cable length, conductor size, number of circuits, protection ratings, mounting method, lightning exposure, and monitoring grade can change these costs substantially.

Component-based bills of materials and low/typical/high cost ranges are listed on the public [roadmap](../ROADMAP.md). Until those are available, planners should replace broad allowances with a local installer quotation.

## Additional Source Checks

Checked on 2026-09-06. The following are listed asking prices, without independent product testing or stock confirmation. The conversion assumptions above are retained solely for comparison and do not represent a live foreign-exchange feed.

| Evidence | Observation | Decision |
| --- | --- | --- |
| [Reen Power, Kenya](https://reenpowerandsolarenterprises.co.ke/product/lithium-valley-lfp100-12-1-28kwh-battery/) | 12.8 V / 100 Ah at KES 26,900; related 450 W panel at KES 13,450 | Battery remains USD 220. The panel is about USD 104 at the retained comparison rate. |
| [Kweli, Uganda](https://kweli.shop/product/felicity-450-watt-24v-half-cell-monocrystalline-solar-panel/) | Search-index listing for Felicity 450 W at UGX 449,000; direct page retrieval timed out | About USD 118 at the retained comparison rate. Together with the Kenya example, supports a rounded USD 110 panel allowance; not a robust two-country median. |
| [Sunstore, Kenya](https://sunstoreltd.com/product.php?id=191) | Felicity FLA24100, nominal 25.6 V / 100 Ah, KES 61,200.80 | About USD 473; retain USD 500 as the regional allowance. |
| [Colcal, Kenya](https://colcalmachinery.co.ke/product/100ah-25v-renergy-solar-battery-2-56kwh-capacity/) | Renergy 25.6 V / 100 Ah at KES 65,995 | About USD 510, consistent with the USD 500 allowance. |
| [Bbiri Centre, Uganda](https://www.bbiri-centre.com/product-page/60a-mppt-solar-charge-controller-12v-24v-48v-auto-adapt) | 60 A MPPT listed at UGX 560,000 | About USD 148; USD 150 is an entry-level allowance, not premium-controller pricing. |
| [Chloride Exide Uganda](https://www.chlorideexide.co.ug/category/solar) | 60 A Outback MPPT at UGX 1,650,000 excluding tax | About USD 435 before tax. Explicit evidence that brand, warranty and certification materially change price. |
| [Kreatives, Kenya](https://kreatives.co.ke/product/premier-1000watts-40mppt-hybrid-inverter-1kw-hybrid-inverter) and [Logike, Kenya](https://www.logike.co.ke/product/MUST-1KW-1000Watts-12V-MPPT-Solar-Hybrid-Inverter/95136678) | 1 kW units at KES 23,500 and 27,500, both described as 12 V models | USD 220 remains a class-level allowance. These listings do not prove suitability for the sample's 24 V bus; obtain a matching voltage and continuous-rating quote. |

The Fairprice source above describes a 24 V / 2.4 kWh battery. It must not be treated as proof of a 25.6 V / 2.56 kWh product. The 30 A controller uses a USD 75 allowance anchored by a Uganda SRNE 30 A listing at UGX 258,000. The named 24 V / 2 kW integrated inverter uses its current USD 310 reference. Balance-of-system, monitoring, and installation remain explicit allowances, not sourced kit quotations. Delivery, VAT, mounting hardware, and remote-site work are not reliably included in listed prices.

### How The Planner Uses Reference Prices

- Generated equipment uses the price attached to the selected catalogue reference.
- Existing projects keep their saved prices and equipment choices.
- Manual price edits are preserved when loads are recalculated.
- **Use generated values** refreshes compatible quantities and capacities but does not overwrite a manually entered quotation.
- Integrated MPPT capacity is included in a hybrid inverter's price once. A separate controller is costed only when additional capacity is required.

Unit prices are editable USD assumptions, even when the project displays KES or UGX. A quoted inverter may include MPPT; confirm that its documented current and PV limits match the planned array. Do not remove the capacity of a genuinely required supplementary controller merely to reduce cost.

## Refresh Procedure

Review the baseline at least every six months:

1. Collect at least three comparable listings per country for major equipment where possible.
2. Record specification, brand, warranty, listed price, tax status, source URL, and observation date.
3. Exclude products with ambiguous ratings or mismatched specifications.
4. Calculate a median for each country so one market does not dominate through listing volume.
5. Convert both country medians using dated central-bank or similarly authoritative rates.
6. Average the two country medians and round to a practical USD planning value.
7. Review large changes with a solar practitioner before updating defaults.
8. Update this document, the catalogue, sample project, tests, generated CSV, and changelog together.

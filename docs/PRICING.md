# Regional Pricing Baseline

Review date: 2026-08-30

## Purpose

Hello Solar Planner ships with editable USD price assumptions so a new project has a useful starting estimate. The current baseline uses retail prices observed in Kenya and Uganda, weighted equally by country and rounded to practical planning values.

These values are not supplier quotations, procurement guarantees, or global commodity indices. Final prices vary by brand, warranty, tax treatment, delivery location, availability, exchange rate, and installer requirements.

## Exchange Rates Used

- Kenya: `1 USD = 129.46 KES`, Central Bank of Kenya indicative rate dated 2026-08-28.
- Uganda: `1 USD = 3,790 UGX`, rounded regional conversion used for the survey date.

Local listing prices were converted to USD for comparison. The app continues to let users enter their own exchange rate and unit prices.

## Default Values

| Category | Specification or allowance | Previous USD | Regional baseline USD |
| --- | --- | ---: | ---: |
| Solar panel | 200 W monocrystalline | 130 | 65 |
| Solar panel | 450 W monocrystalline | 245 | 80 |
| LiFePO4 battery | 12.8 V, 100 Ah / 1.28 kWh | 310 | 220 |
| LiFePO4 battery | 25.6 V, 100 Ah / 2.56 kWh | 560 | 500 |
| MPPT controller | 30 A, genuine MPPT planning class | 145 | 120 |
| MPPT controller | 60 A, genuine MPPT planning class | 260 | 150 |
| Hybrid inverter | 1 kW planning class | 420 | 220 |
| Hybrid inverter | 2 kW planning class | 690 | 460 |
| DC distribution | Small-system protection allowance | 180 | 100 |
| AC distribution | Small-system protection allowance | 220 | 90 |
| Cabling | Small hub cable and connector allowance | 210 | 140 |
| Earthing | Small hub earthing and lightning allowance | 190 | 140 |
| Monitoring | Battery and energy monitoring allowance | 155 | 150 |

## Evidence Summary

The baseline uses multiple current retail observations where comparable products were available:

- Kenya 450 W panels were listed around KES 7,000, while Uganda observations were around UGX 400,000. The rounded equal-country midpoint supports an USD 80 baseline.
- Kenya 200 W panels were commonly around KES 3,700-4,900. Uganda listings commonly ranged from UGX 333,000 to UGX 465,000. The country-balanced midpoint supports USD 65.
- Kenya 12.8 V 100 Ah LiFePO4 listings commonly ranged from KES 22,500 to KES 48,500, with a midpoint around KES 29,000-32,000. Uganda listings around UGX 693,000-925,000 produced a similar USD range. The baseline is USD 220.
- Kenya 25.6 V 100 Ah batteries were observed around KES 55,000-75,000. Uganda observations ranged from about UGX 1.47 million to UGX 2.31 million. The baseline is USD 500.
- Controller research excluded very low-cost units where genuine MPPT operation or specifications were unclear. The selected values represent recognizable MPPT product classes rather than the lowest advertised controller.
- Kenya 2 kW hybrid inverters were commonly around KES 26,500-49,400. A Uganda 2 kW listing was UGX 2.4 million. Equal country weighting supports a deliberately conservative USD 460 baseline.

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

The roadmap therefore calls for component-based bills of materials and low/typical/high cost ranges. Until that work is complete, planners should replace these allowances with a local installer quotation.

## Refresh Procedure

Review the baseline at least every six months:

1. Collect at least three comparable listings per country for major equipment where possible.
2. Record specification, brand, warranty, listed price, tax status, source URL, and observation date.
3. Exclude products with ambiguous ratings or mismatched specifications.
4. Calculate a median for each country so one market does not dominate through listing volume.
5. Convert both country medians using dated central-bank or similarly authoritative rates.
6. Average the two country medians and round to a practical USD planning value.
7. Review large changes with a solar practitioner before updating defaults.
8. Update this document, the JSON defaults, sample project, tests, and changelog together.

# Maintaining the pricing baseline

Preserve dated source observations in the [pricing evidence record](PRICING_EVIDENCE.md). The broader wording and optional ±10% range in the [user guide](../PRICING.md) do not establish statistical market coverage or change the original evidence.

Regenerate the equipment reference CSV with `node scripts/export-equipment-reference.mjs` after changing catalogue records.

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

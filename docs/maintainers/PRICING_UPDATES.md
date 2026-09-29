# Maintaining the pricing baseline

Preserve dated source observations in the [pricing evidence record](PRICING_EVIDENCE.md). The broader wording and optional ±10% range in the [user guide](../PRICING.md) do not establish statistical market coverage or change the original evidence.

Regenerate the equipment reference CSV with `node scripts/export-equipment-reference.mjs` after changing catalogue records.

## Refresh Procedure

Review the baseline at least every six months:

1. Collect comparable supplier observations across the markets relevant to community-network installations. Aim for several independent listings per class; record coverage gaps when this is not possible.
2. Record capacity, voltage, brand/model, warranty, price, tax/delivery terms, source URL, observation date and availability limitations. Keep original currencies and values.
3. Separate named-product evidence from representative size estimates. Do not transfer electrical limits between brands or models. Preserve contradictory or incomplete observations in the evidence record rather than presenting them as verified specifications.
4. Use dated authoritative exchange-rate evidence where available. If a fixed planning conversion is used, label it explicitly and preserve its basis. Document rounding; never derive a new price by scaling watts or Ah.
5. Explain the chosen reference price and aggregation method. Do not describe a small or uneven source sample as a measured African average or a verified comparison with global prices. Keep premium and basic product classes distinguishable.
6. Preserve existing reference IDs and quoted project prices. Add optional catalogue metadata without inventing missing ratings or connection permissions.
7. Review material price and recommendation changes. Check complete-equipment selection, the 10% cost window, controller demand from installed panels and the effect of existing quotations.
8. Regenerate the reference CSV and update current guides, catalogue tests and Unreleased notes. Change sample-project values only when intentionally changing the sample; do not overwrite saved quotations or historical evidence.
9. Run the automated suite, type checking and production build. Check selectors, price resets, persistence and PDF/CSV agreement on both maintained branches.

The 10% equipment-selection window, optional ±10% budgeting range and configured contingency have different purposes. Keep their descriptions distinct in every pricing update.

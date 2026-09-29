# Hello Solar Planner Roadmap

This roadmap describes the public direction of Hello Solar Planner. It is a guide for discussion and contribution, not a delivery commitment. Priorities may change as community networks, installers, and deployment partners provide evidence from real projects.

## Product Principles

- Keep the planner lightweight, understandable, and deployable as a static application.
- Preserve transparent formulas, editable assumptions, and portable outputs.
- Prefer practical planning guidance over false engineering precision.
- Treat local measurements, supplier quotations, and qualified technical review as essential inputs.
- Avoid requiring accounts, a backend, or continuous connectivity for the core workflow.

## Current Focus

### Calculation Confidence

- Validate a wider range of community-network systems, including unusually small or large loads.
- Compare planner outputs with reviewed supplier quotations and completed installations.
- Document the limits of daily-energy modeling, surge assumptions, battery current, PV string design, and recovery after poor weather.
- Make the assumptions and specification evidence behind recommendations easier to review.

### Accessibility And Browser Reliability

- Improve reliability across browsers when calculating, editing equipment, saving projects and exporting reports.
- Conduct screen-reader and keyboard testing with users.
- Continue checking narrow screens, high zoom, reduced motion, and print output.

### Pricing Quality

- Refresh Kenya and Uganda reference prices at least every six months.
- Expand named-product evidence while clearly distinguishing quotations from comparable-class allowances.
- Define what is included in distribution, cabling, earthing, monitoring, installation, tax, delivery, and remote-site logistics.
- Preserve the price evidence and assumptions used for each planning report.

## Next Priorities

### Project Portability

- Export and import editable project files.
- Keep older project files usable when the planner is updated.
- Support reusable project templates without requiring a server.

### Regional Adaptation

- Add Kenya, Uganda, and custom pricing profiles with dated source metadata.
- Support localization of interface and report text.
- Make project-specific assumptions and price snapshots portable with the project.

## Longer-Term Possibilities

These ideas require community validation before implementation:

- component-level bills of materials with low, typical, and high cost ranges;
- lifecycle costing for maintenance and battery replacement;
- procurement-oriented quote comparison;
- optional hourly or seasonal energy modeling; and
- an optional collaboration service for teams that need shared projects and history.

Any server-backed capability should remain optional so the core planner can continue to run locally or from simple static hosting.

## Out Of Scope For The Core Planner

Hello Solar Planner is not intended to replace:

- certified electrical or structural design;
- manufacturer compatibility checks;
- cable, protection, grounding, or lightning calculations;
- site-specific solar-resource assessment; or
- procurement approval and installation commissioning.

## Contributing To The Roadmap

Suggestions are most useful when they include a real planning scenario, expected outcome, local context, and any supporting measurements or quotations. See [CONTRIBUTING.md](CONTRIBUTING.md) before proposing calculation or data-model changes.

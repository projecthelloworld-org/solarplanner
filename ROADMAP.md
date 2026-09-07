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

- Expand regression fixtures for representative community-network systems and edge cases.
- Compare planner outputs with reviewed supplier quotations and completed installations.
- Document the limits of daily-energy modeling, surge assumptions, battery current, PV string design, and recovery after poor weather.
- Keep calculation and equipment-selection changes traceable through tests, examples, and source notes.

### Accessibility And Browser Reliability

- Add maintained browser workflow tests for calculation, equipment editing, report generation, CSV export, printing, and persistence.
- Conduct screen-reader and keyboard testing with users.
- Continue checking narrow screens, high zoom, reduced motion, and print output.

### Pricing Quality

- Refresh Kenya and Uganda reference prices at least every six months.
- Expand named-product evidence while clearly distinguishing quotations from comparable-class allowances.
- Define what is included in distribution, cabling, earthing, monitoring, installation, tax, delivery, and remote-site logistics.
- Preserve the price evidence and assumptions used for each planning report.

## Next Priorities

### Project Portability

- Add versioned project JSON export and import.
- Validate imported data and provide migration paths for older project files.
- Support reusable project templates without requiring a server.

### Regional Adaptation

- Add Kenya, Uganda, and custom pricing profiles with dated source metadata.
- Support localization of interface and report text.
- Make project-specific assumptions and price snapshots portable with the project.

### Maintainability

- Continue separating interface rendering and browser event handling into focused modules.
- Keep calculation, equipment, costing, report, and persistence logic independently testable.
- Add dependency-update and deployment-image verification to the public maintenance workflow.

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

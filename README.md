# Hello Solar Planner

Hello Solar Planner helps community teams and practitioners estimate solar power systems for connectivity hubs. Enter your appliances, compare power options, review equipment and costs, and share a planning report.

The planner compares two options:

- **Fully DC** supplies devices through DC distribution. Listed AC appliances would need suitable DC replacements.
- **Hybrid DC + AC** supplies DC devices directly and AC appliances through an inverter.

Each option has its own equipment, prices and checks. Your appliance values remain the basis of the estimate.

Current release: **v1.3.1**. Read the [release notes](docs/RELEASE_NOTES_v1.3.1.md) for changes and existing-project guidance.

## Get Started

Open Hello Solar Planner in your browser. Use the planner address provided by your organization.

1. Choose **New Project** or explore the **Sample**.
2. Enter your site details and appliance loads.
3. Click **Calculate**.
4. Compare the two options and review their equipment checks.
5. Adjust equipment or enter local quotations for the selected option.
6. Click **Generate Report**, then save a PDF or export CSV.

See the [user manual](USER_MANUAL.md) for detailed instructions.

## What You Can Plan

- Daily energy, running power, startup demand and critical-load energy
- Battery storage, usable energy and estimated autonomy
- Solar array, charge controller and inverter requirements
- Independent equipment and cost estimates for both system options
- Optional startup, battery and PV details under advanced settings
- Equipment checks marked **passed**, **failed** or **unverified**
- Reports with assumptions, specification sources, costs and unresolved checks

A plan remains exportable when equipment information is incomplete. **Needs attention** identifies a failed check or missing information that requires review.

## Understand Your Estimate

| Guide | What it explains |
| --- | --- |
| [User manual](USER_MANUAL.md) | Entering loads, editing equipment, saving projects and sharing reports |
| [Calculation guide](docs/CALCULATIONS.md) | Formulas, loss factors, equipment selection and model limits |
| [Pricing guide](docs/PRICING.md) | Dated regional price allowances and how to use local quotations |
| [Roadmap](ROADMAP.md) | Planned improvements and contribution opportunities |
| [Release history](CHANGELOG.md) | Changes in published releases |

The default prices are dated regional planning allowances. Replace them with current local quotations before procurement. The planner provides estimates; final design and installation require review by a qualified solar or electrical technician.

## Your Data

Projects are saved in the browser you use. There are no accounts or automatic transfers between devices. Clearing browser data can remove saved projects.

PDF and CSV exports provide portable records of a plan; they cannot currently be imported to restore an editable project. The default deployment has no telemetry and does not upload project data.

## Open Source and Hosting

Hello Solar Planner is an open-source project by Project Hello World, available under the [MIT License](LICENSE).

For development or hosting, use the [contributor guide](CONTRIBUTING.md), [deployment guide](docs/DEPLOYMENT.md). Implementation, validation and maintenance records are listed in the [maintainer documentation](docs/maintainers/README.md).

See the [Code of Conduct](CODE_OF_CONDUCT.md) when participating and the [security policy](SECURITY.md) to report a vulnerability.

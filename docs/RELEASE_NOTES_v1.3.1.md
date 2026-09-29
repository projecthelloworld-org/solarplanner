# Hello Solar Planner v1.3.1

Release date: 2026-09-29

Advanced load details now follow each appliance's AC/DC type. DC appliances no longer show power factor, startup VA or AC frequency. Startup duration, supply-voltage range and startup group remain available for both types.

Changing AC/DC updates the fields immediately while keeping results pending until **Calculate**. Appliance voltage and previous entries are preserved when switching types. Inactive AC details do not affect DC checks and are omitted from DC load details in PDF and CSV reports.

Existing projects require no migration. The standalone release is `v1.3.1`; the hosted Project Hello World variant is `v1.3.1-phw`.

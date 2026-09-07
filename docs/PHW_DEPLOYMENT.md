# Project Hello World Hosted Deployment

This document applies only to the `phw` branch and the Project Hello World deployment at:

```text
https://tools.myhellohub.org
```

Partners deploying only Hello Solar Planner should use the `v1.2.0` release tag and follow `docs/DEPLOYMENT.md` instead.

## URL Structure

- `/`: Project Hello World tools landing page
- `/solar/`: Hello Solar Planner
- `/healthz`: container health endpoint

The landing page is designed to support additional tools later. Each future tool should receive its own top-level path and Vite HTML entry.

## Dokploy Configuration

1. Create an application from `https://os.myhellohub.org/helloworld/solar_planner.git`.
2. Select branch `phw`.
3. Use Docker Compose or Dockerfile build mode.
4. Route `tools.myhellohub.org` to container port `80`.
5. Enable HTTPS and redirect HTTP to HTTPS.
6. Use `/healthz` as the health-check path.
7. Deploy.

No persistent volume or environment variables are required for v1.

## Verification

After deployment, verify:

1. `https://tools.myhellohub.org/` shows the tools landing page.
2. The **Open Solar Planner** buttons route to `/solar/`.
3. The embedded preview loads on desktop.
4. `/solar/` supports project editing, Calculate, report, CSV, and print.
5. `/healthz` returns HTTP 200 and `ok`.
6. Refreshing `/solar/` does not return the landing page.

## Keeping The Branch Current

Reusable planner fixes should be committed to `master` and released there first. Merge them into `phw` afterward:

```bash
git switch phw
git merge master
npm ci
npm run check
```

Resolve landing-page conflicts carefully, especially in `index.html`, `vite.config.ts`, `nginx.conf`, and deployment documentation.

## Adding Another Tool

For a future tool named `example`:

1. Add `example/index.html`.
2. Add its source entry under `src/`.
3. Register the HTML entry in `vite.config.ts`.
4. Add an Nginx path fallback for `/example/`.
5. Add it to the landing page tool list.
6. Add a deployment smoke test.

Keep each tool independently understandable and avoid coupling its calculations or persisted data to another tool unless that integration is intentional and documented.

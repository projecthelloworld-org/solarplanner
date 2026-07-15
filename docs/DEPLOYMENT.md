# Deployment Guide

This guide is for partners deploying their own copy of Hello Solar Planner.

## Deployment Model

Hello Solar Planner is a static web application. Vite builds the source into `dist/`, and the provided Docker image serves those files with Nginx.

No database, API server, or environment secrets are required for the default deployment.

## Requirements

Choose one of these deployment paths:

- Node.js 20.19+ and npm for a direct static build
- Docker Engine with Docker Compose for the recommended self-hosted deployment
- a static hosting service capable of serving the generated `dist/` directory

## Docker Compose Deployment

Clone the repository and check out a tagged release:

```bash
git clone https://os.myhellohub.org/helloworld/solar_planner.git
cd solar_planner
git checkout v1.0.0
```

Build and start:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost:8080
```

View status and logs:

```bash
docker compose ps
docker compose logs -f hello-solar-planner
```

Stop the service:

```bash
docker compose down
```

## Direct Static Build

```bash
npm ci
npm run build
```

Publish the contents of `dist/` with your web server or static hosting platform.

To inspect the production build locally:

```bash
npm run preview
```

## Reverse Proxy And HTTPS

For public deployment:

- terminate HTTPS at Dokploy, Nginx, Caddy, Traefik, or another reverse proxy
- proxy the public domain to container port `80`
- redirect HTTP to HTTPS
- preserve the original host and forwarding headers

The default Compose mapping exposes the app on host port `8080`. Change the left side of the mapping if required:

```yaml
ports:
  - "8090:80"
```

## Dokploy

For a standard partner deployment:

1. Create an application from the GitLab repository.
2. Select the desired tagged release or stable branch.
3. Use Docker Compose or Dockerfile build mode.
4. Attach the deployment domain to container port `80`.
5. Enable HTTPS.
6. Deploy and verify the load table, report, CSV download, and print flow.

Project Hello World's hosted tools landing page is maintained separately on the `phw` branch. Partners deploying only the open-source planner should use the stable release tag instead.

## Customizing Defaults

Edit JSON files before building:

- `src/data/assumptions.json`
- `src/data/default-products.json`
- `src/data/sample-project.json`

All prices are USD planning assumptions. Localize them before procurement.

Changes are compiled into the static application, so rebuild after editing:

```bash
docker compose up -d --build
```

## Persistence And Backups

Projects are stored in each user's browser LocalStorage. The container has no project database and therefore does not need a data volume.

Operational consequences:

- replacing or restarting the container does not remove browser-saved projects
- clearing browser storage does remove projects
- projects are not synchronized between devices or browsers
- CSV/PDF exports are the recommended portable records for v1

## Upgrading

Read `CHANGELOG.md`, then check out the target tag and rebuild:

```bash
git fetch --tags
git checkout v1.0.0
docker compose up -d --build
```

Do not deploy an unreviewed development branch to production. Pin production deployments to a release tag where possible.

## Health Check

The Nginx container exposes:

```text
/healthz
```

A healthy response is HTTP `200` with body `ok`.

## Deployment Verification

After every deployment:

1. Open the application over HTTPS.
2. Load the sample project.
3. Change a load and click **Calculate**.
4. Confirm sizing values update.
5. Confirm **Use generated values** resets equipment sizing.
6. Generate the selected report.
7. Download CSV and open the print dialog.
8. Refresh the page and confirm the project remains available.

## Troubleshooting

### Blank Page

- Check container logs.
- Confirm the build completed successfully.
- Confirm the reverse proxy routes to container port `80`.
- Clear a stale browser cache after an upgrade.

### Projects Are Missing

Projects are browser-local. Confirm the same browser profile and domain are being used and that browser storage was not cleared.

### CSV Does Not Download

Check browser download permissions and popup/security policies. The export is generated entirely in the browser.

### Report Does Not Appear

Click **Generate Report**. The report is intentionally hidden until requested.

## Uninstalling

```bash
docker compose down
```

Remove the cloned repository and any reverse-proxy configuration when no longer needed. Browser LocalStorage remains until users clear site data.

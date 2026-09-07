# Release Process

Hello Solar Planner uses Semantic Versioning and annotated Git tags.

## Version Format

```text
vMAJOR.MINOR.PATCH
```

- MAJOR: incompatible data, calculation, deployment, or user-workflow changes
- MINOR: backward-compatible features
- PATCH: backward-compatible fixes and documentation corrections

Examples:

- `v1.0.0`: first supported release
- `v1.1.0`: new backward-compatible feature
- `v1.1.1`: bug fix
- `v2.0.0`: major v2 architecture or behavior change

## Branch Roles

- `master`: reusable open-source product and source of release tags
- short-lived feature/fix branches: reviewed changes before merge

Organization-specific deployment branches are not release sources. Reusable changes should land on `master` before a release is tagged.

## Release Checklist

1. Confirm the working tree contains only intended changes.
2. Update `package.json` and `package-lock.json` to the release version.
3. Move completed entries from Unreleased into a dated section in `CHANGELOG.md`.
4. Update README, user manual, specification, and deployment docs.
5. Run:

```bash
npm ci
npm run check
docker compose config
```

6. Browser-check calculations, equipment edits, report, CSV, print, persistence, desktop, and mobile layouts.
7. Commit the release changes.
8. Create an annotated tag:

```bash
git tag -a vX.Y.Z -m "Hello Solar Planner vX.Y.Z"
```

9. Push the branch and tag to each maintained public mirror:

```bash
git push <remote> master
git push <remote> vX.Y.Z
```

10. Create GitLab and GitHub releases from the same immutable tag using the corresponding changelog section.

## Hotfixes

Create a fix branch from the affected release line, merge the fix into `master`, increment PATCH, and tag the new release. Deployment-specific branches can then consume that immutable tag.

## v2 Development

Develop v2 on dedicated feature branches or a `v2` integration branch. Do not move the `v1.x` tag or rewrite published tags. Continue patching v1 only when necessary and document support policy changes in `SECURITY.md`.

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
- `phw`: maintained hosted variant with its landing page and `/solar/` route
- short-lived feature/fix branches: reviewed changes before merge

Reusable releases are tagged on `master`. After incorporating that release into `phw`, tag the hosted variant as `vX.Y.Z-phw`. The hosted tag identifies its landing page and `/solar/` deployment layout; it does not replace the standalone release tag.

## Release Checklist

1. Confirm the working tree contains only intended changes.
2. Update `package.json` and `package-lock.json` to the release version.
3. Move completed entries from Unreleased into a dated section in `CHANGELOG.md`.
4. Add release notes and update README, user manual, specification and deployment references. Check price labels, selection rules, report contents, calculation revision and local documentation links. Keep historical release notes unchanged.
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

9. Incorporate the standalone release into `phw`, preserving hosted-only files. Validate its build and browser route, then create the annotated `vX.Y.Z-phw` tag.
10. Push both branches and their new tags to each configured mirror:

```bash
git push --atomic <remote> master phw refs/tags/vX.Y.Z refs/tags/vX.Y.Z-phw
```

11. Verify remote branch and tag targets. Never force-update an existing release tag.
12. GitHub's Verify workflow publishes the matching release notes after tag verification, tests, production build and Docker build pass. Only its release job has repository-content write permission. Existing release pages are left unchanged; tags are never created or moved by the job. Releases are not automatically promoted to Latest, so publishing an older or hosted tag cannot displace the current standalone release.
13. Publish the same notes on the Project Hello World Gitea repository separately. This GitHub job does not publish to Gitea. If hosting permissions block a release page, report the limitation separately from successful branch/tag pushes. Do not bypass organization access restrictions.

### Publish notes for an existing GitHub tag

Open **Actions → Verify → Run workflow**, select `master` (or `phw`) containing the current workflow, and enter the existing tag, such as `v1.4.0` or `v1.4.0-phw`. Run once per tag. The workflow checks out and verifies that tag's exact commit, checks its package version and matching `docs/RELEASE_NOTES_vX.Y.Z.md`, and then publishes the page. Missing tags, notes or mismatched versions fail without publication.

The repository must permit GitHub Actions to use `contents: write` for release publication. Manual dispatch requires repository write access. This uses the repository's Actions token; it does not require a personal token or the local OAuth connection.

## Hotfixes

Create a fix branch from the affected release line, merge the fix into `master`, increment PATCH, and tag the new release. Deployment-specific branches can then consume that immutable tag.

## v2 Development

Develop v2 on dedicated feature branches or a `v2` integration branch. Do not move the `v1.x` tag or rewrite published tags. Continue patching v1 only when necessary and document support policy changes in `SECURITY.md`.

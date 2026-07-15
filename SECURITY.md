# Security Policy

## Supported Versions

Security fixes are provided for the latest tagged major release.

| Version | Supported |
| --- | --- |
| 1.x | Yes |
| Earlier or untagged builds | No |

## Reporting A Vulnerability

Do not publish exploit details in a public issue.

Use a confidential issue in the GitLab project at:

```text
https://os.myhellohub.org/helloworld/solar_planner/-/issues
```

Include:

- affected version or commit
- steps to reproduce
- expected impact
- suggested mitigation, if known
- whether the issue has been disclosed elsewhere

Maintainers should acknowledge a report within seven days and coordinate disclosure after a fix or mitigation is available.

## Data And Privacy Model

Hello Solar Planner has no backend by default. Project data is stored in browser LocalStorage on the user's device.

Deployers should understand that:

- clearing browser storage removes saved projects
- other users of the same browser profile may be able to access saved projects
- CSV and PDF exports may contain site names, load details, and cost assumptions
- exported reports should be handled according to the operator's data policy

## Deployment Security

- Serve the application over HTTPS.
- Keep Docker, the reverse proxy, and host operating system updated.
- Restrict access at the reverse proxy if project information is sensitive.
- Review custom JSON defaults before deployment.
- Do not embed credentials or private API keys in this static frontend.

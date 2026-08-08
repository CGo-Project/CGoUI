# Open Source Release Checklist

Use this checklist before changing the repository from private to public.

## Repository governance

- [ ] `main` branch protection is enabled.
- [ ] Pull requests are required before merge.
- [ ] At least one maintainer approval is required.
- [ ] The main CI status check is required.
- [ ] Force-push is disabled on protected branches.
- [ ] Direct pushes to `main` are restricted where appropriate.

## Security settings

- [ ] GitHub Private Vulnerability Reporting is enabled.
- [ ] Dependabot alerts / security updates are enabled where available.
- [ ] Secret scanning and push protection are enabled where available.
- [ ] NPM publish permission is limited to maintainers and protected by 2FA or Trusted Publishing.

## Project metadata

- [x] Apache-2.0 license text is present.
- [x] README and CONTRIBUTING describe a PR-first contribution flow and maintainer-owned NPM publishing.
- [x] CODE_OF_CONDUCT is present.
- [x] SECURITY policy is present.
- [x] Issue and pull request templates are present.
- [x] Third-party runtime/license notices are documented.

## Source and artifact review

- [x] Third-party Beijing Subway promotional/news images in `examples/bjsubway/assets` have been replaced by project-generated demo artwork.
- [x] The generated example assets have a provenance notice.
- [ ] Confirm the remaining `bjsubway` brand icon and any third-party names/marks are authorized for public redistribution, or replace/remove them before going public.
- [ ] Decide whether historical contributor email addresses may be public. Rewrite Git history before publication if required.
- [ ] Review the repository for private URLs, credentials, private screenshots, or internal-only data.
- [ ] Run `npm ci`.
- [ ] Run `npm run release:check`.
- [ ] Review `npm pack --dry-run` for accidental files.

## Manual publication steps

- [ ] Change repository visibility from **Private** to **Public** in GitHub Settings.
- [ ] Verify branch protection and security settings after the visibility change.
- [ ] Add repository topics / social preview / Discussions if desired.
- [ ] After `main` is green, publish NPM only from a maintainer-controlled account/workflow.

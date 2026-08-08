# Open Source Release Checklist

Use this checklist before changing the repository from private to public.

## Repository governance

- [ ] A branch ruleset targeting `main` is active.
- [ ] Pull requests are required before merge.
- [ ] Required maintainer approvals are configured appropriately for the maintainer count.
- [ ] The main CI status check is required.
- [ ] Conversations must be resolved before merge.
- [ ] Force-push and branch deletion are blocked for `main`.

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

- [x] The active transit example is fictional and generic, with no real operator name, logo, hotline, registration record, social account, or official-site link.
- [x] The previous operator-specific demo assets have been replaced by project-generated artwork.
- [x] The operator-specific `bjsubway` icon has been removed from the public icon registry.
- [x] The generic demo artwork has a provenance notice.
- [ ] Decide whether historical contributor email addresses may be public. Rewrite Git history before publication if required.
- [ ] Review the repository for private URLs, credentials, private screenshots, or internal-only data.
- [ ] Run `npm ci`.
- [ ] Run `npm run release:check`.
- [ ] Review `npm pack --dry-run` for accidental files.

## Manual publication steps

- [ ] Change repository visibility from **Private** to **Public** in GitHub Settings.
- [ ] Verify the `main` ruleset and security settings after the visibility change.
- [ ] Add repository topics / social preview / Discussions if desired.
- [ ] After `main` is green, publish NPM only from a maintainer-controlled account/workflow.

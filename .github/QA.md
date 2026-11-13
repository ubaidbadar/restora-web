# Restora Web QA

## Automated checks

- `yarn verify` runs TypeScript, ESLint, Vitest and the production Vite build.
- `.github/workflows/verify.yml` runs on pull requests and pushes to `dev` / `main`.
- `.github/workflows/firebase-hosting-merge.yml` repeats verification as a dependency of Firebase deployment. A failed check prevents the Hosting deployment.
- `.github/workflows/authenticated-browser-e2e.yml` runs the signed-in Orders/Create Order journey against the configured dev app URL on desktop Chromium, Pixel 7 phone emulation and iPad Pro 11 tablet emulation. It runs on PRs to `main` / `dev`, manually, and nightly. This is a staging smoke test; it does not claim to exercise an unmerged PR preview.

## E2E account setup

Add these repository Actions secrets in **Settings → Secrets and variables → Actions**:

- `RESTORA_E2E_EMAIL`
- `RESTORA_E2E_PASSWORD`

Optional repository secret:

- `RESTORA_E2E_BASE_URL` (defaults to `https://dev-app.restora.live`)

Use a dedicated, non-human test account in the matching environment. It must have a confirmed email, a completed restaurant setup, and `orders:view` plus `orders:create` permissions. The default target is the dev app/API. If you override the URL, make sure the test account exists in that same environment. Keep a menu configured if you want the test to exercise menu rendering; an empty menu is also accepted.

The journey signs in, opens Orders, and opens New Order. It deliberately does **not** submit an order or issue any write request to `/api/v1`.

When the secrets are absent, the workflow still installs Playwright and validates test discovery, but reports that the authenticated journey was skipped; configure them to activate the real sign-in run. Never use a staff member's personal account or production customer data for E2E credentials. Fork pull requests do not receive repository secrets and skip this authenticated workflow.

# Restora Web QA

## Test-first local workflow

Run this once after cloning or on a new development machine:

```sh
yarn install
yarn qa:setup
```

`yarn qa:setup` installs the isolated Playwright + axe test harness, downloads Chromium, Firefox and WebKit, and configures Git to use `.githooks/`.

After setup, every normal local Git commit that changes application code, shared logic, build configuration, workflows or browser tests runs `.githooks/pre-commit` automatically. It runs:

1. `yarn verify`: TypeScript, ESLint, all Vitest tests and a production build.
2. The full production-build Playwright suite across Chromium, Firefox and WebKit, including mouse/touch profiles, checkout, customer selection, pricing, service charges, order submission guards and accessibility.

A failure blocks the commit. The hook also blocks partial commits when tracked changes are unstaged or new files are not staged, so it does not test a different working tree from the one being committed. Documentation-only commits skip the code checks.

Run the same gate manually at any time:

```sh
yarn qa:verify
```

To run only the full browser suite (it rebuilds first):

```sh
yarn qa:order
```

The browser harness is isolated under `.github/order-page-e2e/`; its dependencies and generated reports are ignored by Git. Do not add Playwright to the production application bundle.

## GitHub checks

- `.github/workflows/verify.yml` is the single pull-request pipeline. It runs typecheck, lint, unit tests and the production build, then a fast Chromium-only browser smoke suite. The browser job reuses the built `dist/` artifact and deploys the Firebase PR preview only after both jobs pass. New commits to the same PR cancel stale in-progress runs.
- `.github/workflows/order-page-browser-e2e.yml` is a manual full cross-browser run. It installs Chromium, Firefox and WebKit and executes all nine browser/device profiles. The full matrix is run locally before commits; GitHub's full matrix is reserved for an explicit manual run.
- `.github/workflows/authenticated-browser-e2e.yml` runs nightly or manually. On a PR it is skipped unless the PR has the `run-auth-e2e` label. This test signs into the configured dev account and opens Orders/Create Order; it does not submit an order or write restaurant records. It tests the shared dev app, not the unmerged PR preview, so it is not run on every commit by default.
- `.github/workflows/firebase-hosting-merge.yml` runs the release verification and deploys the already-built `dist/` in the same job. A failed typecheck, lint, unit test or build prevents deployment.

## Browser fixture and safety

The New Order browser suite intercepts all `/api/v1` requests with deterministic fixtures. It does not write to a live backend. Coarse-pointer profiles use real touch taps; fine-pointer profiles use mouse input. The suite covers nine profiles across Chromium, Firefox and WebKit and runs axe WCAG 2.2 A/AA checks on menu, checkout and customer selection.

The authenticated smoke test uses a dedicated non-human E2E account. Add these repository Actions secrets in **Settings → Secrets and variables → Actions**:

- `RESTORA_E2E_EMAIL`
- `RESTORA_E2E_PASSWORD`

Optional repository secret:

- `RESTORA_E2E_BASE_URL` (defaults to `https://dev-app.restora.live`)

Use an account in the same environment as the target URL, with a confirmed email, completed restaurant setup and `orders:view` plus `orders:create` permissions. The default target is the dev app/API. The test deliberately does not submit an order or issue any write request to `/api/v1`. Credential-bearing runs do not retain screenshots, traces or video.

Fork PRs do not receive repository secrets. The authenticated PR job runs only when the `run-auth-e2e` label is present.

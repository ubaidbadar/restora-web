# Restora Web

Restora is a production React client for a restaurant CRM/POS SaaS. It is not a static demo: the client uses the Restora API, Better Auth sessions, restaurant/workplace context, role permissions, cached server data, offline order outbox, live updates and PWA support.

Stack: React 19, TypeScript, Vite, Tailwind CSS v4 and the React Compiler.

## Read before changing the client

- Follow the detailed client conventions in .claude/app-structure-forms-ui/SKILL.md for architecture, data fetching, state, routing, forms, UI, tests and naming.
- This file is the short project map and records the high-level invariants. Keep it consistent with the skill; do not reintroduce prototype-era instructions.
- Do not refactor, restyle or modify unrelated files just because they are nearby. Follow the scope of the task.

## Project architecture

- The app is a real multi-restaurant product. One account can access multiple restaurants, branches, teams, roles and permissions.
- The browser session uses Better Auth httpOnly cookies. The POS terminal flow also uses an httpOnly cookie. Never put session tokens, restaurant IDs or branch IDs in localStorage.
- The backend is a separate service. The client must treat the server as authoritative for authentication, permissions, tenant isolation and business rules.
- Shared contracts and permission logic live in the repository-root shared/ directory and are imported through @shared/*.
- src/main.tsx hydrates the local response cache and offline outbox, then loads /me. The saved /me can restore the signed-in context during an offline start. Do not add another app-wide /me request or a second startup gate.
- src/app.tsx owns the route definitions and the app's initial loading state. The current route tree still uses nested Require* wrappers. Treat those wrappers as legacy: do not add more condition-specific guards or spread route-level useWorkplace/useCan subscriptions across them. When routing is refactored, consolidate route policy in App, read the auth/workplace snapshot once for route decisions, and use the pure can(workplace, permission) helper for route permissions. Preserve all existing redirects and POS/web/setup/guest behavior. Do not remove the existing guards as unrelated cleanup before the migration is implemented and verified.
- Page components may use useWorkplace/useRestaurantSettings/useCan when they genuinely need that data for their own UI or behavior. The single-snapshot rule applies to route-level decisions, not legitimate page subscriptions.
- src/hooks/useGet.ts is the normal way for screens to read API data. It shares identical in-flight requests and caches answers by account, restaurant, branch, URL and params. Update its cache after writes instead of fetching the same list again.
- Intentional infrastructure exceptions use direct API calls: startup in main.tsx; live reconciliation and WhatsApp inbox refresh in hoc/app_layout/live_updates.tsx; and explicit auth, sync or background workflows. Do not copy these exceptions into ordinary page components.
- Offline order changes are stored in the outbox and replayed for the workplace that created them. A definitive server rejection remains visible for review; never silently discard queued work.
- PWA configuration and service-worker behavior live in vite.config.ts, public/push_sw.js and the related utilities.

## Source layout

- src/app.tsx: route definitions and route-level access policy.
- src/main.tsx: application bootstrap, local cache/outbox hydration, initial /me request and service-worker registration.
- `src/pages/<name>_page/`: route pages; page-only components and schemas stay beside the page.
- src/components/: UI shared by multiple pages/components.
- src/ui/: design-system primitives, including Form, Button, fields, modal and drawer.
- src/hoc/app_layout/: authenticated application shell and live updates.
- src/hooks/: reusable React hooks, including useGet and named auth/workplace hooks.
- src/store/: shared client stores and their update actions.
- src/types/ and repository-root shared/: client and cross-service types.
- src/constants/: constant values and shared schemas.
- src/utils/: reusable pure helpers and workflow utilities.
- src/icons/: React SVG icon components.

## Core implementation rules

- Use the existing structure and naming conventions. Default-export the primary component/helper from each file; avoid barrel files. Named type-only exports are allowed when a consumer needs a public type.
- Keep one source of truth. Do not mirror server/store/cache data into local state unless it is an editable draft or genuinely transient UI state. Do not impose an arbitrary one-hook-per-component limit.
- Use useGet for screen-owned reads. Load each screen's list at the highest component that owns the screen and pass it to rows, drawers and fields; never fetch per row.
- After a successful write, update the relevant store/cache from the response. Do not issue a follow-up GET just to refresh what the write already returned.
- Do not add fake production records or demo/fallback responses. src/constants/sample_menu.ts is an intentional first-run starter-menu template; src/test/ fixtures are test-only.
- Keep reusable abstractions meaningful. Avoid trivial one-line wrappers and single-use helper files, but extract logic when it is genuinely shared or improves clear separation.
- React Compiler is enabled. Avoid manual memoization as routine decoration; use refs, effect events, cancellation or request identifiers when an actual lifecycle, imperative or async-correctness requirement calls for them.
- Forms use the shared Form/FormDrawer patterns. Buttons inside forms that do not submit must explicitly use type="button".
- Use design tokens from src/index.css. Do not introduce raw palette colors, arbitrary hex colors or unapproved radius classes; ESLint enforces these rules.
- Use logical CSS properties/classes (for example ms-, pe-, text-start and inset-s) so layouts remain direction-aware.
- Loading, empty, error and success states are part of the feature. Preserve accessible labels, keyboard behavior, responsive layouts and existing visual conventions.

## Commands

Use Node >=22.12 and Yarn 1.22.22.

- yarn dev — Vite development server on port 3000; API proxy defaults to http://localhost:5001.
- yarn typecheck — TypeScript checks.
- yarn lint — ESLint, including React Hooks/Compiler and design-token rules.
- yarn test — Vitest suite.
- yarn build — production build; VITE_API_URL is required.
- yarn verify — typecheck, lint, tests and production build.

Copy .env.example to .env for local development. VITE_APP_URL and VITE_API_URL are public browser-build configuration; never put secrets in VITE_* variables.

# Restora Web

Restora is a restaurant CRM and POS web application for taking orders, managing an orders board, customers and khata, reservations, tables and QR menus, WhatsApp conversations/campaigns, staff, roles, branches and daily reporting.

The client is a real API-backed application, not a static demo. Authentication uses Better Auth, restaurant access is scoped by the signed-in session, and the backend remains authoritative for permissions and tenant boundaries.

## Technology

- React 19 and TypeScript
- Vite and Tailwind CSS v4
- React Compiler
- React Router
- Better Auth and the Restora API
- IndexedDB-backed response cache and offline order outbox
- PWA/service worker support

## Requirements

- Node.js >=22.12
- Yarn 1.22.22

## Local setup

```sh
yarn install
cp .env.example .env
yarn dev
```

The development server runs at http://localhost:3000. It proxies /api and /uploads to the API origin configured by VITE_API_URL; the local default is http://localhost:5001.

Set VITE_APP_URL to the public address of the web app when testing link previews. VITE_* values are embedded in the browser build and are public configuration, never secrets.

## Production builds

A production build requires VITE_API_URL. For the live environment:

```sh
VITE_API_URL=https://restora.live VITE_APP_URL=https://app.restora.live yarn build
```

For the development environment, use https://dev.restora.live for VITE_API_URL and https://dev-app.restora.live for VITE_APP_URL.

Deploy the generated dist/ directory only to the matching environment. The Firebase Hosting workflows build with their configured public environment values.

## Useful commands

| Command | Purpose |
|---|---|
| yarn dev | Start the Vite development server |
| yarn typecheck | Run TypeScript checks |
| yarn lint | Run ESLint |
| yarn test | Run the Vitest suite |
| yarn build | Create the production dist/ build |
| yarn preview | Preview the production build locally |
| yarn verify | Run typecheck, lint, tests and build |

## Project structure

```text
src/app.tsx                 Route definitions and route access
src/main.tsx                Bootstrap, local hydration and service worker
src/pages/                  Route-level pages and page-specific components
src/components/             Shared application components
src/ui/                     Design-system primitives and form controls
src/hoc/app_layout/         Application shell and live updates
src/hooks/                  Data and UI hooks
src/store/                  Shared client state
src/types/                  Client-side types
src/constants/              Constants and schemas
src/utils/                  Shared helpers and workflows
src/icons/                  React SVG icon components
shared/                     Types and permission logic shared with the backend
```

Detailed implementation conventions are in CLAUDE.md and .claude/app-structure-forms-ui/SKILL.md.

## Data and offline behavior

- main.tsx hydrates the local cache/outbox and loads the signed-in user's /me context before the app leaves its startup state.
- Screen-owned API reads use useGet, which caches by account and workplace scope and shares identical in-flight requests.
- Successful writes update the relevant store/cache from the server response instead of issuing redundant follow-up reads.
- Supported order operations can be queued offline and replayed for the originating account, restaurant and branch.
- Live order/table events and WhatsApp inbox refreshes are handled by the app-layout live-update service.
- The server enforces authentication, permissions and tenant isolation; client route/UI checks are not a security boundary.

## Quality checks

Run yarn verify before considering a client change complete. It runs TypeScript, ESLint, Vitest and the production build. Add or update tests for behavior changed, especially data hooks, stores, route access, forms and user-visible page flows.
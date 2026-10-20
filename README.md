# Restora (restaurant CRM)

A lightweight CRM for restaurants: fast order taking, an orders board, customers with khata, reservations, tables with
QR menus, WhatsApp messages (wa.me links, no paid API) and a daily dashboard, with staff, roles and several branches.
React 19, TypeScript, Vite, Tailwind CSS v4.

**UI only for now:** there is no API and no sign-in. Every page shows hard-coded data from `src/constants/demo_*.ts`,
every route is open, and saving only shows a toast (a few screens also update until you reload).

## Structure

```
src/pages/<name>_page/   one folder per route; index.tsx is the page, page-only components sit beside it
src/components/          UI used by two or more components
src/ui/                  design-system primitives
src/hoc/                 wrapping components: withOverlay, app_layout/
src/hooks/               UI hooks (overlay, dismiss, shortcuts, anchored position)
src/store/               toast_store only
src/constants/demo_*.ts  the hard-coded data
src/types/ constants/ utils/   one default export per file
```

See `CLAUDE.md` for the rules.

## Requirements

- Node `>=22.12`
- Yarn 1 (`yarn@1.22.22`, pinned in `package.json`)

## Setup

```
yarn install
cp .env.example .env    # optional: VITE_APP_URL for link previews
yarn dev                # http://localhost:3000 (also served on the LAN: `server.host` is on)
```

`VITE_*` variables are inlined into the browser bundle and are therefore public. Never put a secret in one.

## Commands

| Command | What it does |
|---|---|
| `yarn dev` | dev server on port 3000 |
| `yarn typecheck` | `tsc --noEmit` (strict, `noUncheckedIndexedAccess`) |
| `yarn lint` | ESLint: typescript-eslint, React Hooks + React Compiler rules, design-token rules |
| `yarn build` / `yarn preview` | production build to `dist/`, and serving it locally |
| `yarn verify` | typecheck, lint and build in sequence |

The look is defined entirely by the design tokens in `src/index.css` (`@theme`).

## Browser support

Tailwind CSS v4 sets the floor: Chrome 111+, Firefox 128+, Safari 16.4+.

## Known limitations

- **Contrast.** `accent` on `surface` is 2.1:1 and `border` on `surface` is 1.1:1, below WCAG AA. Fixing this is a
  token change in `src/index.css`.
- **Dialogs** move, trap and restore focus, but have no accessible name (`aria-labelledby`) and `Modal` has no `aria-modal`.
- **Tooling.** `typescript` stays on 6.x until `typescript-eslint` supports 7. There is no formatter and no CI workflow.
# restora-web

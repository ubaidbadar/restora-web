# Restora (restaurant CRM)

React 19 + TypeScript + Vite + Tailwind v4, React Compiler on. A SaaS: one login can work in several restaurants, each
with branches, a team, roles and permissions. **For now the app has no API:** every page shows hard-coded data from
`constants/demo_*.ts` (one file per kind of record), there is no sign-in, and every route is open. Saving a form shows a
toast; a few screens (menu, tables, one customer, settings forms) also update their own copy in `useState`, which resets on reload.
`constants/sample_menu.ts` is the starter menu offered during first-run setup. Built for any country: no Urdu fields.

## Commands (yarn)
- `yarn dev` (port 3000) · `yarn typecheck` · `yarn lint` · `yarn build` · `yarn verify` (all three)
- A change is done only when `yarn verify` passes. There are no tests.

## Layout (`src/`)
- `pages/<name>_page/` one folder per route: `index.tsx` is the page; components only that page uses sit next to it,
  bigger sections get their own folder with an `index.tsx` (see `pages/new_order_page/customer_step/`). Page-only schemas: `schema.ts`.
- `components/` UI used by two or more components (page header, form drawer, empty state, fields shared by two forms…).
- `ui/` design-system primitives (button, input, modal, drawer, tabs, `form/`…). No Card component: cards are
  `rounded-card bg-surface shadow-card p-4 sm:p-5` classes.
- `hoc/` every wrapping component: `withOverlay` and `app_layout/` (sidebar, bottom bar, guest-call pill). No route guards.
- `hooks/` UI hooks only (overlay, dismiss, shortcuts, breakpoints…). No data hooks.
- `types/` global types, one per file · `constants/` constant values and shared zod schemas, one per file ·
  `utils/` plain helpers and contexts, one per file · `icons/` SVG components, when needed.
- `store/` only `toast_store` (made with `create_store`); call it through `utils/toast`.
- Logo: `icons/restora_symbol|restora_icon|restora_wordmark.tsx`, composed by `components/brand_mark.tsx`;
  `index.html` has the boot screen. Masters and every icon file live in `../brand` (see its README); `public/` icons are made there, never by hand.
- PWA: `vite-plugin-pwa` in `vite.config.ts` (manifest, service worker). `utils/register_service_worker.ts` asks before
  updating.
- No `features/`, no `src/shared/`, no barrels, no `@shared` imports: the permission list is `constants/permission_catalog.ts`.

## Rules
- **Default exports only, one export per file.**
- **At most one state per component** (useState, useReducer, useWatch, a store read). Router hooks are not state. Split the component instead.
- **Data:** import the `DEMO_*` constant in the component that shows it (records use `_id`). Writes go in a `Form`
  `onSubmit` or a `FormDrawer` `onSave` and end with a `toast`; new records made on screen get ids from `utils/demo_id`.
- **Keep it simple:** one `useState` per hook too, no refs or counters to steer flow; derive what to show from the data
  (e.g. the setup step from `settings.taxSet`) instead of keeping a separate step in state or the URL. `Button` has no
  `loading` prop: pass `disabled` while saving.
- The restaurant's settings are `DEMO_SETTINGS`; the person is `DEMO_USER`; the working branch is `DEMO_BRANCH`. Everyone can do everything (no permission checks yet).
- **Forms:** always the `Form` component (or `FormDrawer`, which wraps it), never `useForm` directly. Pass the form
  props down (`{...props}`), `register` every input, `setValue` for values that are not inputs, `useWatch` narrowly.
- Search text, filters, tabs and dates live in the URL: `useSearchParams` with `utils/with_param` to set one value. Local UI state stays in the section that uses it.
- **Menu:** `DEMO_MENU` is `{ categories, addonGroups, items }`. A dish has `sizes` (one with an empty name = one price) and `addonGroupIds`. Cart lines are `types/cart_item` (same dish + size + add-ons + note = one line, `utils/cart_item_of`). Order totals: `utils/order_totals_of`.
- **Tables and QR:** tables are per branch (Settings → Tables, `/print/tables` for A4 cards). A table's QR opens `/t/<code>`, the guest page outside the app. Staff see the floor and guest calls on `/tables`; `hoc/app_layout/table_calls_banner` shows waiting calls at the top of every page.
- **POS terminals:** `/pos` is the lock screen; any PIN of the right shape opens New order.
- Overlays (modal, drawer, sheet, confirm, alert) are built with `withOverlay`, never with local `isOpen` state.
- No manual `useMemo`/`useCallback`/`memo`: the React Compiler does it.
- Headings `h1`–`h6` / `.h1`–`.h6` get responsive clamp sizes from `index.css`; no `sm:/md:` text sizes on them.
- Styling uses design tokens only (the `@theme` block in `src/index.css`). Never a raw palette color, hex or `rounded-xl`; lint rejects it.
- Logical CSS only (`ms-`, `pe-`, `text-start`) so RTL can be switched on later. Money, phone, date and WhatsApp
  formatting come from `utils/`, never inline.

## Naming
- Files and folders: lowercase `snake_case`. Hook files and `withOverlay` are camelCase (`useShow.ts`).
- A file is named after what it exports (`format_rs.ts` exports `formatRs`).

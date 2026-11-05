---
name: app-structure-forms-ui
description: Ubaid's React client conventions: folder layout (pages, components, ui, hoc, hooks, store, types, constants, utils), default exports, state updated on the client after saves (no API call to update it), no one-line wrappers or single-use helpers, useGet options/get/loading, no demo data, /me and permissions, Form and field patterns, button variants, design tokens.
---

# Client structure, forms and UI

Apply these rules to every change in the React client (React 19 + TypeScript + Vite + Tailwind v4, React Compiler on).
Follow the user's existing structure exactly. Do not refactor, restyle or touch files outside the request.

## Write simple code first
The user reviews every line. Code that is clever, defensive or "future-proof" is a mistake here.
- Pick the plainest solution that works. If a hook or component needs a comment to explain its own machinery, it is
  too complicated: simplify it.
- No `useRef`, `useEffectEvent`, request counters or derived "keys" just to manage flow. One `useState` holding an
  object is the default shape for a hook's state.
- Derive what to show from the data you have. Don't add a separate variable (state, URL param) for something the data
  already tells you, e.g. which setup step to show: `if (!settings.taxSet) return <StepTax />`.
- When the user shows an example of how they want something, follow its shape and naming closely.
- **No one-line wrappers.** A function whose body is one line that only calls something else is not written; write
  that line where it's used: `.catch((err) => toast.error(getAxiosMessage(err)))`, not `.catch(showError)`;
  `api.post('/me/branch', { branchId }).then((res) => useAuthStore.getState().setMe(res.data))`, not `switchBranch(id)`.
  A helper earns its file only when it holds real logic used in several places (a format, a formula, a regex rule,
  a zod field), so inlining it would copy that logic.
- **The exception: paths into a store get a named hook**, because the path and its type then live in one place and a
  change to `/me` is one edit: `useWorkplace()` (undefined before a restaurant is picked), `useRestaurantSettings()`
  (inside a restaurant), `useCan(permission)`. Use them; never write `useAuthStore((state) => state.me?.workplace…)`
  in a component. A new shared path into a store gets its own hook the same way.
- **Code used in one place is written in that place.** A function called once (e.g. reading `/me` at start) goes
  directly where it runs, not in its own file in `utils/` or `hooks/`. Before creating a helper file, check: will two
  or more files call it? If not, don't create it.

## Update the state; don't call the API to update it
Every request costs the user time on a slow restaurant connection. The API is called to save something or to read
something the app does not have yet, never to bring the state up to date after a change. Before writing any `useGet`,
`api.get`, or a server answer that sends more than the saved record, check: is it already in the store, already
loaded by a parent, or can the client work it out from what it just sent and got back?

1. **`/me` is read once, when the app starts**, directly in `main.tsx`:
   `api.get<Me>('/me').then((res) => useAuthStore.getState().setMe(res.data))`. It carries everything many
   screens share: the account, `mode` (`web`/`pos`), the terminal (`device`), the restaurants to switch to, and the
   `workplace`: restaurant, current branch, the branches they may switch to, permissions, role names, and the
   restaurant's `settings` (name, logo, tax by payment method, WhatsApp templates, `taxSet`).
   Screens read these from the store (`useWorkplace()`, `useRestaurantSettings()`, `useCan()`), never with their own request:
   no `useGet('/settings')` for tax, no `useGet('/branches')` for a branch name or a branch picker, no
   `useGet('/restaurants')` for the switcher.
2. **After a save, the client updates the state itself** from the saved record, with an action in `store/auth_store`:
   - settings saved → `setSettings(res.data)` (also renames the restaurant in the workplace and the switcher)
   - branch added, edited, archived or reopened → `setBranch(res.data)` (the switcher, and the current branch if it
     was archived; `workplace.allBranches` says whether a new branch is theirs)
   - PIN set → `setWorkplace({ hasPin: true })`; name saved → `setMe({ ...me, user: { ...me.user, name } })`
   - signed out → `setMe(null)`; terminal registered or locked → `setMe(null, true)`
   A new kind of change gets a small store action like these, not a request and not `me` in the answer.
3. **Only when the client cannot work out the result does the write's answer carry `me`**: everything about the person
   changes (signing in, switching account, unlocking a terminal) or they move to another restaurant or branch, with
   other permissions (switching, onboarding, joining, transfer, delete, leave). Then `setMe(res.data.me)`.
   A `403 context_lost` also carries `me`. Nothing reads `/me` again after the start.
4. **Each list is loaded once, by the top component of the screen that shows it**, and passed down as props. Rows,
   children and drawer fields never load a list themselves, and never load per row (`useGet` inside a row component
   that renders N times makes N requests). Example: the Staff tab loads `/roles` once and gives it to the member list
   and to the invite and access drawers.
5. **After a write, put the answer in place**; never `get()` the list again:
   - created → `update((list) => [...(list ?? []), res.data])`
   - saved → `update((list) => list?.map((item) => (item._id === saved._id ? saved : item)))`
   - deleted → `update((list) => list?.filter((item) => item._id !== id))`
   - a write that changes several records at once (e.g. the roles matrix) answers with the whole list → `update(() => res.data)`.
   - something you know without the answer (e.g. "sign out other devices" leaves only this one) → compute it locally.
6. **The server answers so this is possible**: a write returns the saved record in exactly the shape its list uses
   (e.g. a staff member with its `user`), and nothing more. A delete returns `{ success }`; the client removes the row
   it already knows. `/me` carries the facts the client needs to update itself (e.g. `allBranches`).
7. When the restaurant or branch changes, the app layout keys its pages by `restaurantId:branchId`, so each page loads
   its own data again exactly once. That is the only "reload".

## Exports
- **Default exports only, one export per file.** No named exports and no barrels (`index.ts` that re-exports).
- A file is named after what it exports: `format_rs.ts` exports `formatRs`, `order_card.tsx` exports `OrderCard`.
- Files and folders are lowercase `snake_case`. Hook files and `withOverlay` are camelCase (`useGet.ts`).
- A type is `export default interface X {}`, or `type X = …; export default X;`.

## Folders (`src/`)
- `pages/<name>_page/`: one folder per route. `index.tsx` is the page. Components used only by that page sit next to it;
  a bigger section gets its own folder with an `index.tsx` (for example `pages/new_order_page/customer_step/`).
  Page-only zod schemas go in `schema.ts` (or `<name>_schema.ts` when there are several).
- `components/`: UI used by two or more components (including `can.tsx`, `load_failed.tsx`, `skeleton_list.tsx`, `skeleton_grid.tsx`, the switchers).
- `ui/`: design-system primitives (button, input, select, textarea, checkbox, radio, toggle, modal, drawer, tabs, `form/`).
- `hoc/`: every higher-order or wrapping component: `withOverlay`, `app_layout/`, `boot_gate` (logo until `/me` is
  known) and the route guards `guest_only`, `require_auth`, `require_web`, `require_restaurant`, `require_setup`,
  `require_permission`.
- `hooks/`: hooks. `useGet` is the only way to read from the API. The named store hooks live here too (`useWorkplace`,
  `useRestaurantSettings`, `useCan`, `useNavLinks`).
- `store/`: every module-level store: `create_store` and each store made with it (`auth_store`, `toast_store`),
  holding the state and the actions that change it (`setMe`, `setWorkplace`, `setSettings`, `setBranch`).
  Never put a store in `utils/`.
- `types/`: global types, one per file.
- `constants/`: constant values and shared zod schemas, one per file (including `button_variants`, `button_sizes`).
- `utils/`: plain helpers, one per file.
- `icons/`: SVG components, only when needed.
- `config/`: the axios clients: `config/api.ts` (`/api/v1`) and `config/auth_api.ts` (Better Auth, `/api/auth`).
- Never create `features/` or `src/shared/`. Code shared with the server (permission catalog, preset roles, `can()`,
  the `Me`, `Workplace` and `RestaurantSettings` types) lives in the repo-root `../shared/`, imported as `@shared/...`.

## State
- At most one state per component: useState, useReducer, useGet, useWatch, or a store hook. Router hooks
  (`useSearchParams`, `useNavigate`, `useParams`, `useLocation`) do not count. Split the component instead of adding a
  second state; `useAuthStore.getState()` inside a handler is not a state.
- The same goes for custom hooks: one `useState` (an object if several values belong together), no refs.
- Local UI state stays in the section that uses it (for example whether a section is expanded).
- A value the server reads (a date, a scope, a status, a page, search text, an id in the address) lives in the `useGet`
  request's own `options`, not in a second state or the URL: show it from `options.params.x` (or `options.url`) and
  change it with `get({ params: { x } })` (or `get({ url })`). Clear a filter with `undefined`
  (`get({ params: { status: undefined } })`); params merge, so leaving it out keeps the old value.
- **Search text the server uses is a filter like any other.** The input reads `options.params.search` and calls
  `get({ params: { search: e.target.value || undefined } }, 400)`. The delay is the second argument of `get`. No
  `useState` for the text, no debounce `useEffect`, no separate search component, no timers in screens.
- Filters and tabs that only narrow what is already loaded (a client-side text filter, a tab) live in the URL:
  `useSearchParams` with `utils/with_param`, and never call `get`. Steps of a flow are derived from the data, not kept
  in the URL or in state.
- No manual `useMemo`, `useCallback` or `memo`: the React Compiler handles it.

## Data
- Read with `useGet<T>(url, { active, ...axiosConfig })` in the component that shows the data (see "Update the state"
  for where that is). It returns `{ data, loading, error, options, get, update }`.
  - It loads on mount, and again when `url` changes. `active: true` holds the request (e.g. a search under 3
    characters); it loads when `active` turns false.
  - It caches every answer per person, restaurant, branch, address and params. A screen opened again shows the cached
    answer at once (no spinner) and refreshes it quietly; two screens asking for the same thing at once share one
    request. So loading the same list on two screens is fine; loading it twice on one screen is still wrong.
  - `update` also changes the cached answer, so the next visit and other screens show the change.
  - The axios options (`{ params: { date } }`, `{ baseURL: '/api/auth' }`) are only the starting ones: changing a
    variable passed in them does NOT reload. `get(override)` takes any axios option, merges it into the request's
    options (`params` are merged too: `get({ params: { date } })` keeps the other params) and reloads; an older
    answer that arrives late is ignored. That includes the address: ``get({ url: `/customers/${id}` })`` loads another one, and wins over the `url`
    argument from then on, so a screen changes its address one way only: through the `url` argument or through
    `get({ url })`, never both.
  - `options` is what was last asked for, so the screen reads its date, filter or address from there
    (`const day = options.params.date`, `options.url`), with no state of its own.
  - A failed read already shows its error as a toast; don't toast it again.
- `update((current) => next)` changes what is shown after a write (see the patterns above). `get()` is for loading other
  params or a reload the user asks for, never after a write.
- Lists come back as plain arrays. Records use `_id`.
- Write with `api.post/patch/put/delete` from `config/api.ts`, inside a `Form` `onSubmit`, a `FormDrawer` `onSave`, or
  a confirm's `onConfirm`. A confirm or menu action without a form ends with
  `.catch((err) => toast.error(getAxiosMessage(err)))` so the server's message shows; forms pass errors to `onError` or let `FormDrawer` show them.
- Never send `restaurantId` or `branchId` to scope data: the server takes both from the sign-in session.
- No demo or fallback data, ever: no `data = DEMO_X` defaults, no "if the list is empty show sample rows", no records
  made on screen with fake ids. Every screen shows what the server has, and every write goes to the server and shows
  its answer. If an endpoint is missing, add it to the server.
- While loading, show a skeleton shaped like what is coming, never a spinner and never an empty state:
  - a list: `const { data: items = [], loading } = …`, then `{loading && <SkeletonList rows={4} />}`
    (`components/skeleton_list`; `variant="lines"` inside a card) and the empty state only when `!loading && !items.length`.
  - a grid of cards (tables, dishes, people): `<SkeletonGrid columns="…" height="…" />` (`components/skeleton_grid`),
    with the real grid's columns and tile height.
  - anything else (a profile, the dashboard's numbers): lay out `Skeleton` blocks (`ui/skeleton`) in the real layout,
    inside a wrapper with `role="status"` and an `aria-label`.
  - a record that failed: `if (!data) return loading ? <skeleton> : <LoadFailed what="the menu" onRetry={() => get()} />`,
    or a page of its own when the address itself is wrong (a bad invitation link). Never `null`: a failed load must not
    leave a blank screen.
  - `BrandLoader` (`ui/brand_loader`, the cloche lifting its lid) is only for the app's own start, matching
    `index.html`'s boot screen.

## Offline (orders)
- Answers `useGet` has seen live in `store/get_cache` and are saved on the device (`utils/offline_db`, IndexedDB); the
  last `/me` too, so a signed-in person opens the app without internet. Signing out clears both.
- Code outside a screen changes an answer with `getCache.update(getCache.keyOf(url), updater)`; every screen showing
  it updates.
- A write that must work offline (new orders, order status, cancel) tries the server, and on a network error (no
  `err.response`) or while `useOutboxStore` says offline, goes into the outbox (`store/outbox_store`) instead.
  `utils/sync_outbox` sends it, oldest first, when the internet is back; a change the server refuses is dropped and
  the person told why. Screens lay waiting changes over the server's list (`orders_page/board_with_outbox`).
- A new record made offline carries a `clientId` (and `placedAt`); the server saves it once however often it is sent.
- Payments and khata are online only: they change what customers owe.

## Auth and permissions
- The session is an httpOnly cookie (Better Auth); a POS terminal's key is an httpOnly cookie too. Never store a token,
  restaurant id or branch id in the page or `localStorage`.
- `store/auth_store`: `me` (`undefined` while starting, `null` when nobody is signed in), `terminal` (a locked POS
  terminal), `setMe(me, terminal?)` and the update actions above.
- Read: `useAuthStore((state) => state.me)` for the account; `useWorkplace()` (restaurant, branch, branches,
  allBranches, permissions, roleNames, `isOwner`, `isPrimaryOwner`, `hasPin`, `settings`); inside a restaurant
  `useRestaurantSettings()`.
- One permission: `useCan('orders:create')`, `can(workplace, …)` from `@shared/can` outside components, or
  `<Can permission="orders:create">`. The server checks again. Gate UI and routes by permission (`resource:action`),
  never by role name: roles are editable. Owner-only actions check `workplace.isPrimaryOwner`.
- Change where they work with `api.post('/me/workplace' | '/me/branch')`; the answer is the new `me`.
  `utils/sign_out` signs every account out; `utils/lock_terminal` locks a terminal.
- Better Auth calls (sign in/up, passwords, email verification, accounts on this browser) go through
  `config/auth_api.ts`. Sign-in and switching account answer with `me`.
- `config/api.ts` (`withCredentials`) reacts to `401` with `code: 'signed_out' | 'pos_locked'` (the store empties and the
  guards redirect) and `403 context_lost` (sets the `me` it carries). `403 reauth_required` means "sign in again";
  show its message.

## Forms
- Every form uses the `Form` component (`ui/form`), never `useForm` directly.
- `onSubmit` receives `{ data, onSuccess, onError, onReset, setError, onProgress }`. Loading stays on until one of
  `onSuccess`, `onError`, `onReset` or `setError` is called. Example:
  `onSubmit={({ data, onSuccess, onError }) => api.post('/x', data).then(() => onSuccess('')).catch(onError)}`
- The `component` gets the form props; pass them down with `{...props}`. `register` every input; use `setValue` for
  values that are not inputs; `useWatch({ control, name })` narrowly, only where the value is shown.
- Checkbox groups use `utils/id_list_field` in the schema (a single box gives a string or boolean).
- Buttons inside a form that do not submit need `type="button"`.
- Drawers with a form use `FormDrawer` (`onSave` may be async; a thrown error shows in the drawer, so don't catch it
  there). Data its fields need (roles, people) comes in as props from the screen that loaded it, never from a `useGet`
  inside the fields.
- Auth screens use `AuthForm` inside `AuthCard`; first-run setup steps use `SetupForm` inside `SetupShell`.

## Form fields (`ui/`)
Every field follows the pattern of `ui/input.tsx` and `ui/select.tsx`:
- The wrapper is a `<label>`, so no ids, no `htmlFor`, no `useId`. Text-like fields (Input, Select, Textarea) wrap
  their control in `FieldShell` (label text with a red `*` when required, the control, then `FieldError`).
- Props: `label`, `error`, `required`, plus the native element's attributes spread with `{...props}`.
- `aria-invalid={!!error}` and `aria-required={required}` go directly on the control, after `{...props}`.
- Styling comes from `utils/form_input_base_classes`; inner wrappers are `<span className="relative block">`.
- The error renders through `FieldError` (a `span` that takes any span props and renders nothing without children).
- Checkbox and Radio share `ChoiceField` (control left, label right, same `*` and `FieldError`). Toggle wraps its
  switch in a `<label>` and takes `error` the same way.
- Positions use logical insets: `inset-s-3`, `inset-e-3`, never `left`/`right`/`start-`/`end-`.

## Buttons and links
- Use `ui/button` with a variant from `constants/button_variants`; never repeat button or link classes by hand.
- `Button` has no `loading` prop: while saving, pass `disabled={form.loading}` (or the saving flag).
- A link inside text or a small text link ("Create an account", "See all") is
  `<Button as={Link} to="…" variant="primaryLink">`.
- A new look that will repeat becomes a new variant in `constants/button_variants`, not a class string in a page.

## UI
- Overlays (modal, drawer, sheet, confirm, alert) are built with `withOverlay` and opened through
  `component={({ open }) => <Button onClick={open} />}`, never with local `isOpen` state.
- Design tokens only (the `@theme` block in `src/index.css`): no raw palette colors, hex values or `rounded-xl`.
- Brand: the logo, icon and colors come from `brand/` (`brand/README.md`; masters in `brand/src`, React copies in
  `src/icons/restora_*`). Loading is shown with skeletons (see Data), never a spinner (`LoaderCircle`, `animate-spin`);
  a busy button says what it is doing in words ("Setting up…").
- Logical CSS only (`ms-`, `pe-`, `text-start`, `inset-s`) so RTL can be switched on later.
- Each kind of screen gets a layout that fits its job: sign-in screens look like sign-in, setup looks like a
  workspace, app pages use the app layout. Don't reuse a layout just because it's there.

## Checks
- Client tests (Vitest) cover pure logic only: store actions (`store/auth_store.test.ts`) and hooks
  (`hooks/useGet.test.tsx`, `// @vitest-environment jsdom`), next to the file they test; shared fixtures in `src/test/`
  (`sample_me`). A new store action or a change to a hook gets a test. Screens are not tested. The server's `bun test`
  covers permissions, tenant isolation and that writes answer with the saved record in its list's shape.
- Before finishing: `yarn typecheck`, `yarn lint`, `yarn test` and `yarn build` pass, and a search finds none of: `get()` after a
  write, `useGet` inside rows, the same URL loaded twice on one screen, `me` in an answer the client could work out,
  `useAuthStore((state) => state.me?.workplace…)` in a component, one-line wrapper functions, helper files that only one file uses, and `demo`/`DEMO`/fallback data.

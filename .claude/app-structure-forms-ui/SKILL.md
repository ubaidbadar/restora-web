---
name: app-structure-forms-ui
description: Restora Web client architecture and conventions: API/cache workflows, centralized route policy, auth and permissions, React state, forms, reusable UI, offline behavior, testing and design tokens.
---

# Client structure, forms and UI

Apply these rules to every change in the React client (React 19 + TypeScript + Vite + Tailwind v4, React Compiler on).
Follow the user's existing structure exactly. Do not refactor, restyle or touch files outside the request.

## Write simple code first
The user reviews every line. Code that is clever, defensive or "future-proof" is a mistake here.
- Pick the plainest solution that works. If a hook or component needs a comment to explain its own machinery, it is
  too complicated: simplify it.
- Do not add state, refs, counters, memoization or effects to derive values that can be calculated during render.
  `useRef` is appropriate for imperative values and DOM access; `useEffectEvent` is appropriate for effect callbacks
  that need the latest props/state without resubscribing; request IDs or cancellation are appropriate when async work
  needs stale-result protection. These APIs are allowed when the behavior requires them; use the smallest tool that
  solves a real lifecycle or correctness problem.
- React Compiler is enabled. Avoid manual `useMemo`, `useCallback` and `memo` as routine performance decoration.
  Use them only when stable identity is part of an API contract or a measured issue remains.
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
Every request costs the user time on a slow restaurant connection. Do not make a follow-up read just to refresh data
that a successful write already returned. Use the response to update the relevant store/cache. A read is appropriate
when the client genuinely lacks the data, the user explicitly refreshes, or a documented background/live workflow
must reconcile missed events. Before adding any request, check whether the data is already in the store, cache or parent.

1. **Bootstrap loads `/me` in `main.tsx`** after hydrating the response cache and offline outbox from IndexedDB:
   `api.get<Me>('/me').then((res) => useAuthStore.getState().setMe(res.data))`. If the network is unavailable, the
   previously saved `/me` restores the signed-in context for an offline start. It carries the account, `mode` (`web`/`pos`),
   terminal (`device`), restaurants, and the current `workplace` (restaurant, branch, available branches, permissions,
   role names and restaurant settings). Screens read shared context from the store (`useWorkplace()`,
   `useRestaurantSettings()`, `useCan()`) instead of making their own `/me`, settings, branch or restaurant-switcher reads.
   `live_updates.tsx` has one deliberate exception: when the live event stream reconnects, it refreshes `/me` only to
   reconcile workplace guest calls. Do not add page-level `/me` requests.
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
   A `403 context_lost` also carries `me`. The live-stream reconnect refresh described in step 1 is the only
   documented background `/me` read; do not add routine refreshes after saves.
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
- Default-export the primary runtime value/component from each file. Avoid named runtime exports and barrels
  (`index.ts` files that only re-export). Named type-only exports are allowed when a consumer needs a public type.
- A file is named after what it exports: `format_rs.ts` exports `formatRs`, `order_card.tsx` exports `OrderCard`.
- Files and folders are lowercase `snake_case`. Hook files and `withOverlay` are camelCase (`useGet.ts`).
- A type is `export default interface X {}`, or `type X = …; export default X;`.

## Folders (`src/`)
- `pages/<name>_page/`: one folder per route. `index.tsx` is the page. Components used only by that page sit next to it;
  a bigger section gets its own folder with an `index.tsx` (for example `pages/new_order_page/customer_step/`).
  Page-only zod schemas go in `schema.ts` (or `<name>_schema.ts` when there are several).
- `components/`: UI used by two or more components (including `can.tsx`, `load_failed.tsx`, `skeleton_list.tsx`, `skeleton_grid.tsx`, the switchers).
- `ui/`: design-system primitives (button, input, select, textarea, checkbox, radio, toggle, modal, drawer, tabs, `form/`).
- `hoc/`: genuine wrapping UI components such as `withOverlay` and the authenticated `app_layout/`. Route access is
  not an HOC: keep it declarative in `src/app.tsx` route metadata. Do not add route-guard HOCs or a second startup gate.
- Route access is resolved in `App` from one auth-store snapshot and the matched routes' `handle` metadata. Use pure
  `can(workplace, permission)` from `@shared/can` for permissions. Keep the denied state at the matched route so its
  parent layout remains mounted; keep redirects and public/guest/POS/setup behavior covered by tests.
- `hooks/`: reusable hooks, including `useGet` for screen-owned API reads and the named store hooks (`useWorkplace`,
  `useRestaurantSettings`, `useCan`, `useNavLinks`). Direct API reads are reserved for the documented bootstrap,
  live-update and explicit background/imperative workflows.
- `store/`: every module-level store: `create_store` and each store made with it (`auth_store`, `toast_store`),
  holding the state and the actions that change it (`setMe`, `setWorkplace`, `setSettings`, `setBranch`).
  Never put a store in `utils/`.
- `types/`: global types, one per file.
- `constants/`: constant values and shared zod schemas, one per file (including `button_variants`, `button_sizes`).
- `utils/`: plain helpers, one per file.
- `icons/`: SVG components, only when needed.
- `config/`: the axios clients: `config/api.ts` (`/api/v1`) and `config/auth_api.ts` (Better Auth, `/api/auth`).
- Never create `features/` or `src/shared/`. Code shared with the server (permission catalog, preset roles, `can()`,
  and the `Me`, `Workplace` and `RestaurantSettings` types) lives in the repository-root `shared/` directory,
  imported as `@shared/...`.

## State
- Keep one source of truth. Do not mirror values already owned by the server, `useGet` cache or a store into local state
  unless the user is editing a draft or the UI genuinely needs a temporary independent value.
- There is no blanket one-hook or one-state-per-component quota. A component may subscribe to multiple independent
  sources (for example, a page's `useGet` result and `useWorkplace()`) when it renders both. Split components to
  clarify responsibilities, isolate expensive updates or improve reuse, not just to reduce a hook count.
- Local UI state stays near the section that uses it (for example, whether a section is expanded). Derive values from
  existing data whenever possible instead of storing a second copy.
- A value the server reads (date, scope, status, page, search text or an ID in the address) lives in the `useGet`
  request's `options`, not in duplicate state or a second source of truth. Read it from `options.params.x` or
  `options.url`, and change it with `get({ params: { x } })` or `get({ url })`. Clear a filter with `undefined`;
  params merge, so leaving a key out keeps its previous value.
- **Search text the server uses is a filter like any other.** Read it from `options.params.search` and call
  `get({ params: { search: value || undefined } }, 400)`. Do not mirror the same server query in separate state or
  add a screen-level debounce effect/timer.
- Filters and tabs that only narrow data already loaded on the client may live in the URL, using
  `useSearchParams` and `utils/with_param`; they do not call `get`. Flow steps should be derived from saved data when
  that data already determines the current step.
- Avoid effect chains that synchronize one piece of state into another. Use an effect only to synchronize with an
  external system (network, browser API, subscription, timer, imperative widget) or for a real lifecycle requirement.
- React Compiler is enabled. Avoid manual `useMemo`, `useCallback` and `memo` unless stable identity is required by
  an external API or profiling demonstrates a remaining issue.

## Data
- Read screen-owned API data with `useGet<T>(url, { active, ...axiosConfig })` in the component that owns the screen
  data (see "Update the state" for where that is). It returns `{ data, loading, error, options, get, update }`.
  The intentional direct-read exceptions are app bootstrap in `main.tsx` and background reconciliation in
  `hoc/app_layout/live_updates.tsx` (SSE reconnect catch-up for orders/tables and the visible WhatsApp inbox refresh).
  These infrastructure reads update the shared cache/store; they are not a pattern for ordinary page components.
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
- Production screens show real server data; never invent fallback records, fake IDs or sample rows to make a screen
  look populated. `src/constants/sample_menu.ts` is an intentional first-run starter-menu template offered only when
  the user explicitly chooses to add sample dishes. Fixtures in `src/test/` are test-only. A missing endpoint belongs
  in the backend; a failed read must show its real error/retry state, not fabricated data.
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
  `utils/sync_outbox` sends it, oldest first, when the internet is back. A definitive server rejection stays in the
  outbox with its sync issue for human review; never silently discard queued work. Screens lay waiting changes over the
  server's list (`orders_page/board_with_outbox`).
- A new record made offline carries a `clientId` (and `placedAt`); the server saves it once however often it is sent.
- Payments and khata are online only: they change what customers owe.

## Routing and route access
- `src/app.tsx` is the single source of truth for route definitions and route-level access policy. Attach typed
  `RouteAccess` metadata to route objects through `handle`; pathless route groups inherit shared requirements without
  rendering wrapper components.
- `App` reads the auth store once, matches the current location against that same route tree, and passes the matched
  policies to the pure `resolveRouteAccess` helper. Do not create per-route guard components or subscribe to
  `useWorkplace()`/`useCan()` for route decisions.
- `resolveRouteAccess` uses the matched route order so nested requirements retain their intended precedence. It uses
  the current `me` snapshot and pure `can(workplace, permission)` from `@shared/can`; it never calls the API.
- Permission-denied pages replace only the matched route element, preserving its parent layout (for example, the
  authenticated app shell). Redirect-only permissions keep their configured destination.
- Preserve safe `next` redirects, the guest `?add=1` exception, locked POS terminal handling, web/POS mode
  restrictions, restaurant selection, owner setup redirects, permission redirects and not-allowed states, public
  table/invitation/auth routes, and the not-found route. Add or update resolver tests when route policy changes.
- The backend remains authoritative and must enforce every permission and tenant boundary; client route checks are
  navigation and UI gating only.
- Page components may still use `useWorkplace()`, `useRestaurantSettings()` or `useCan()` when they need that data
  for their own UI or business logic. The single-snapshot rule applies to route-level decisions, not page behavior.

## Auth and permissions
- The session is an httpOnly cookie (Better Auth); a POS terminal's key is an httpOnly cookie too. Never store a token,
  restaurant id or branch id in the page or `localStorage`.
- `store/auth_store`: `me` (`undefined` while starting, `null` when nobody is signed in), `terminal` (a locked POS
  terminal), `setMe(me, terminal?)` and the update actions above.
- Read: `useAuthStore((state) => state.me)` for the account; `useWorkplace()` (restaurant, branch, branches,
  allBranches, permissions, roleNames, `isOwner`, `isPrimaryOwner`, `hasPin`, `settings`); inside a restaurant
  `useRestaurantSettings()`.
- Component-level visibility uses `useCan('orders:create')` or `<Can permission="orders:create">`; outside components
  use pure `can(workplace, permission)` from `@shared/can`. Route-level permissions belong in `src/app.tsx` and use
  the single workplace snapshot there, not separate guard components calling `useCan()`/`useWorkplace()`. The server
  checks again. Gate by permission (`resource:action`), never role name: roles are editable. Owner-only actions check
  `workplace.isPrimaryOwner`.
- Change where they work with `api.post('/me/workplace' | '/me/branch')`; the answer is the new `me`.
  `utils/sign_out` signs every account out; `utils/lock_terminal` locks a terminal.
- Better Auth calls (sign in/up, passwords, email verification, accounts on this browser) go through
  `config/auth_api.ts`. Sign-in and switching account answer with `me`.
- `config/api.ts` (`withCredentials`) reacts to `401` with `code: 'signed_out' | 'pos_locked'` by updating auth state;
  the centralized route policy resolves the resulting navigation. A `403 context_lost` sets the `me` it carries.
  `403 reauth_required` means "sign in again"; show its message.

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
- The Vitest suite includes utility/unit tests and component or page behavior tests (for example new order, orders board,
  WhatsApp, load errors, inputs, hooks, stores and theme contrast). Add or update tests beside the relevant feature when
  behavior changes; cover user-visible success, loading, empty and failure states where applicable. Shared fixtures live
  in `src/test/`. When changing API contracts, auth or tenant boundaries, also run the corresponding backend tests:
  client tests cannot prove server-side authorization or tenant isolation.
- Before finishing: `yarn typecheck`, `yarn lint`, `yarn test` and `yarn build` pass, and a search finds none of: `get()` after a
  write, `useGet` inside rows, the same URL loaded twice on one screen, `me` in an answer the client could work out,
  `useAuthStore((state) => state.me?.workplace…)` in a component, route-level `useWorkplace()`/`useCan()` calls in
  separate route-guard components or duplicate path-to-permission tables, one-line wrapper functions, helper
  files that only one file uses, and fake production/demo fallback records.

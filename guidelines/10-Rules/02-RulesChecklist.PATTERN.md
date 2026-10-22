# Architecture Rules Checklist — Self-Audit Reference

This file exists to be checked against, line by line, before proposing
any new code in this project — not to be read once and remembered. Every rule here was established somewhere in the pattern files of this guidelines set (architecture, adapters, UI components, data, authentication, access control); this file is a compressed index of them, grouped by domain, so a new proposal can be checked
against the full rule set quickly instead of relying on memory across a
long conversation.

**How to use this:** before presenting any new code, go through the
relevant sections below and verify the proposal doesn't silently violate
any of them — especially rules that don't obviously relate to whatever
the current task is. A new feature is not exempt from old rules just
because it's unrelated to what those rules were originally written for.

---

## Dependency Direction (the rule most likely to be silently violated)

- [ ] `adapters/` never imports from `application/` or `modules/` — it is
  the lowest layer, a pure leaf. Nothing above it is ever referenced
  inside it, including indirectly (e.g. calling app-level state/UI
  triggers from inside an interceptor).
- [ ] `application/` imports ONLY stateless, pure functions from a
  module (services) — never hooks, controllers, components, or anything
  that itself depends on React state.
- [ ] A module may import its own shared state back from `application/`
  via that resource's exposed hook (e.g. `useAuth()`) — this is the one
  reverse direction that's allowed, and only this direction.
- [ ] Never invent a function call in `application/` (or anywhere) without
  first checking it's actually defined and exported from the module it
  claims to come from. If it doesn't exist yet, define it in the
  module's services file FIRST, export it through the module's
  `index.js`, THEN reference it.
- [ ] Modules never import directly from other modules, and never import
  third-party libraries directly — always through `adapters/`.

## Services

- [ ] One file per RESOURCE, not one file per request — e.g.
  `InvoiceServices.js` holds `fetchInvoices`, `createInvoice`,
  `updateInvoice`, `deleteInvoice` together as named exports.
- [ ] Pure functions only — no React, no hooks, no state.
- [ ] Services throw on failure, never catch/reshape — the http adapter's
  interceptor already guarantees the `{ status, message, data, code, requestId }` shape
  on whatever they throw.
- [ ] Lives in `modules/<resource>/services/`, `PascalCase` filename.

## Adapters (`adapters/`)

- [ ] Every third-party library is imported ONLY inside its own adapter
  file — never directly from a module, hook, component, or
  `application/`.
- [ ] Adapters expose YOUR OWN function names, not a pass-through of the
  library's raw API.
- [ ] All adapters use named exports (`export const get = ...`), never a
  single default-exported object.
- [ ] Eight adapters currently exist: `http`, `router`, `query`,
  `validation`, `uuid`, `notifications`, `storage`, `icons`. A new
  browser/native API (e.g. `localStorage`, which `storage` wraps) also
  gets its own adapter, even though it's not a third-party library — for
  consistency, not because the rule strictly requires it.
- [ ] `icons` exports its OWN generic names (`ErrorIcon`, `EmptyIcon`,
  etc.), never the underlying icon's real name from whichever family it
  came from (`react-icons` is a meta-package bundling multiple icon
  families — Lucide, Font Awesome, etc. — under one dependency, so a
  missing icon in one family doesn't require a second npm package). A
  component needing an icon imports from `@/adapters/icons`, never
  `react-icons` directly.
- [ ] Only the query adapter touches `queryClient` directly
  (`setQueryData`/`getQueryData`/`setQueriesData`/`invalidateQueries`) —
  never a module, never `common/hooks/`.
- [ ] The http adapter's interceptor is the ONLY place that shapes
  `{ status, message, data, code, requestId }` — nothing downstream reshapes it again.

## Hooks vs. Controllers vs. Utils vs. Pages

- [ ] `pages/` — JSX only. No state, no logic, no handler definitions.
- [ ] `utils/` — pure functions, no React, no state (formatting,
  calculations).
- [ ] `controllers/<PageName>/` — holds ONLY that page's one controller
  hook. Composes supporting hooks + adapter hooks, shapes the return
  value for the page. Writes its own handler logic ONLY when that
  handler must combine more than one concern at once.
- [ ] `hooks/` (flat, module-level) — one file per distinct stateful
  concern. Each owns its own state AND its own handlers. Has its own
  `index.js`. New stateful logic for a page becomes a new file here, not
  more lines in the controller.
- [ ] Naming: only the file inside `controllers/<PageName>/` is "the
  controller." Everything in `hooks/` is a supporting hook.

## `common/` — What Belongs There, and When

- [ ] Promote to `common/` only on a genuine SECOND module needing it —
  never pre-emptively.
- [ ] Exception: genuinely generic, ownerless primitives (base UI
  components, `useForm`, `usePagination`, `useQueriesTracker`,
  `useMutationWithFeedback`, formatting utils) start in `common/`
  directly — no module is a sensible first owner for these.
- [ ] Environment variables live in `common/constants/`, one file per
  variable/group, own `index.js`. No separate top-level `config/` folder
  — library-specific config lives inside that library's own adapter.

## Module Boundary / Import Rules

- [ ] Every module exports ONLY through its own `index.js` — named ES
  exports, never a bundled object.
- [ ] Deep imports (bypassing a module's `index.js`) are blocked via
  `.vscode/settings.json` (autocomplete) + ESLint `no-restricted-imports`
  (hard error).
- [ ] Path aliases (`@/...`) everywhere — never relative `../../..`
  chains.

## Global State (`application/`)

- [ ] React Context, ONE per resource/domain — never one merged
  object holding multiple resources.
- [ ] Every context value wrapped in `useMemo`, every function in
  `useCallback`, with correct dependencies — this is required, not
  optional, or isolation between resources breaks.
- [ ] Never put React Query data inside a Context value — background
  refetches would re-render the whole context. Server data stays in the
  query cache; Context holds only non-request, app-lifecycle-persisted
  state.
- [ ] A module has NO `application/` counterpart at all unless something
  about it genuinely needs to survive beyond its own pages' lifecycle.

## Error Handling — the `{ status, message, data, code, requestId } ` Contract

- [ ] Every response — success or failure, read or mutation — is that
  exact shape, enforced once in the http adapter, never reshaped again
  anywhere downstream.
- [ ] On success: `select` in the query adapter unwraps to `.data` once,
  centrally — a controller's `data` is the payload directly, not the
  envelope.
- [ ] On failure: `error` stays the FULL envelope, untouched — `select`
  never runs on the error path.
- [ ] "Not found" / empty results are a SUCCESS case with empty/null
  `data` — never routed through `isError`/`InlineAlert`.
- [ ] A `401` specifically means an invalid/expired session — distinct
  from other error statuses, detected in the interceptor via a callback
  (e.g. `onSessionExpired`) supplied by whoever calls `setup()` —
  never handled by the interceptor reaching upward into app state itself.

## Forms (`useForm`)

- [ ] One unified error state (`errors` + `formError`) regardless of
  whether the failure was client-side validation or a server rejection —
  a page never branches on which happened.
- [ ] `resetOnSuccess` defaults to `false` — most forms (login, edit)
  must NOT reset. Only forms where "create another" is the expected next
  action (create flows) opt in.
- [ ] A form's `onSubmit` must be a function that returns a real promise
  and rejects on failure — `mutateAsync`, never `mutate`, when wiring a
  mutation into `useForm`.

## Mutations — Update / Delete / Create Are Three Different Cases

- [ ] Update: direct one-item cache swap (`setQueriesData` with a partial
  key) — position/count never change.
- [ ] Delete: cascading shift through already-cached subsequent pages
  (`useShiftPaginatedCacheAfterDelete`) — never a full refetch. A page
  that was never cached is left alone; it loads normally when first
  opened.
- [ ] Create: `invalidateQueries` (partial key) — position of a new item
  can't be guessed, so this is the one case that deliberately falls back
  to a real (but minimal — only the active page) refetch.
- [ ] Toast message precedence: backend's own `response.message` /
  `error.message` ALWAYS wins over a module's hardcoded fallback string.

## Caching Defaults

- [ ] `staleTime: 30s`, `retry: 1` set ONCE, globally, on `queryClient`
  itself — not scattered as per-call overrides unless a specific case
  genuinely needs to differ.
- [ ] `retry` is deliberately LOWER than the library default (`1`, not
  `3`) — this architecture already has explicit, visible retry UI
  everywhere (`InlineAlert`, `StatusNotify`, `PaginatedView`,
  `ProtectedRoute`'s auto-login); a high silent-retry count delays the
  user from ever seeing that UI.
- [ ] `gcTime` stays at the library default — do not shorten it without
  checking [Delete cache logic](../06-Data-Patterns/08-CacheUpdateAndDelete.PATTERN.md)'s delete cascading-shift logic, which depends on
  recently-visited pages still being in cache to borrow from.

## Pagination

- [ ] Page number lives in the URL via `useQueryParams` — not a security
  concern, backend authorizes independently of what's in the URL.
- [ ] `usePagination` owns page state + math + navigation as ONE
  co-located hook — never split into a separate utility.
- [ ] `isReady` gates the auto-correct-invalid-page effect, so it never
  fires against the temporary `totalCount: 0` default before the first
  real fetch resolves.
- [ ] Filtering is client-side ONLY for small, unpaginated lists. Once a
  list is paginated, filters must become query params resolved
  server-side, same mechanism as the page number.

## Initial Data Loading — `DataGate` and Resource Create/Edit Forms

- [ ] `DataGate` gates COMPONENT MOUNTING, not just rendering — this is
  load-bearing, not incidental. A form passed as its `children` never
  calls `useForm` until the gate has already passed, so the form itself
  never needs null-checks or "is this ready" logic for its own data.
- [ ] Create and edit share the SAME form component/JSX — `useForm`
  doesn't care whether `initialValues` came from blank defaults or
  fetched data. Only the wiring ABOVE the form (what feeds into it)
  differs between create and edit.
- [ ] Default to ONE page component handling both create and edit for a
  resource (`isEditMode = !!id`), not two separate page files/
  controllers — two routes (`/new`, `/:id/edit`) point at the same
  component. The resource's `useFetch` call uses `enabled: isEditMode`;
  a disabled query's `isLoading` is `false` (confirmed: `isPending &&
  isFetching`, and a disabled query's `isFetching` is always `false`),
  so `DataGate` passes through immediately in create mode with zero
  special-casing.
- [ ] Building a create/edit page for ANY resource: there are only 3
  distinct controller shapes, never 13, regardless of how many scenarios
  the data-loading behavior has (no active supporting query / exactly
  one / two-or-more via `useQueriesTracker`). Whether an individual
  fetch resolves instantly (cached) or takes real time is NEVER branched
  on in controller or page code — it's invisible React Query cache
  behavior. Follow [Resource Create/Edit Form Pattern](../06-Data-Patterns/10-ResourceForms.PATTERN.md)'s matching
  leaf directly rather than re-deriving the wiring per resource.

## UI Component Rules

- [ ] There is no separate `ErrorState` (or similarly hardcoded-status)
  component — `InlineAlert`/`StackedAlert` are fully composable for any
  status (`info`, `warning`, `error`, `success`); error display anywhere
  in the app is one of them used directly with `status="error"`. A
  component that hardcodes a status/title onto a generic, composable base
  component defeats the point of that base component being composable —
  don't reintroduce this.
- [ ] **`InlineAlert`** (icon beside text, the original) and
  **`StackedAlert`** (icon above text) — both HAVE an icon; the only real
  difference is layout direction. Do not use "text vs icon" as a naming
  split between these two — both have icons.
- [ ] **`BaseNotify`** (fully custom icon, caller-supplied),
  **`StatusNotify`** (icon auto-selected from a `state` prop), and
  **`LoadingNotify`** (icon fixed to `Spinner`) — all three built on top
  of `BaseNotify`, each fixing (or not fixing) the icon slot differently.
  `StatusNotify` is used for empty-result and error states on
  data-reading pages, in place of building separate redundant
  empty/error components; `LoadingNotify` for a full loading state that
  needs the whole title/message/button structure (as opposed to
  `PageLoadingIndicator`, which is a small, click-through, page-corner
  notice for a background operation, not a full-content loading state).
  No background, horizontally centered on all three — visually distinct
  from `InlineAlert`/`StackedAlert` (backgrounded, left-aligned). When an
  error display also needs a retry action, prefer `StatusNotify`
  (built-in `actionLabel`/`onAction`) over `InlineAlert` + a separately
  rendered button.
- [ ] `dismissible` (on `InlineAlert`/`StackedAlert`) defaults to
  `false` — opt-in, not opt-on-by-default. Many alerts (e.g. a
  validation error) shouldn't disappear just because they were clicked;
  the underlying problem is still there.
- [ ] Open/close state for any dismissible or toggleable UI
  (`InlineAlert`/`StackedAlert` now; `Dialog`/`Menu`/`Tooltip`/
  `ToggleTip` potentially later) goes through the shared `useDisclosure`
  hook in `common/hooks/` — built on plain `useState`, not dependent on
  any UI library's own version — never a one-off `useState` reimplemented
  per component.
- [ ] Two components that share layout/structure but differ in one real
  mechanism (e.g. `BaseNotify`/`StatusNotify`'s icon-selection logic) are
  TWO separate, separately-named, separately-exported components — not
  one component with a variant/mode prop switching between them. A
  "variant" is one prop changing a single component's appearance/state;
  these are genuinely different components that happen to share
  presentation, not the same component in different modes.
- [ ] `Dialog`'s `trigger` prop is optional — a dialog opened
  imperatively (via `useConfirm`, or any other non-click trigger) has no
  visible trigger element at all, and is fully controlled via
  `open`/`onOpenChange` instead.
- [ ] Destructive actions (delete, and similar) go through `useConfirm` +
  `ConfirmDialog` — the mutation's mutate function is only ever called
  after `confirm()`'s returned promise resolves `true`, never
  immediately on click.
- [ ] `Sidebar`/`SidebarNavItem`/`useSidebarCollapse` live in
  `layouts/dashboard-layout/` — layout-specific, NOT `common/components/`
  or `common/hooks/`, per the layout co-location rule. Collapse state
  persists via the storage adapter. The trigger is a separate, compact
  element (never merged into/overlapping the logo); the logo/brand never
  changes position or disappears when collapsed. The whole sidebar
  (including the brand/trigger rows) scrolls as ONE region.
- [ ] Any hardcoded UI-library color (e.g. Chakra's `gray.900`,
  `colorPalette="blue"`) is NEVER acceptable in final code, even
  temporarily, even from a CALLER passing it into a prop — reference
  `COLORS` from `common/constants/` instead. This applies retroactively
  to every component, including ones documented before this rule
  existed. `Sidebar` was updated to comply; `Button`, `IconButton`,
  `Avatar`, `InlineAlert`, and other Chakra components documented in
  `05-UI-Component-Patterns/` have NOT yet been audited
  against this rule and still show Chakra's own native `colorPalette`
  default values — this is known, unresolved technical debt, not an
  accepted exception.
- [ ] `common/constants/Colors.js` is a plain, UI-library-agnostic JS
  object — NOT a Chakra theme system (`createSystem`/`defineConfig`) or
  any other library's native theming mechanism. Each of `primary`,
  `secondary`, `success`, `error`, `info`, `warning` has 3 variants
  (`base`, `hover`, `subtle`); `body` and `stage` have 2 each (`base`/
  `muted`, `base`/`surface`). `secondary` is a neutral (slate), not a
  second saturated color — deliberate, since pairing two strong colors
  creates competing focal points; `secondary` also doubles as the
  border/divider color for the same reason. Text on any `base` variant
  of the six saturated colors is white — resolved as a universal rule,
  not a per-color token, since all `base` values are dark/saturated
  enough for sufficient contrast.

## Naming Conventions

- [ ] Hooks: `camelCase`, prefixed `use`, shape `use<Resource><Concern>`.
- [ ] Everything else (components, pages, services, utils, constants):
  `PascalCase`.
- [ ] Folders: `lowercase-with-hyphens`.
- [ ] `index.js` always stays lowercase — module-resolution convention,
  exempt from the rule above.
- [ ] A file's `PascalCase` name and its exported identifiers don't have
  to match casing — exports still follow normal JS `camelCase` function
  naming.

## Layouts

- [ ] A layout gets its own folder ONLY if it has layout-specific
  components to co-locate with it (e.g. `dashboard-layout/` has
  `Sidebar.jsx`, `Navbar.jsx`). This is NOT automatic for every layout.
- [ ] A layout with no such co-located components is a plain file inside
  a shared folder within `layouts/` (e.g. `layouts/_common/`,
  underscore-prefixed so it sorts first) — it does not get its own
  dedicated folder just because it's a layout.

## Routing / Auth Guards

- [ ] `ProtectedRoute` — requires authentication. Owns the ONLY place
  auto-login is ever triggered (not a global app-boot effect). Waits on
  a loading layout while checking; on a retryable failure, stays in that
  loading state with a retry option; on a confirmed invalid session
  (401-style outcome), redirects to login.
- [ ] `GuestRoute` — requires the OPPOSITE (not authenticated). Does a
  plain SYNCHRONOUS check of current in-memory `isAuthenticated` state
  only. Never touches `localStorage`, never triggers or waits on
  auto-login. State always resets to unauthenticated on refresh
  regardless of `localStorage` contents — this is what makes the
  synchronous check correct and avoids any "flash of wrong content."
- [ ] `localStorage` (via the storage adapter) is a convenience ONLY for
  `ProtectedRoute`'s auto-login attempt — it is never treated as a
  source of truth for auth state anywhere else. In-memory state is
  always the authority.
- [ ] Interceptor setup (`setup({ getToken, onSessionExpired })`) is a
  SEPARATE concern from auto-login — it runs once, globally, regardless
  of whether any `ProtectedRoute` ever triggers an auto-login attempt.
  When extending `useAuthLogic` for one of these two features, verify
  the other one is still present — adding one has previously caused the
  other to be silently dropped.
- [ ] `storage` (wrapping `localStorage`) is a seventh adapter, added
  after the original six — check it's reflected everywhere the adapter
  list/count is referenced ([Adapter Principles](../04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md)'s table, the folder tree, this checklist)
  when it's added, not just where it's used.
- [ ] `logout` clears the entire query cache (`useClearCache`) in
  addition to clearing user state and the stored email — otherwise
  cached data from the previous session can briefly flash on screen if a
  different user logs in right after, on the same browser.
- [ ] Permission gating ALWAYS checks a permission string
  (`invoice:delete`, etc.), NEVER a role name. A role is only a named
  bundle of permissions on the backend — the frontend never branches on
  which role a user has, or on whether roles are fixed/hardcoded vs.
  dynamically created at runtime (Discord-style). Both backend models
  produce the same shape on the user object (a flat permission array);
  there is no separate frontend system for each.
- [ ] `PermissionGate`/`useHasPermission` live in `application/auth/`
  (need `useAuth()`); `hasPermission` itself is a pure function in
  `common/utils/permissions.js`, with no React/application coupling.
- [ ] `hasPermission`'s `mode` defaults to `"all"` (every listed
  permission required) — `"any"` is opt-in, not the default.
- [ ] 404/unmatched-route handling needs TWO catch-all routes, not one —
  one nested inside the dashboard's route tree (layout-aware, keeps
  sidebar/nav visible) and one at the top level, outside
  `ProtectedRoute` (so an invalid URL shows 404 immediately, without
  waiting on an auth/auto-login check that's irrelevant to whether the
  route exists at all). `NotFoundPage` lives in `common/pages/` — an
  ownerless, app-wide page, not tied to any module — using `BaseNotify`
  (not `StatusNotify`, since a 404 doesn't fit its data-reading state
  enum).

---

## If a new rule gets established

Add it here, in the relevant section, the same session it's decided —
not as a follow-up cleanup task. An unrecorded rule is a rule that will
get silently violated the next time something adjacent gets built.

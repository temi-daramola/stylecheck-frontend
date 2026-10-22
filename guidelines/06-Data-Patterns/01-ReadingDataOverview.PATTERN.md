# Reading & Paginating Data — Governing Rules

Covers server-side pagination, since once a list is paginated, filtering
must also move server-side — client-side filtering only ever makes sense
on a fully-loaded, unpaginated dataset.

**The governing rules:**

- **Page number lives in the URL**, via the router adapter's
  `useQueryParams` ([Router Adapter](../04-Adapter-Patterns/03-RouterAdapter.PATTERN.md)). Not a security concern — a page number carries
  no sensitive information, and the backend must independently authorize
  every request regardless of what's in the URL.
- **`usePagination`** (in `common/hooks/`) owns page state, page-count
  math, and navigation as one co-located unit — not split into a separate
  utility — and self-corrects if the current page becomes invalid (e.g.
  after a delete shrinks the total count below the current page).
- **`keepPrevious` on `useFetch`** keeps the previous page's data visible
  while the next page loads, instead of flashing to blank — `isFetching`
  (not `isLoading`) drives the dimmed/disabled UI state during that
  transition.
- **`PaginatedView`** (in `common/components/`) is the reusable wrapper —
  takes any view (table, cards, anything) as `children`, owns only the
  loading/error/pagination chrome around it.
- **Filtering is client-side only for small, unpaginated lists.** Once a
  list is paginated, filter values must become query params sent
  alongside the page number, resolved server-side, in the same request.
- **`useQueriesTracker`** (in `common/hooks/`) gates rendering on
  multiple simultaneous queries (e.g. a form needing both a primary
  resource and supporting data) — a primary query's failure surfaces its
  real backend message; a supporting query's failure surfaces a generic
  one, since the frontend is often merging independent backend endpoints
  into what feels like one page to the user.
- **Detail views** reuse the same fetch/error pattern as a list, with two
  additions: reading the resource ID via `useRouteParams` ([Router Adapter](../04-Adapter-Patterns/03-RouterAdapter.PATTERN.md)), and
  treating "not found" as a successful response with empty/null `data` —
  never as an error state.
- **`DataGate`** (in `common/components/`) is the reusable initial-load
  gate — loading (skeleton, matching content shape) → error
  (`StatusNotify` + retry) → ready (`children`) — used for list, detail,
  and form pages alike. Critically, it gates *mounting*, not just
  rendering: a form passed as its `children` never calls `useForm` until
  the gate has already passed, so the form never needs to handle
  not-yet-loaded data itself. A resource's create and edit pages default
  to ONE page/controller (branching internally on whether an ID is
  present), not two separate ones — deciding how many fetches it needs
  and whether `useQueriesTracker` is required follows the explicit,
  per-scenario construction procedure in
  [Resource Create/Edit Form Pattern](10-ResourceForms.PATTERN.md), not ad hoc per-page decisions.

Full implementation lives in the files that follow in this folder — see [`usePagination`](02-Pagination.PATTERN.md) (pagination, the paginated controller, `PaginatedView`), [`useQueriesTracker`](03-MultiQueryGating.PATTERN.md) (`useQueriesTracker`), [Detail Views](04-DetailViews.PATTERN.md) (detail views) and [`DataGate`](05-DataGate.PATTERN.md) (`DataGate`).

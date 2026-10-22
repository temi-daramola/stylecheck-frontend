# Mutations — Governing Rules

A **mutation** is any request that changes data on the backend — create,
update, delete — as opposed to a read ([Reading & Paginating Data](01-ReadingDataOverview.PATTERN.md)). This section covers the
shared pattern for running a mutation, updating the cache correctly
afterward, and giving the user feedback.

**The governing rules:**

- **Only the query adapter touches `queryClient` directly** (per [Adapter Principles](../04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md)) — so
  every cache-update function lives in `adapters/query/`, never in
  `common/hooks/` or a module. `common/hooks/` only ever calls those
  adapter functions.
- **`useMutationWithFeedback`** (in `common/hooks/`) runs the mutation,
  delegates cache updates to whichever adapter function fits, and shows a
  toast — with the backend's own `response.message`/`error.message`
  ([HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)'s shape contract) always taking precedence over a module's
  hardcoded fallback string.
- **Update and delete need genuinely different cache logic.** An update
  changes nothing about position or count — a direct, one-item swap.
  Deleting shifts every subsequent cached page — the item after the
  deletion point moves back one slot, so cached pages must be walked
  forward and patched, not just the one page the deletion happened on.
- **No wasted network requests.** Both update and delete patch the cache
  directly using data already returned by the mutation itself — never a
  full list refetch. For delete specifically, already-cached later pages
  are corrected in-memory by borrowing items forward from each other; a
  page that was never cached simply loads normally, for the first time,
  whenever it's actually opened.
- **`usePagination` self-corrects automatically** if a delete leaves the
  user on a page that no longer exists (e.g. the last item on the last
  page was removed) — this falls out of [Reading & Paginating Data](01-ReadingDataOverview.PATTERN.md)'s reactive design, with no
  mutation-specific handling required.
- **Create is the third case, different again.** A newly created item has
  no existing position in the cache to patch — where it belongs depends
  on backend sort order, which can't be safely guessed. Create uses
  `invalidateQueries` instead, and — unlike update/delete, which both
  stay on their current page — a create form stays on the page too, but
  **resets back to its initial values** after success (via `useForm`'s
  opt-in `resetOnSuccess`), rather than navigating away, since the next
  likely action is often creating another item.
- **Services are one file per resource** ([What Goes Where](../02-Architecture-Patterns/04-ModulePublicApi.PATTERN.md)), e.g. `InvoiceServices.js`
  holding `fetchInvoices`, `createInvoice`, `updateInvoice`,
  `deleteInvoice` together as named exports — not a separate file per
  request.

Full implementation lives in the files that follow in this folder — see [`useMutationWithFeedback`](07-MutationFeedback.PATTERN.md) (`useMutationWithFeedback`), [Why Update and Delete Need Different Cache Logic](08-CacheUpdateAndDelete.PATTERN.md) (why update and delete differ), [Module-Level Hooks](08-CacheUpdateAndDelete.PATTERN.md) (the module-level hooks) and [Create flow](09-CreateFlow.PATTERN.md) (create).

## Implementation Notes

A **mutation** is any request that changes data on the backend — create,
update, delete — as opposed to a read ([Reading & Paginating Data](01-ReadingDataOverview.PATTERN.md)), which only fetches data.
This section covers the shared pattern for running a mutation, updating
the cache correctly afterward, and giving the user feedback — all without
each module reimplementing that combination by hand.

**The core design rule: only the query adapter is allowed to touch
`queryClient` directly** (per [Adapter Principles](../04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md) — third-party library internals stay
inside the adapter). So every function below that calls
`setQueryData`/`getQueryData`/`setQueriesData` lives in
`adapters/query/`, never in `common/hooks/` or a module — `common/hooks/`
only ever *calls* those adapter functions, it never manipulates the cache
itself.

**Dependency:** mutations build directly on the pagination cache shape established in [`usePagination`](02-Pagination.PATTERN.md) — read the pagination pattern first.

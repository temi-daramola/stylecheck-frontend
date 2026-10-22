# Pagination and Filtering

## `usePagination` — Page State and Math, Co-located in One Hook

Lives in `common/hooks/`, reusable for any paginated resource. It owns
everything about pagination as one unit — reading/writing the current
page (synced to the URL via the router adapter's `useQueryParams`, [Router Adapter](../04-Adapter-Patterns/03-RouterAdapter.PATTERN.md) —
this is not a security concern; a page number carries no sensitive
information, and the backend must independently authorize every request
regardless of what's in the URL) — plus the page-count math and
next/prev/go-to navigation, rather than splitting the math into a
separate utility:

```js
// common/hooks/usePagination.js
import { useCallback, useEffect } from "react"
import { useQueryParams } from "@/adapters/router"

export const usePagination = ({
  paramKey = "page",
  pageSize = 20,
  totalCount = 0,
  isReady = false,
} = {}) => {
  const params = useQueryParams()
  const currentPage = Number(params.get(paramKey)) || 1
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const goToPage = useCallback(
    function (page) {
      const clampedPage = Math.min(Math.max(1, page), totalPages)
      params.set(paramKey, String(clampedPage))
    },
    [params, paramKey, totalPages]
  )

  const nextPage = useCallback(function () { goToPage(currentPage + 1) }, [goToPage, currentPage])
  const prevPage = useCallback(function () { goToPage(currentPage - 1) }, [goToPage, currentPage])

  // If the page currently being viewed no longer exists — e.g. deleting
  // the last item on the last page shrinks totalPages below currentPage
  // (see 06-Data-Patterns/08-CacheUpdateAndDelete) — automatically move back to the last valid page.
  // Gated on `isReady` (true once the first fetch has resolved) so this
  // never fires against the temporary totalCount: 0 default on first
  // render, which would otherwise incorrectly redirect a user who
  // directly loaded a URL like ?page=3 back to page 1 before the real
  // count has even had a chance to load.
  useEffect(
    function () {
      if (isReady && currentPage > totalPages) {
        goToPage(totalPages)
      }
    },
    [isReady, currentPage, totalPages, goToPage]
  )

  return {
    currentPage,
    totalPages,
    canGoNext: currentPage < totalPages,
    canGoPrev: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
  }
}
```

```js
// common/hooks/index.js
export { useForm } from "./useForm"
export { usePagination } from "./usePagination"
```

The controller supplies `isReady` directly from the fetch's own loading
state:
```js
const pagination = usePagination({
  totalCount: data?.totalCount ?? 0,
  pageSize: data?.pageSize ?? 20,
  isReady: !isLoading,
})
```

**Before the first fetch resolves, `totalCount` defaults to `0`.**
`Math.ceil(0 / pageSize)` evaluates to `0`, and `Math.max(1, 0)` floors
`totalPages` at `1` — no division-by-zero error, and both `canGoNext`/
`canGoPrev` come out `false`, so navigation is safely inert until real
numbers exist. Once the controller's fetch resolves with a real
`totalCount`, `usePagination` recalculates correctly. During a
page-to-page transition ([Paginated fetch controller](02-Pagination.PATTERN.md)'s `keepPrevious`), the *previous* page's
`totalCount` stays available the whole time the next page is fetching, so
`totalPages` — and therefore the enabled/disabled state of the
controls — never resets to `1` and flickers mid-transition.

## Wiring a Paginated Fetch — Controller Example

```js
// modules/invoice/controllers/invoice-list/useInvoiceListController.js
import { useFetch } from "@/adapters/query"
import { useQueryParams } from "@/adapters/router"
import { usePagination } from "@/common/hooks"
import { fetchInvoices } from "@/modules/invoice/services/InvoiceServices"

export const useInvoiceListController = () => {
  const params = useQueryParams()
  const page = Number(params.get("page")) || 1

  const { data, isLoading, isFetching, isError, error, refetch } = useFetch(
    ["invoices", { page }],
    () => fetchInvoices({ page }),
    { keepPrevious: true }
  )

  const pagination = usePagination({
    totalCount: data?.totalCount ?? 0,
    pageSize: data?.pageSize ?? 20,
  })

  return {
    invoices: data?.items ?? [],
    isLoading,   // true only on the very first load ever
    isFetching,  // true on every fetch, including background page transitions
    isError,
    error,
    retry: refetch,
    ...pagination,
  }
}
```

Since `useFetch`'s `select` ([Query Adapter](../04-Adapter-Patterns/04-QueryAdapter.PATTERN.md)) already unwraps the backend envelope
down to its `data` field, `data` here is the payload directly —
`{ items, totalCount, pageSize }` — not the full `{ status, message,
data }` envelope. This shape (`items` + `totalCount` + `pageSize`) is
specific to paginated list endpoints — a single-resource endpoint's
payload doesn't need this wrapping, since there's no collection metadata
to carry alongside it.

`page` is read directly from the URL to build the fetch's query key.
`usePagination` independently reads the exact same URL param for
`currentPage`, so the two can never disagree.

## `PaginatedView` — Reusable Wrapper Component

Lives in `common/components/`, same "ownerless primitive" category as
`Input`/`Select`/`Textarea` ([Base UI Component wrapping](../05-UI-Component-Patterns/01-BaseComponentWrapping.PATTERN.md)). Takes any view as `children` — a
table, a card grid, anything — and owns only the loading/error/pagination
chrome around it, never the view's own markup.

```jsx
// common/components/PaginatedView.jsx
import { StatusNotify } from "./StatusNotify"

export const PaginatedView = ({
  isLoading,
  isFetching,
  isError,
  error,
  onRetry,
  currentPage,
  totalPages,
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
  children,
}) => {
  if (isLoading) return <div>Loading…</div>

  if (isError) {
    return (
      <StatusNotify
        state="error"
        title="Couldn't load this page"
        message={error?.message}
        actionLabel="Try again"
        onAction={onRetry}
      />
    )
  }

  return (
    <div>
      <div style={{ opacity: isFetching ? 0.5 : 1, pointerEvents: isFetching ? "none" : "auto" }}>
        {children}
      </div>
      <div>
        <button disabled={isFetching || !canGoPrev} onClick={onPrev}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button disabled={isFetching || !canGoNext} onClick={onNext}>Next</button>
      </div>
    </div>
  )
}
```

`isFetching` — not `isLoading` — drives the dimmed/disabled state during
a page transition, since `isLoading` only ever fires once, on the very
first load. `onRetry` is React Query's own `refetch`, so a failed page
retries that exact same page — the user is never silently moved to a
different page than the one they were trying to reach.

```jsx
// usage
<PaginatedView {...paginationProps} onNext={nextPage} onPrev={prevPage} onRetry={retry}>
  <InvoiceTable invoices={invoices} />
</PaginatedView>
```

## Filtering — Client-Side Only for Unpaginated Data

Once a list is paginated, the backend only ever returns one page's worth
of rows — filtering those rows in memory only searches within the
currently-loaded page, not the full dataset, which silently produces
wrong/incomplete results. So the rule is: **client-side, in-memory
filtering is only correct for small, fully-loaded, unpaginated lists**
(e.g. a settings list, a dropdown's options). For anything paginated, the
filter value must become a query param sent alongside `page` — the same
`useQueryParams` mechanism already used for the page number — so
filtering and pagination are both resolved server-side, together, in the
same request.

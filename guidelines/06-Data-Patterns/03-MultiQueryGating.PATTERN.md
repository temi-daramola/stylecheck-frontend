# Gating Rendering on Multiple Queries — `useQueriesTracker`

A page often depends on more than one request before it can render
anything meaningful — e.g. a product edit form needs both the product
itself and a categories list for a dropdown. Checking each query's
`isLoading`/`isError` separately, by hand, on every page that needs more
than one request, doesn't scale and produces inconsistent handling across
pages. `useQueriesTracker`, in `common/hooks/`, collapses any number of
named queries into one gate — a single `isLoading`/`isError`/
`resolvedError` a page checks once, the same way a single-query page
already checks one `isLoading`/`isError` pair ([Expected Failures](../07-Error-Handling-Patterns/02-ExpectedFailures.PATTERN.md)).

**The distinction between a primary and supporting query.** The frontend
is often merging multiple independent backend endpoints into what the
user experiences as one page — so a failure needs to be communicated
consistently, not as a raw reflection of which specific backend call
happened to fail:

- **Primary query fails** → the real backend message is surfaced
  (`error.message`, per the `{ status, message, data, code, requestId }` contract from
  [HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)) — this is the main thing the page is about, so the message is
  usually meaningful and safe to show directly.
- **Supporting query fails** → the failure is still surfaced — `isError`
  is still `true`, the page still shows an error state — but the actual
  backend message is replaced with a generic one. The user still sees
  that something went wrong; they never see the raw message from a
  secondary API call, which may be too technical or reveal implementation
  detail irrelevant to what they're doing.

```js
// common/hooks/useQueriesTracker.js
import { useMemo, useCallback } from "react"

const MESSAGES = {
  missingQueries: "useQueriesTracker: at least one query must be provided.",
  missingPrimaryQueryName: "useQueriesTracker: primaryQueryName is required.",
  primaryError: "An error occurred. Please try again.",
  supportingError: "Something went wrong. Please try again.",
}

const DEFAULT_STATE = {
  name: null,
  isLoading: false,
  isError: false,
  error: null,
  resolvedError: null,
}

export const useQueriesTracker = (queries, primaryQueryName) => {
  // Validation happens INSIDE useMemo/useCallback, not before them — so
  // useMemo and useCallback are always called, in the same order, on
  // every render, regardless of whether the caller passed valid
  // arguments. Throwing before a hook call would violate the Rules of
  // Hooks the moment the arguments' validity ever changed between
  // renders.
  const result = useMemo(() => {
    if (!queries || queries.length === 0) {
      throw new Error(MESSAGES.missingQueries)
    }
    if (!primaryQueryName) {
      throw new Error(MESSAGES.missingPrimaryQueryName)
    }

    // Returns the state of the first query that is fetching or errored.
    // isFetching (not isLoading) is used deliberately — this is a
    // blocking gate, so ANY in-flight state (including a background
    // refetch) should hold the page, not just the very first load.
    for (const current of queries) {
      const isFetching = current.query.isFetching === true
      const isError = current.query.isError === true

      if (isFetching || isError) {
        const isPrimaryQuery = current.name === primaryQueryName
        const errorMessage = isPrimaryQuery
          ? current.query.error?.message || MESSAGES.primaryError
          : MESSAGES.supportingError

        return {
          name: current.name,
          isLoading: isFetching,
          isError,
          error: current.query.error || null,
          resolvedError: isError ? { message: errorMessage } : null,
        }
      }
    }

    // All queries resolved successfully — a safe default so the caller
    // can always destructure the result without null checks.
    return DEFAULT_STATE
  }, [queries, primaryQueryName])

  const retryFailed = useCallback(() => {
    if (!queries) return
    for (const current of queries) {
      if (current.query.isError === true) current.query.refetch()
    }
  }, [queries])

  const refetchAll = useCallback(() => {
    if (!queries) return
    for (const current of queries) {
      current.query.refetch()
    }
  }, [queries])

  return { ...result, retryFailed, refetchAll }
}
```

```js
// common/hooks/index.js
export { useForm } from "./useForm"
export { usePagination } from "./usePagination"
export { useQueriesTracker } from "./useQueriesTracker"
```

**The caller must memoize the queries array**, so its reference stays
stable across renders when the underlying queries haven't actually
changed — otherwise `useMemo`'s dependency would be a new array every
render, defeating the memoization entirely:

```js
// modules/product/controllers/product-form/useProductFormController.js
import { useMemo } from "react"
import { useFetch } from "@/adapters/query"
import { useQueriesTracker } from "@/common/hooks"
import { fetchProduct, fetchCategories } from "@/modules/product/services/ProductServices"

export const useProductFormController = ({ productId }) => {
  const productQuery = useFetch(["product", productId], () => fetchProduct(productId))
  const categoriesQuery = useFetch(["categories"], fetchCategories)

  const queries = useMemo(
    () => [
      { query: productQuery, name: "product" },
      { query: categoriesQuery, name: "categories" },
    ],
    [productQuery, categoriesQuery]
  )

  const tracker = useQueriesTracker(queries, "product")

  return { ...tracker, product: productQuery.data, categories: categoriesQuery.data }
}
```

A page checks the tracker's single gate instead of each query
individually:

```jsx
export const ProductFormPage = () => {
  const { isLoading, isError, resolvedError, retryFailed, product, categories } =
    useProductFormController({ productId })

  if (isLoading) return <div>Loading…</div>
  if (isError) {
    return (
      <StatusNotify
        state="error"
        title="Couldn't load this page"
        message={resolvedError.message}
        actionLabel="Try again"
        onAction={retryFailed}
      />
    )
  }

  return /* form, using product + categories */
}
```

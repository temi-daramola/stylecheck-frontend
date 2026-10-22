# Detail Views — Fetching a Single Resource by ID

Reuses everything already established — `useFetch`, a controller, the
same `isLoading`/`isError` pattern from [Expected Failures](../07-Error-Handling-Patterns/02-ExpectedFailures.PATTERN.md) — with two additions
specific to fetching one resource instead of a list.

**Reading the ID from the URL**, via the router adapter's
`useRouteParams` ([Router Adapter](../04-Adapter-Patterns/03-RouterAdapter.PATTERN.md)), which has not been used in any example until
now:

```js
// modules/invoice/controllers/invoice-detail/useInvoiceDetailController.js
import { useFetch } from "@/adapters/query"
import { useRouteParams } from "@/adapters/router"
import { fetchInvoice } from "@/modules/invoice/services/InvoiceServices"

export const useInvoiceDetailController = () => {
  const { id } = useRouteParams()

  const { data, isLoading, isError, error } = useFetch(["invoice", id], () => fetchInvoice(id))

  return { invoice: data, isLoading, isError, error }
}
```

**"Not found" is not an error — it's a successful response whose payload
is empty.** The backend still resolves with `{ status: "success", message,
data: null }` for a single resource that doesn't exist (or `data: []` for
an empty list) — it never goes through the interceptor's failure path
([HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)) at all, since nothing was rejected. So this is a third branch
sitting alongside loading/error on the *success* path — a plain null/empty
check on `data`, never touching `isError`. Both this branch and the error
branch use `StatusNotify` (`state="empty"` and `state="error"`
respectively), since this is exactly the "empty result or error while
reading data" case it was built for:

```jsx
// modules/invoice/pages/invoice-detail-page/InvoiceDetailPage.jsx
import { StatusNotify } from "@/common/components"
import { useInvoiceDetailController } from "@/modules/invoice/controllers/invoice-detail/useInvoiceDetailController"

export const InvoiceDetailPage = () => {
  const { invoice, isLoading, isError, error } = useInvoiceDetailController()

  if (isLoading) return <div>Loading…</div>
  if (isError) return <StatusNotify state="error" title="Couldn't load invoice" message={error.message} />
  if (!invoice) return <StatusNotify state="empty" title="Invoice not found" />

  return /* render invoice */
}
```

The same reasoning applies to a list: `data.items` resolving to `[]` on a
successful response ([Paginated fetch controller](02-Pagination.PATTERN.md)) is an empty state, not an error state — a
check against the payload's contents, never against `isError`.

# Expected Failures — Services Throw, the Adapter Catches

Services throw on failure — they don't catch or reshape anything
themselves. On success, a service returns the backend's envelope
untouched — it does not unwrap `.data` itself; `get`/`post`/etc. ([HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md))
already resolve with the backend's `{ status, message, data, code, requestId }` directly,
so there's nothing left for the service to strip:

```js
// modules/invoice/services/InvoiceServices.js
import { get } from "@/adapters/http"

export const fetchInvoices = async () => get("/invoices")
```

The service itself doesn't need a `try/catch` — the http adapter's
interceptor ([HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)) already guarantees that on failure, whatever reaches
this file is a rejected promise carrying `{ status, message, data, code, requestId }`
([Failure-Shape Enforcement](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)), so a thrown error here is already in that shape without any
extra work.

The query adapter's `useFetch`/`useSubmit` ([Query Adapter](../04-Adapter-Patterns/04-QueryAdapter.PATTERN.md)) already catch thrown
errors natively — this is a built-in feature of the underlying library, so
nothing extra needs to be built. **`select` ([Query Adapter](../04-Adapter-Patterns/04-QueryAdapter.PATTERN.md)) only ever runs on the
success path** — it unwraps the envelope down to just its `data` field, so
a controller's `data` is already the payload directly. **The error path is
never touched by `select`** — `error` is still the full, untouched
`{ status, message, data, code, requestId }` envelope, exactly as the interceptor produced
it. No custom error type or reshaping happens anywhere in this chain.

Controllers pass this state straight through, same as any other value —
they don't interpret or transform it:

```js
// modules/invoice/controllers/invoice-list/useInvoiceListController.js
export const useInvoiceListController = () => {
  const { data: invoices, isLoading, isError, error } = useFetch(["invoices"], fetchInvoices)
  // ...
  return { invoices, isLoading, isError, error, /* ...rest */ }
}
```

Pages decide how to render an error, using the shared `InlineAlert`
component ([Base UI Component wrapping](../05-UI-Component-Patterns/01-BaseComponentWrapping.PATTERN.md), composed with `status="error"`) so every page is
consistent rather than each one inventing its own markup. Since `error`
is always the full `{ status, message, data, code, requestId }` envelope, `error.message`
is always what should be shown — never a deeper nested path, because the
interceptor already unwrapped it down to that level:

```jsx
// modules/invoice/pages/invoice-list-page/InvoiceListPage.jsx
import { InlineAlert } from "@/common/components"

export const InvoiceListPage = () => {
  const { invoices, isLoading, isError, error } = useInvoiceListController()

  if (isLoading) return <div>Loading…</div>
  if (isError) return <InlineAlert status="error" description={error.message} />

  return /* ... */
}
```

`error.data` follows the same contract — `null` when there's nothing
field-specific to report (e.g. the request never reached the server at
all), or a field-error map on a backend validation failure. This is
exactly what `useForm` ([Form Validation hook](../06-Data-Patterns/11-FormValidationHook.PATTERN.md)) expects `onSubmit` to surface if a
submission fails after client-side validation already passed.

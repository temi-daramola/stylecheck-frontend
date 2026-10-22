# Create — Why It's Different From Update and Delete, and the Full Flow

Update and delete both act on an item already sitting somewhere specific
in the cache, so both can patch that exact spot directly. A newly created
item has no existing position — where it belongs (which page, what sort
order) depends entirely on how the backend orders the list, which the
frontend can't safely guess. So create uses `invalidateQueries` instead
of a manual patch — matching the partial-key mechanism already used
elsewhere ([Query Adapter](../04-Adapter-Patterns/04-QueryAdapter.PATTERN.md), [Update cache logic](08-CacheUpdateAndDelete.PATTERN.md)): it marks every cached page for the resource
stale, but only triggers one real, immediate refetch — whichever page is
currently active/on screen. Every other cached page simply refetches
later, if and when the user actually navigates to it.

```js
// modules/invoice/hooks/useCreateInvoice.js
import { useMutationWithFeedback } from "@/common/hooks"
import { useInvalidate } from "@/adapters/query"
import { createInvoice } from "@/modules/invoice/services/InvoiceServices"

export const useCreateInvoice = () => {
  const invalidate = useInvalidate()

  const { mutateAsync } = useMutationWithFeedback({
    mutationFn: createInvoice,
    successMessage: "Invoice created",
    errorMessage: "Failed to create invoice",
    onSuccessCache: function () {
      invalidate(["invoices"])
    },
  })

  // mutateAsync, not mutate — useForm's handleSubmit (06-Data-Patterns/11-FormValidationHook, full
  // implementation in 02-Architecture-Patterns/) does `await onSubmit(values)`
  // inside a try/catch, which requires a function that returns a genuine
  // promise and rejects on failure. React Query's `mutate` is
  // fire-and-forget and does not behave this way; `mutateAsync` does.
  return mutateAsync
}
```

**Idempotency key — generated once per actual submit, attached as a
header, matching the backend's `Idempotency-Key` middleware (backend
reference, `11-Idempotency-Patterns/01-IdempotencyKeyMiddleware.PATTERN.md`).**
This architecture has no built-in automatic mutation-retry logic, so
every real invocation of `createInvoice` already represents one genuine
user action — a fresh key per call is correct here, no extra
retry-tracking needed. Generated via the existing `uuid` adapter ([UUID Adapter](../04-Adapter-Patterns/06-UuidAdapter.PATTERN.md)),
never `crypto.randomUUID()` called directly:

```js
// modules/invoice/services/InvoiceServices.js
import { post } from "@/adapters/http"
import { generateId } from "@/adapters/uuid"

export const createInvoice = (data) =>
  post("/invoices", data, { headers: { "Idempotency-Key": generateId() } })
```

This key is generated fresh **every time `createInvoice` is called** —
exactly once per real submit, since `useForm`'s `isSubmitting` already
prevents a double-click from calling it twice for the same click ([Form Validation hook](11-FormValidationHook.PATTERN.md)).
A user submitting a second, genuinely new invoice afterward gets a new
key, correctly treated as a new, distinct request by the backend — not
a retry of the first.

**Post-success behavior: stay on the page, form resets, toast confirms
success — no navigation away.** This uses `useForm`'s `resetOnSuccess`
option ([Form Validation hook](11-FormValidationHook.PATTERN.md)), which defaults to
`false` everywhere else (login, edit forms correctly do *not* reset) —
create is the one case that opts in, since the expected next action is
often creating another item, and navigating away would assume that
without knowing it's actually what the user wants.

```js
// modules/invoice/hooks/useInvoiceCreateForm.js
import { createSchema, string, number } from "@/adapters/validation"
import { useForm } from "@/common/hooks"
import { useCreateInvoice } from "@/modules/invoice/hooks/useCreateInvoice"

const invoiceSchema = createSchema({
  clientName: string({ required: "Client name is required" }),
  amount: number({ required: "Amount is required", positive: "Amount must be positive" }),
})

export const useInvoiceCreateForm = () => {
  const createInvoice = useCreateInvoice()

  return useForm({
    initialValues: { clientName: "", amount: "" },
    schema: invoiceSchema,
    onSubmit: createInvoice,
    resetOnSuccess: true,
  })
}
```

The controller and page follow the exact same shape already established
for the login form (Part B of [Worked Example](../02-Architecture-Patterns/11-WorkedExample.PATTERN.md)) — call
the form hook, destructure its return value, wire it to `Input`
components — just pointed at invoice fields instead of email/password.

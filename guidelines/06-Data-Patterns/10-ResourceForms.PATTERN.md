# Resource Create/Edit Form Pattern

This file exists because it sits between two already-documented topics —
reading data with `DataGate` ([Reading & Paginating Data](01-ReadingDataOverview.PATTERN.md)) and create/update mutations ([Mutations](06-MutationsOverview.PATTERN.md)) — and is substantial enough on
its own to need separate treatment: how a create or edit form's *data
needs* determine its loading behavior, and how that stays consistent
across any resource, not just Invoice.

**This file is a construction procedure, not just an explanation.**
Every leaf below states exactly which hooks to call, in what shape, for
that specific scenario — written so a new resource's create/edit page
can be built by following the matching leaf directly, without
re-deriving the reasoning each time.

Read [Reading & Paginating Data](01-ReadingDataOverview.PATTERN.md) (`DataGate`,
`useQueriesTracker`) and [Create flow](09-CreateFlow.PATTERN.md) (the create flow) first — this file
assumes both.

---

## 1. One Page for Both Create and Edit — Not Two

**Default to a single page component handling both create and edit for a
given resource**, distinguished by whether an ID is present — not two
separate page files/controllers. Two route paths point at the same
component:

```jsx
// routes/DashboardRoutes.jsx
<Route path="invoices/new" element={<InvoiceFormPage />} />
<Route path="invoices/:id/edit" element={<InvoiceFormPage />} />
```

**Why this is the default, not just an option:** create and edit already
share the same form component and JSX (§2 below) — `useForm` doesn't
care whether `initialValues` came from blank defaults or fetched data.
Once that's true, maintaining two separate page files/routes/controllers
that both do nothing but assemble slightly different props into the same
form is duplication with no real payoff — one controller that branches
internally on `isEditMode` is both less code and a single place to look,
rather than two files that have to be kept in sync by hand.

**This relies on one confirmed TanStack Query mechanism: a *disabled*
query's `isLoading` is `false`, not `true`.** When `enabled: false` is
passed to `useFetch`, the query's `isPending` stays permanently `true`
(it never resolves), but `isFetching` is `false` (nothing is actually
happening) — and since `isLoading` is defined as `isPending &&
isFetching`, it correctly evaluates to `false` for a disabled query. This
is exactly the flag this architecture has used throughout (never
`isPending`), so a disabled resource-fetch in create mode naturally
reports "not loading," with zero special-casing required anywhere.

---

## 2. The Shared Form Component

```jsx
// modules/invoice/components/InvoiceForm.jsx — shared by BOTH create and edit
import { useForm } from "@/common/hooks"
import { createSchema, string, number } from "@/adapters/validation"
import { Input, Select } from "@/common/components"

const invoiceSchema = createSchema({
  clientName: string({ required: "Client name is required" }),
  amount: number({ required: "Amount is required", positive: "Amount must be positive" }),
})

export const InvoiceForm = ({ initialValues, onSubmit, submitLabel, resetOnSuccess = false, clients }) => {
  const { values, errors, formError, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues,
    schema: invoiceSchema,
    onSubmit,
    resetOnSuccess,
  })

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div>{formError}</div>}
      <Input
        label="Client name"
        invalid={!!errors.clientName}
        error={errors.clientName}
        value={values.clientName}
        onChange={(e) => handleChange("clientName", e.target.value)}
      />
      {clients && (
        <Select
          items={clients}
          label="Client"
          value={values.clientId}
          onValueChange={(d) => handleChange("clientId", d.value)}
        />
      )}
      <button type="submit" disabled={isSubmitting}>{submitLabel}</button>
    </form>
  )
}
```

`clients` is optional — present when supporting data was loaded for this
render; absent otherwise. The form component doesn't know or care
whether it's currently being used for create or edit — that decision was
already made by the controller feeding its props.

---

## 3. The Controller — One Hook, Branches Internally on `isEditMode`

The controller's job is unchanged from what [What Goes Where](../02-Architecture-Patterns/04-ModulePublicApi.PATTERN.md) already defines it as —
compose hooks, shape a return value for the page. **This is not a new
kind of file.** What's specific to this pattern: it takes an optional
`id`, and every field it returns is computed based on whether `id` is
present.

```js
// modules/invoice/controllers/invoice-form/useInvoiceFormController.js
export const useInvoiceFormController = (id) => {
  const isEditMode = !!id

  const invoiceQuery = useFetch(["invoice", id], () => fetchInvoice(id), { enabled: isEditMode })
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  return {
    isLoading: isEditMode ? invoiceQuery.isLoading : false,
    isError: isEditMode ? invoiceQuery.isError : false,
    error: invoiceQuery.error,
    onRetry: invoiceQuery.refetch,
    initialValues: isEditMode ? invoiceQuery.data : { clientName: "", amount: "" },
    onSubmit: isEditMode ? updateInvoice : createInvoice,
    submitLabel: isEditMode ? "Save Changes" : "Create Invoice",
    resetOnSuccess: !isEditMode,
  }
}
```

```jsx
// modules/invoice/pages/invoice-form-page/InvoiceFormPage.jsx
import { DataGate } from "@/common/components"
import { InvoiceForm } from "@/modules/invoice/components/InvoiceForm"
import { useInvoiceFormController } from "@/modules/invoice/controllers/invoice-form/useInvoiceFormController"
import { useRouteParams } from "@/adapters/router"

export const InvoiceFormPage = () => {
  const { id } = useRouteParams()
  const controller = useInvoiceFormController(id)

  return (
    <DataGate isLoading={controller.isLoading} isError={controller.isError} error={controller.error} onRetry={controller.onRetry} skeletonType="form">
      <InvoiceForm
        initialValues={controller.initialValues}
        onSubmit={controller.onSubmit}
        submitLabel={controller.submitLabel}
        resetOnSuccess={controller.resetOnSuccess}
      />
    </DataGate>
  )
}
```

**In create mode, `DataGate` still wraps everything — nothing new
happens inside it.** `isLoading`/`isError` are hardcoded `false` when
there's no `id`, so `DataGate` evaluates its ordinary "ready" branch on
the very first render and passes straight through to the form. This is
the same pass-through behavior `DataGate` already has whenever data
happens to already be ready — not a new case added to `DataGate` for
create mode specifically.

---

## 4. The Full Construction Procedure — All 13 Leaves, Same Page and Controller Shape

Every leaf below uses the exact same page (`InvoiceFormPage`) and the
exact same controller **shape** — what changes per leaf is only how many
`useFetch` calls the controller makes internally, and whether
`useQueriesTracker` is needed. Build a new resource's create/edit page by
finding the matching leaf and following its controller shape.

### Create — 5 Leaves (`id` is `undefined`, so `invoiceQuery` above is
disabled; everything below is ADDITIONAL supporting data beyond that)

**Leaf C1 — No supporting data needed.** Controller is exactly as shown
in §3 — the disabled `invoiceQuery` costs nothing (confirmed §1),
`isLoading`/`isError` are hardcoded `false`. Form renders immediately.

**Leaf C2 — Supporting data, ONE query.** Add one more `useFetch` to the
controller, folded into the same return shape (still no tracker needed,
since there's still only one *active* query — the disabled resource
query doesn't count):
```js
export const useInvoiceFormController = (id) => {
  const isEditMode = !!id
  const invoiceQuery = useFetch(["invoice", id], () => fetchInvoice(id), { enabled: isEditMode })
  const clientsQuery = useFetch(["clients"], fetchClients)
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  return {
    isLoading: isEditMode ? invoiceQuery.isLoading : clientsQuery.isLoading,
    isError: isEditMode ? invoiceQuery.isError : clientsQuery.isError,
    error: isEditMode ? invoiceQuery.error : clientsQuery.error,
    onRetry: isEditMode ? invoiceQuery.refetch : clientsQuery.refetch,
    initialValues: isEditMode ? invoiceQuery.data : { clientName: "", amount: "" },
    clients: clientsQuery.data,
    onSubmit: isEditMode ? updateInvoice : createInvoice,
    submitLabel: isEditMode ? "Save Changes" : "Create Invoice",
    resetOnSuccess: !isEditMode,
  }
}
```

**Leaf C3 — Same as C2.** Whether `clientsQuery` resolves instantly
(cached) or needs a real fetch is decided by React Query itself — the
controller is identical either way.

**Leaf C4 — Supporting data, MULTIPLE queries.** Now there are genuinely
two-or-more *active* queries in create mode (the resource query is still
disabled and doesn't count), so `useQueriesTracker` combines them:
```js
export const useInvoiceFormController = (id) => {
  const isEditMode = !!id
  const invoiceQuery = useFetch(["invoice", id], () => fetchInvoice(id), { enabled: isEditMode })
  const clientsQuery = useFetch(["clients"], fetchClients)
  const categoriesQuery = useFetch(["categories"], fetchCategories)
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  const supportingQueries = useMemo(() => [
    { query: clientsQuery, name: "clients" },
    { query: categoriesQuery, name: "categories" },
  ], [clientsQuery, categoriesQuery])
  const supportingTracker = useQueriesTracker(supportingQueries, "clients")

  return {
    isLoading: isEditMode ? invoiceQuery.isLoading : supportingTracker.isLoading,
    isError: isEditMode ? invoiceQuery.isError : supportingTracker.isError,
    error: isEditMode ? invoiceQuery.error : supportingTracker.resolvedError,
    onRetry: isEditMode ? invoiceQuery.refetch : supportingTracker.retryFailed,
    initialValues: isEditMode ? invoiceQuery.data : { clientName: "", amount: "" },
    clients: clientsQuery.data,
    categories: categoriesQuery.data,
    onSubmit: isEditMode ? updateInvoice : createInvoice,
    submitLabel: isEditMode ? "Save Changes" : "Create Invoice",
    resetOnSuccess: !isEditMode,
  }
}
```

**Leaf C5 — Same as C4.** Individual query cache state is never branched
on in code, same principle as every other leaf.

### Edit — 8 Leaves (`id` is present, so `invoiceQuery` above is active)

**Leaf E1 — No supporting data.** Controller is exactly as shown in §3 —
`invoiceQuery` is the only active query, its state used directly.

**Leaves E2 and E3 — Supporting data is ONE query.** Same controller as
Leaf C2 above (the shape is identical regardless of create/edit — only
`isEditMode` flips which query's state feeds `isLoading`/`isError`).
Whether the resource, the supporting query, both, or neither happen to
already be cached is never distinguished in code.

**Leaves E4 and E5 — Supporting data is MULTIPLE queries.** Same
controller as Leaf C4 above.

**Leaves E6, E7, E8 — Same as E1/E2–E3/E4–E5,** just with a real,
uncached fetch for the resource instead of an already-cached one.
`DataGate` simply shows visible loading longer — nothing about how the
controller or page is *written* changes. This is the direct, confirmed
consequence of the placeholder-data/cache research already documented
(`pagination-state-research.md` used the same underlying mechanism,
applied there to page transitions rather than resource detail fetches).

---

## 5. The Actual Takeaway

**There are only 3 distinct controller shapes, not 13** — the 13 leaves
describe 13 distinct *runtime behaviors* (how long loading shows,
whether it shows at all), but only 3 require different *code*, and all 3
live inside **one** controller for a given resource, selected by
`isEditMode`/`enabled`, not spread across separate create/edit files:

1. **No active supporting query** — resource query's own state (disabled
   and inert in create mode; live in edit mode) drives `DataGate`
   directly.
2. **Exactly one active supporting query alongside it** — that query's
   own state drives `DataGate` in create mode; the resource query's state
   drives it in edit mode. No tracker needed either way.
3. **Two or more active queries at once** (multiple supporting queries in
   create mode, or the resource plus any supporting data in edit mode) —
   `useQueriesTracker` combines them.

Whether any individual fetch resolves instantly (cached) or takes real
time is **never** branched on in controller or page code — it's entirely
React Query's own cache and `enabled`-flag behavior, invisible to this
layer. One page, one controller, one route pair (`/new` and `/:id/edit`
both pointing at it) per resource — not two of each.

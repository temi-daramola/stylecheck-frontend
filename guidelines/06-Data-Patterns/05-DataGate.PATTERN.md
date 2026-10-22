# `DataGate` — Reusable Initial-Load Gate for Any Resource

Distinct from `PaginatedView` ([`PaginatedView`](02-Pagination.PATTERN.md)), which owns page-to-page
transitions on an already-loading list — `DataGate` owns a page's
**initial** load only: loading → error → ready, once, before any real
content exists. Used for list pages, detail pages, and form pages alike,
so this three-state branching isn't hand-rolled fresh on every page.

```jsx
// common/components/FormSkeleton.jsx
import { Stack, SimpleGrid } from "@chakra-ui/react"
import { Skeleton } from "./Skeleton"

export const FormSkeleton = () => (
  <Stack gap="4">
    <Skeleton height="9" />
    <Skeleton height="12" />
    <Skeleton height="12" />
    <SimpleGrid columns={2} gap="4">
      <Skeleton height="12" />
      <Skeleton height="12" />
    </SimpleGrid>
    <Skeleton height="5" width="30%" />
  </Stack>
)
```

```jsx
// common/components/TableSkeleton.jsx
import { Stack } from "@chakra-ui/react"
import { Skeleton } from "./Skeleton"

export const TableSkeleton = ({ rows = 6 }) => (
  <Stack gap="3">
    <Skeleton height="10" />
    {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} height="13" />)}
  </Stack>
)
```

```jsx
// common/components/CardSkeleton.jsx
import { SimpleGrid } from "@chakra-ui/react"
import { Skeleton } from "./Skeleton"

export const CardSkeleton = ({ count = 6 }) => (
  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
    {Array.from({ length: count }).map((_, i) => <Skeleton key={i} height="40" rounded="md" />)}
  </SimpleGrid>
)
```

```jsx
// common/components/DataGate.jsx
import { FormSkeleton } from "./FormSkeleton"
import { TableSkeleton } from "./TableSkeleton"
import { CardSkeleton } from "./CardSkeleton"
import { StatusNotify } from "./StatusNotify"

const SKELETONS_BY_TYPE = { form: FormSkeleton, table: TableSkeleton, card: CardSkeleton }

export const DataGate = ({
  isLoading,
  isError,
  error,
  errorTitle = "Something went wrong",
  onRetry,
  skeletonType,
  customLoadingView,
  children,
}) => {
  if (isLoading) {
    if (customLoadingView) return customLoadingView
    const SkeletonComponent = SKELETONS_BY_TYPE[skeletonType]
    return SkeletonComponent ? <SkeletonComponent /> : null
  }

  if (isError) {
    return (
      <StatusNotify
        state="error"
        title={errorTitle}
        message={error?.message}
        actionLabel={onRetry ? "Try again" : undefined}
        onAction={onRetry}
      />
    )
  }

  return children
}
```

**Critical mechanism this relies on: `DataGate` gates *mounting*, not
just rendering.** Whatever is passed as `children` is only constructed by
React — meaning any hooks inside it, including `useForm`, only get
called — once `DataGate` has already passed the loading/error checks.
This is what makes it safe for a form component to call `useForm` with
data straight from props, with no null-checking or "is this ready yet"
logic inside the form itself — by the time it exists at all, the data is
guaranteed present. [Resource Create/Edit Form Pattern](10-ResourceForms.PATTERN.md) depends
entirely on this mechanism.

**List page usage — wraps around `PaginatedView`:**
```jsx
<DataGate isLoading={isLoading} isError={isError} error={error} onRetry={retry} skeletonType="table">
  <PaginatedView {...paginationProps} onNext={nextPage} onPrev={prevPage} onRetry={retry}>
    <InvoiceTable invoices={invoices} />
  </PaginatedView>
</DataGate>
```
By the time `PaginatedView` renders here, `isLoading`/`isError` on that
query are already guaranteed `false` — `DataGate` already gated on them.
`PaginatedView`'s own `isError` handling stays fully alive for a
*separate, later* event (a mid-pagination page fetch failing, [`PaginatedView`](02-Pagination.PATTERN.md)) —
unaffected by this wrapping.

**Detail/form page usage — see [Resource Create/Edit Form Pattern](10-ResourceForms.PATTERN.md)
for the full construction procedure**, covering every combination of
single/multiple queries and `useQueriesTracker` composition.

# Update & Delete — Cache Strategies

## Why Update and Delete Need Different Cache Logic

**Update changes nothing about position or count.** The item being
edited is exactly where it already was in the list — only its contents
changed. No other item moves, the total count stays the same. This means
updating the cache is a direct, one-item swap — no shifting required.

**Delete changes both the count and the position of every item after
it.** Removing an item shifts everything that came after it earlier by
one slot — an item that used to be first on the next page may now belong
on the current page. This means deleting requires walking forward through
however many pages are already cached and shifting each one, not just a
single swap.

Because these are genuinely different operations, they are two separate
functions in the adapter — not one function trying to handle both cases.

## Update — `useUpdateItemInPaginatedCache`

```js
// adapters/query/index.js — addition
export const useUpdateItemInPaginatedCache = () => {
  const queryClient = useQueryClient()

  const updateItemInCache = (baseKey, updatedItem) => {
    // Matches every cached page for this resource using a PARTIAL key
    // (e.g. ["invoices"] matches ["invoices", { page: 1 }], page 2,
    // etc. — same partial-matching mechanism as useInvalidate). Only the
    // one page that actually contains this item gets changed; every
    // other page is returned completely untouched.
    queryClient.setQueriesData({ queryKey: [baseKey] }, function (existingPageData) {
      if (!existingPageData) {
        return existingPageData
      }

      const itemExistsOnThisPage = existingPageData.items.some(function (item) {
        return item.id === updatedItem.id
      })

      if (!itemExistsOnThisPage) {
        return existingPageData
      }

      const updatedItems = existingPageData.items.map(function (item) {
        if (item.id === updatedItem.id) {
          return updatedItem
        }
        return item
      })

      return {
        ...existingPageData,
        items: updatedItems,
      }
    })
  }

  return updateItemInCache
}
```

## Delete — `useShiftPaginatedCacheAfterDelete`

Removes the deleted item from the page it was actually on, then walks
forward through every subsequent page that is **already cached**, each
page borrowing the first item from the next page to stay full — so no
page is left one item short, and no page shows a stale item. The moment
this reaches a page that has never been loaded into the cache, it stops —
that page was always going to need a real request the first time it's
opened regardless, so nothing is lost by not trying to patch it in
advance.

```js
// adapters/query/index.js — addition
export const useShiftPaginatedCacheAfterDelete = () => {
  const queryClient = useQueryClient()

  const shiftPagesAfterDelete = (baseKey, deletedPage, deletedItemId) => {
    // STEP 1 — Remove the deleted item from the page it was actually on.
    const deletedPageKey = [baseKey, { page: deletedPage }]

    queryClient.setQueryData(deletedPageKey, function (existingPageData) {
      if (!existingPageData) {
        return existingPageData
      }

      const itemsWithDeletedItemRemoved = existingPageData.items.filter(function (item) {
        return item.id !== deletedItemId
      })

      return {
        ...existingPageData,
        items: itemsWithDeletedItemRemoved,
        totalCount: existingPageData.totalCount - 1,
      }
    })

    // STEP 2 — Walk forward through every page AFTER the deleted page,
    // one at a time, each borrowing the first item from the next page.
    let currentPageNumber = deletedPage

    while (true) {
      const nextPageNumber = currentPageNumber + 1
      const nextPageKey = [baseKey, { page: nextPageNumber }]

      // Reading directly from the cache — does NOT trigger a network
      // request, only checks what's already stored in memory.
      const nextPageData = queryClient.getQueryData(nextPageKey)

      // Nothing cached for the next page — stop. Every page from here
      // forward loads normally, correctly, whenever it's first opened.
      if (!nextPageData) {
        break
      }

      const itemBorrowedFromNextPage = nextPageData.items[0]
      const nextPageRemainingItems = nextPageData.items.slice(1)
      const currentPageKey = [baseKey, { page: currentPageNumber }]

      // Current page gets the borrowed item appended, becoming full again.
      queryClient.setQueryData(currentPageKey, function (existingCurrentPageData) {
        return {
          ...existingCurrentPageData,
          items: existingCurrentPageData.items.concat([itemBorrowedFromNextPage]),
        }
      })

      // Next page loses the item it just gave away, and its own total
      // count drops by one, since that item now belongs to the previous
      // page instead.
      queryClient.setQueryData(nextPageKey, function (existingNextPageData) {
        return {
          ...existingNextPageData,
          items: nextPageRemainingItems,
          totalCount: existingNextPageData.totalCount - 1,
        }
      })

      // Continue the chain — what was "next" becomes "current" for the
      // next loop iteration.
      currentPageNumber = nextPageNumber
    }
  }

  return shiftPagesAfterDelete
}
```

```js
// adapters/index.js
export * as http from "./http"
export * as router from "./router"
export * as query from "./query"
export * as validation from "./validation"
export * as uuid from "./uuid"
export * as notifications from "./notifications"
```

**If the deleted item was the last one on the last page**, `usePagination`
([`usePagination`](02-Pagination.PATTERN.md)) automatically corrects the current page once the resulting lower
`totalCount` flows through — `setQueryData` re-renders any component
subscribed to that query key, which recalculates `totalPages`, which
triggers `usePagination`'s own effect to move the user back to the last
valid page. No mutation-specific handling was needed for this — it falls
out naturally from `usePagination` reacting to a real count change,
regardless of what caused it.

## Module-Level Hooks — Delete and Update, Invoice Example

Each module hook supplies only what's specific to that resource — which
service to call, and how to update the cache — delegating the mutation
lifecycle and feedback entirely to `useMutationWithFeedback`.

```js
// modules/invoice/hooks/useDeleteInvoice.js
import { useMutationWithFeedback } from "@/common/hooks"
import { useShiftPaginatedCacheAfterDelete } from "@/adapters/query"
import { deleteInvoice } from "@/modules/invoice/services/InvoiceServices"

export const useDeleteInvoice = (currentPage) => {
  const shiftPagesAfterDelete = useShiftPaginatedCacheAfterDelete()

  return useMutationWithFeedback({
    mutationFn: deleteInvoice,
    successMessage: "Invoice deleted",
    errorMessage: "Failed to delete invoice",
    onSuccessCache: function (response, deletedInvoiceId) {
      // deletedInvoiceId here is whatever was passed INTO the mutation
      // (the "variables") — the ID the delete action sent.
      shiftPagesAfterDelete("invoices", currentPage, deletedInvoiceId)
    },
  })
}
```

**Confirmation before delete — the page level, using `useConfirm` +
`ConfirmDialog` (`05-UI-Component-Patterns/`).** The
delete mutation itself never fires until the user has actually confirmed
— `deleteInvoice` (the mutate function `useDeleteInvoice` returns) is
only called inside the `if (confirmed)` branch, after `confirm()`'s
promise resolves:

```jsx
// modules/invoice/pages/invoice-list-page/InvoiceListPage.jsx
import { ConfirmDialog } from "@/common/components"
import { useConfirm } from "@/common/hooks"
import { useDeleteInvoice } from "@/modules/invoice/hooks/useDeleteInvoice"

export const InvoiceListPage = () => {
  const { currentPage } = usePagination() // from the controller, simplified here
  const { confirm, isOpen, title, message, handleConfirm, handleCancel } = useConfirm()
  const deleteInvoice = useDeleteInvoice(currentPage)

  const handleDeleteClick = async (invoiceId) => {
    const confirmed = await confirm({
      title: "Delete invoice?",
      message: "This action cannot be undone.",
    })
    if (confirmed) deleteInvoice(invoiceId)
  }

  return (
    <>
      {/* ...table, rows each calling handleDeleteClick(invoice.id)... */}
      <ConfirmDialog
        isOpen={isOpen}
        title={title}
        message={message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmLabel="Delete"
        isDestructive
      />
    </>
  )
}
```

```js
// modules/invoice/hooks/useUpdateInvoice.js
import { useMutationWithFeedback } from "@/common/hooks"
import { useUpdateItemInPaginatedCache } from "@/adapters/query"
import { updateInvoice } from "@/modules/invoice/services/InvoiceServices"

export const useUpdateInvoice = () => {
  const updateItemInCache = useUpdateItemInPaginatedCache()

  return useMutationWithFeedback({
    mutationFn: updateInvoice,
    successMessage: "Invoice updated",
    errorMessage: "Failed to update invoice",
    onSuccessCache: function (response) {
      // response is the update endpoint's own { status, message, data, code, requestId }
      // envelope — the backend returns the fresh, updated invoice inside
      // .data, which is what gets written into the cache.
      const updatedInvoice = response.data
      updateItemInCache("invoices", updatedInvoice)
    },
  })
}
```

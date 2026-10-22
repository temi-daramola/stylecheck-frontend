# `useMutationWithFeedback` — Runs the Mutation, Delegates Everything Else

Lives in `common/hooks/`. Its only job: run the mutation via `useSubmit`
([Query Adapter](../04-Adapter-Patterns/04-QueryAdapter.PATTERN.md)), call whatever cache-update function it's handed (different for
update vs. delete — see [Why Update and Delete Need Different Cache Logic](08-CacheUpdateAndDelete.PATTERN.md)), and show a toast. It has no idea how
caching actually works internally — that's deliberate, since different
kinds of mutations need different cache logic, and this hook shouldn't
need to know the difference.

**Message precedence for the toast — the backend's own message always
wins.** Every response (success or failure) is already the `{ status,
message, data }` envelope established in [HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md) — so `response.message`
(success) and `error.message` (failure) are already the backend's real,
intended message, exactly as used everywhere else in these patterns. A
module's `successMessage`/`errorMessage` are only ever a **fallback**,
used solely if the backend genuinely didn't provide a message.

```js
// common/hooks/useMutationWithFeedback.js
import { useSubmit } from "@/adapters/query"
import { notifySuccess, notifyError } from "@/adapters/notifications"

export const useMutationWithFeedback = ({
  mutationFn,
  onSuccessCache,
  successMessage,
  errorMessage,
}) => {
  return useSubmit(mutationFn, {
    onSuccess: function (response, variables) {
      if (onSuccessCache) {
        onSuccessCache(response, variables)
      }

      // Precedence: backend's own message first, module's fallback
      // second, generic default last.
      const messageToShow = response?.message || successMessage || "Success."
      notifySuccess(messageToShow)
    },
    onError: function (error) {
      const messageToShow =
        error?.message || errorMessage || "Something went wrong. Please try again."
      notifyError(messageToShow)
    },
  })
}
```

```js
// common/hooks/index.js
export { useForm } from "./useForm"
export { usePagination } from "./usePagination"
export { useQueriesTracker } from "./useQueriesTracker"
export { useMutationWithFeedback } from "./useMutationWithFeedback"
```

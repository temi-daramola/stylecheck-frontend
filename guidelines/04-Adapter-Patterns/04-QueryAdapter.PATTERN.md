# Query Adapter (React Query / TanStack Query)

The same wrapping principle applies identically to hook-based libraries.
The adapter holds both the shared client/instance setup and your own
wrapping hooks around the library's raw hooks.

```js
// adapters/query/index.js
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query"

// One client instance, created once, lives here — not scattered across
// the app. Default caching behavior is set once, globally, here — see
// the reasoning below. Individual useFetch calls can still override any
// of these via their own options when a specific case genuinely needs
// something different.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 1,
    },
  },
})

export { QueryClientProvider }

export const useFetch = (key, fn, options = {}) => {
  const { keepPrevious, ...rest } = options
  return useQuery({
    queryKey: key,
    queryFn: fn,
    // The backend always resolves with { status, message, data, code, requestId } — see
    // 04-Adapter-Patterns/02-HttpAdapter. Reads only ever need the payload, so it's unwrapped once,
    // here, via React Query's own `select` — no controller ever repeats
    // this unwrap itself. `select` only ever runs on the SUCCESS path;
    // it has no effect on `error`, which stays the full, untouched
    // envelope — see 07-Error-Handling-Patterns/01-ErrorHandlingOverview.
    select: (response) => response.data,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    ...rest,
  })
}

export const useSubmit = (fn, options) =>
  useMutation({ mutationFn: fn, ...options })

export const useInvalidate = () => {
  const client = useQueryClient()
  return (key) => client.invalidateQueries({ queryKey: key })
}

// Wipes the entire query cache — every resource, every page, everything.
// Used specifically on logout (see whichever auth pattern file is active
// 02-Architecture-Patterns/05-CommonFolderRules), so no data from the previous session can flash on screen if a
// different user logs in right after on the same browser.
export const useClearCache = () => {
  const client = useQueryClient()
  return () => client.clear()
}
```

**Caching defaults, and why:**

- **`staleTime: 30s`** — how long data is considered fresh before a
  refetch is even considered. Long enough to avoid redundant requests
  when a user quickly navigates back and forth; short enough that data
  doesn't feel stale in an app where records can change.
- **`refetchOnWindowFocus`** — left at the library's own default (`true`,
  not overridden here). This only actually triggers a request if data is
  already past `staleTime`, so it doesn't conflict with the
  no-wasted-requests principle held throughout this architecture — it's
  a correctness win (catching up on changes made elsewhere while a tab
  was inactive) at effectively no extra cost given a sensible
  `staleTime`.
- **`retry: 1`** (library default is `3`, with exponential backoff) —
  turned down deliberately, because this architecture already has
  explicit, visible retry mechanisms everywhere (`InlineAlert`'s retry,
  `PaginatedView`'s retry, `ProtectedRoute`'s auto-login retry). A high
  silent-retry count means the user waits through several invisible
  attempts before ever seeing those retry UIs at all — working against
  the UX already built, not supporting it.
- **`gcTime`** (formerly `cacheTime`) — left at the library default (5
  minutes), intentionally not overridden. Worth flagging specifically
  because it affects the delete cascading-shift logic ([Delete cache logic](../06-Data-Patterns/08-CacheUpdateAndDelete.PATTERN.md)) — too short a `gcTime` would
  mean "borrow from the next cached page" finds nothing to borrow from
  more often, even for recently-visited pages.

**A known, real limitation — stated honestly, not silently assumed
away.** None of the settings above correct an open tab when *someone
else, elsewhere* changes the data it's showing. `refetchOnWindowFocus`
only fires on refocus; nothing watches for a change while a tab stays in
view the whole time. A tab can sit there confidently showing a value
that's no longer true, until something eventually triggers a re-check.
The backend's own cache has the equivalent gap closed by event-driven
invalidation (`10-Caching-Patterns/02-CacheInvalidation.PATTERN.md`) —
nothing on the frontend plays that same role today.

**`refetchInterval` is the targeted fix — a per-query opt-in, never a
global default.** It tells React Query to quietly re-check a specific
query on a timer while it's active, independent of focus or navigation:

```js
useFetch(["invoice", id], () => fetchInvoice(id), { refetchInterval: 15_000 })
```

**Which resources actually warrant this uses the exact same two-axis
test already established for backend caching**
(`10-Caching-Patterns/01-CacheAsideStrategy.PATTERN.md`'s "Classifying
Data" section) — not a separate, frontend-only judgment call. Ask the
same two questions: how often would someone realistically be viewing
this while someone else changes it, and does it actually matter if they
don't find out immediately. For most resources, the honest answer is
leave `refetchInterval` off — the existing defaults already self-correct
within a reasonable window, and the odds of a real collision are low
enough that adding constant background polling isn't worth it. Turn it
on specifically for resources landing in the same "moderate-to-frequent
change, high stakes" territory the backend grid already flags as needing
extra care — e.g. a payment status someone might be watching live while
someone else processes it. For anything landing further into "changes
constantly, high stakes" — true real-time cases — `refetchInterval`
itself stops being enough, for the same reason a short TTL stops being
enough on the backend; that's a sign to reach for an actual push
mechanism (WebSockets/SSE) instead, not a shorter interval.

`keepPrevious: true` (opt-in per call, not a global default) keeps the
**previous** query's resolved data visible as `data` while a new request
for a different key (e.g. the next page) is in flight, instead of `data`
briefly going back to `undefined`. `isFetching` still flips to `true`
during that window — this is what a paginated view ([Reading & Paginating Data](../06-Data-Patterns/01-ReadingDataOverview.PATTERN.md)) uses to
dim/disable itself without ever flashing to a blank state.

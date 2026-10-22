# Error Handling — Overview

Two distinct kinds of failure are handled differently: **expected
failures** (an API call fails) and **unexpected failures** (a bug throws
during render).

## Summary

| Failure type | Caught by | Shaped by | Rendered by |
|---|---|---|---|
| Expected (API error) | Query adapter (`useFetch`/`useSubmit`), native to the library | HTTP adapter's interceptor ([HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)) — guarantees `{ status, message, data, code, requestId }` on every failure, whether the backend responded or not | Page, via the shared `InlineAlert` component, `status="error"` |
| Unexpected (render crash) | One `ErrorBoundary` per layout, wrapping `<Outlet />` | N/A | The boundary's own fallback UI |

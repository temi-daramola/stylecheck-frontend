# Adapters — Wrapping Third-Party Libraries (solves Problem 4)

Every third-party library — both small utility libraries (yup, uuid,
axios) and framework-level or hook-based libraries (react-router,
react-query) — is only ever imported inside `adapters/`. No file outside
`adapters/` imports a third-party library directly. An adapter exposes
**your own** function names, not a pass-through of the library's API, so
the library can be swapped later without touching every consumer.

**All adapters use named exports** (`export const get = ...`), never a
single default-exported object (`const http = { get, post }; export
default http`). This keeps every adapter consistent with the module
boundary convention in [Module Public API Pattern](../02-Architecture-Patterns/04-ModulePublicApi.PATTERN.md) and with editor/bundler tooling — even though,
unlike a module, an adapter has no "deeper path" for the VS Code
auto-import problem in [Enforcing the Boundary](../02-Architecture-Patterns/06-BoundaryEnforcement.PATTERN.md) to leak through, named exports are still used
everywhere for consistency, so the whole codebase has exactly one export
convention rather than two.

**Eight adapters exist in this architecture:**

| Adapter | Wraps | Pattern file |
|---|---|---|
| `http` | axios — requests, interceptors, the `{ status, message, data, code, requestId }` shape contract | [HTTP Adapter](02-HttpAdapter.PATTERN.md) |
| `router` | react-router-dom — navigation, params, location, query params | [Router Adapter](03-RouterAdapter.PATTERN.md) |
| `query` | TanStack Query — fetching, caching, pagination support, mutations | [Query Adapter](04-QueryAdapter.PATTERN.md) |
| `validation` | yup — schema building and validation | [Validation Adapter](05-ValidationAdapter.PATTERN.md) |
| `uuid` | uuid — ID generation | [UUID Adapter](06-UuidAdapter.PATTERN.md) |
| `notifications` | sonner — toasts | [Notifications Adapter](07-NotificationsAdapter.PATTERN.md) |
| `storage` | `localStorage` — not third-party, wrapped for consistency | [Storage Adapter](08-StorageAdapter.PATTERN.md) |
| `icons` | `react-icons` — own generic export names, never the icon's real name | [Icons Adapter](09-IconsAdapter.PATTERN.md) |

Each adapter has its own file in this category (see the table above) — including the HTTP adapter's interceptor and the `{ status, message, data, code, requestId }` shape contract that every other layer of this architecture relies on ([HTTP Adapter](02-HttpAdapter.PATTERN.md)).

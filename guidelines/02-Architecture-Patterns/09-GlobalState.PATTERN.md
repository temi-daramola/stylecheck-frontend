# Global / App-Wide State

For state that's genuinely needed everywhere (current user, auth status,
theme) — not per-module state — this architecture uses **React Context,
one context per resource/domain, mounted once at the application level,
always fully memoized.** This is a specific, deliberately chosen pattern,
not the default/naive way to use Context.

**Session expiry, auto-login, and the `ProtectedRoute`/`GuestRoute`
guards** — which extend the auth resource covered here — are fully
documented separately in the auth pattern files (see [Auth Pattern Selection](../08-Authentication-Patterns/01-FrontendAuthSelection.PATTERN.md)), since
they're substantial enough to warrant their own file, same reasoning as
the adapters and data-operations splits.

## The Required Pattern: Multiple Contexts, Fully Memoized

| Approach | All subscribers re-render on any state change? | Used here? |
|---|---|---|
| Single context, namespaced, no memo | Yes — always | ❌ No |
| Single context, namespaced, `useMemo` only | Yes — memo still recomputes on real changes | ❌ No |
| Multiple contexts, no memo | Yes — parent re-renders cascade into every provider | ❌ No |
| **Multiple contexts, `useMemo` + `useCallback`** | **No — only subscribers of the resource that changed** | **✅ Yes — required** |

Namespacing state into one shared object is purely a code-organization
choice — it does nothing for performance, because Context only compares
"is this the same reference as last time," not which part of an object
actually changed. Splitting into multiple contexts without memoization
doesn't help either, since an unmemoized value is a fresh reference every
render regardless. Only separate contexts, each with a `useMemo`'d value
(dependencies = that resource's real state) and `useCallback`'d functions,
give genuine isolation.

## Where Logic Lives vs. Where State Lives

A resource with app-level state (e.g. auth) is still a full module —
`modules/auth/`, with its own `pages/`, `controllers/`, `hooks/`,
`services/`, following every rule in [Module Public API Pattern](04-ModulePublicApi.PATTERN.md). The `application/` layer is
**not** a place to write business logic. Its only job is to hold the piece
of state that must survive across the whole app's lifetime and expose it
via Context.

- **Pure logic** (API calls, validation) → lives in the module's
  `services/`, as plain functions, no React.
- **The shared, persisted state itself** → lives in `application/<resource>/`,
  as a hook that owns the `useState` and calls the module's pure functions
  to do the actual work, plus a provider that memoizes and exposes it.

## The Dependency Must Stay One-Directional

`application/` may import only **stateless, pure functions** from a
module (services, validators, formatters) — never hooks, controllers, or
components. A module may import its own shared state back from
`application/` via that resource's exposed hook (e.g. `useAuth()`), like
any other consumer.

```js
// ✅ application sources pure logic from the module
import { loginRequest } from "@/modules/auth"

// ✅ module consumes its own shared state via application
import { useAuth } from "@/application"

// ❌ application importing a hook/component from a module — risks a cycle
import { useLoginController } from "@/modules/auth"
```

If this weren't one-directional: a module calling its own logic hook
directly instead of going through `application` would create a second,
disconnected copy of that state — not the shared instance the rest of the
app reads — which is a functional bug, not just a structural
inconsistency.

The full auth example (module + `application/auth` + the one-directional
wiring, in real code) is in [Worked Example](../02-Architecture-Patterns/11-WorkedExample.PATTERN.md).

## Known Limitation: Per-Context, Not Per-Field, Isolation

[The Required Pattern: Multiple Contexts, Fully Memoized](09-GlobalState.PATTERN.md)'s pattern isolates re-renders **between** resources, not **within**
one resource's context. If a resource's context value holds multiple
independently-changing fields, a component subscribed to that context
re-renders on any of them changing, even ones it doesn't read. This is not
a misconfiguration — it's the ceiling of what Context's subscription model
supports; a component subscribes to a whole value or nothing.

**Do not put React Query (or other request-based) data inside a Context
value.** Every background refetch/invalidation would become a `useMemo`
dependency change, re-rendering that resource's entire context on fetch
activity. Server data should be read directly via the query adapter's
hooks wherever it's needed; a resource's Context value should hold only
non-request, app-lifecycle-persisted state (selected IDs, UI flags, view
state).

## If a Resource Outgrows This

If profiling shows a specific resource's context is causing real
unnecessary re-renders because of the per-field ceiling above, in
increasing order of cost: split that resource's context further per field;
wrap expensive downstream children in `React.memo`; or introduce a
selector-based Context wrapper library.

**This architecture does not use a dedicated state management library
(Redux, Zustand, Jotai, etc.) for app-level state by default.** The
resource-scoped Context pattern in [The Required Pattern: Multiple Contexts, Fully Memoized](09-GlobalState.PATTERN.md) is the deliberate starting point.
The per-field ceiling in [Known Limitation: Per-Context, Not Per-Field, Isolation](09-GlobalState.PATTERN.md) is the specific, identified reason such a
library may become necessary later — these libraries provide
selector-based subscription as a first-class feature, closing this gap
natively. Migrating a given resource's state to a store library should be
driven by actual profiling evidence for that resource, not adopted
app-wide pre-emptively.

Module-local state (e.g. an invoice list's local filter/sort UI state,
scoped to that module alone) lives in the module's own `store/` and is
exported through the module's `index.js` like any other public piece — it
does not go through Context. A module has no `application/` counterpart at
all if nothing about it needs to persist beyond its own pages/lifecycle —
the full Invoice example in [Worked Example](../02-Architecture-Patterns/11-WorkedExample.PATTERN.md) shows this case.

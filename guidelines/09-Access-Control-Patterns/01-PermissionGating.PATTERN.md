# Permission Gating

**Unaffected by which authentication pattern is chosen.** This checks
permission strings on the already-authenticated user object — it has no
dependency on how that user got authenticated (Device-Bound Refresh
Token or httpOnly Cookie + JWT), which is why this lives in its own file
rather than being duplicated inside both auth pattern files.

---

## The Core Model: a Role Is Just a Named Bundle of Permissions

A role has no meaning to the frontend by itself — it is purely a label a
backend attaches to a set of granular permission scopes (e.g. an "Admin"
role bundling `invoice:create`, `invoice:read`, `invoice:delete`; a
"Member" role bundling only `invoice:read`). **Gating a page or action is
always a permission check, never a role-name check** — "can this user
see the create-invoice page" is answered by "does this user currently
have `invoice:create`," never by "is this user's role literally named
Admin."

This single model covers both ways a project might define its roles:

- **Fixed roles** — a static set hardcoded in the backend (simpler apps
  that don't need runtime role management).
- **Dynamic, Discord-style roles** — roles created at runtime by users,
  with granular permissions assigned to them dynamically, then assigned
  to other members.

**The distinction between these two is backend-only.** Either way, what
reaches the frontend (as part of the user object returned by login/
signup, regardless of which auth pattern produced that user object) is
the same shape: a flat array of permission strings the current user
currently holds. The frontend never varies its own logic based on which
of the two produced that array — it only ever checks permission
strings, uniformly, regardless of source.

## `hasPermission` — Pure Check Logic

```js
// common/utils/permissions.js
// Pure function — no React, no application-specific coupling. Testable
// in isolation, reusable regardless of where "the current user" data
// actually comes from.

export const hasPermission = (userPermissions = [], requiredPermission, mode = "all") => {
  if (!requiredPermission) return true
  const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
  return mode === "any"
    ? required.some((perm) => userPermissions.includes(perm))
    : required.every((perm) => userPermissions.includes(perm))
}
```

`mode` defaults to `"all"` — when multiple permissions are passed, the
user must have every one of them. `"any"` is available for the less
common but real case of "show this if the user has at least one of these
related permissions."

## `PermissionGate` and `useHasPermission`

Both live in `application/auth/`, not `common/`, since they need "the
current user" via `useAuth()` — an application-specific concern, same
reasoning as the session-expiry modal living here rather than in
`common/` (see whichever auth pattern file is actually in use).

```jsx
// application/auth/PermissionGate.jsx
import { hasPermission } from "@/common/utils/permissions"
import { useAuth } from "./AuthProvider"

export const PermissionGate = ({ permission, mode = "all", children }) => {
  const { user } = useAuth()
  if (!hasPermission(user?.permissions, permission, mode)) return null
  return children
}
```

```js
// application/auth/useHasPermission.js
import { hasPermission } from "@/common/utils/permissions"
import { useAuth } from "./AuthProvider"

export const useHasPermission = (permission, mode = "all") => {
  const { user } = useAuth()
  return hasPermission(user?.permissions, permission, mode)
}
```

The hook exists alongside the gate component for cases where a plain
boolean is needed directly (e.g. combined with other conditions, or used
somewhere that isn't simply "render this JSX or don't") — the gate
component is the default choice for the common case of hiding an action
or section outright.

```js
// application/index.js — addition
export { PermissionGate } from "./auth/PermissionGate"
export { useHasPermission } from "./auth/useHasPermission"
```

**Usage — hiding an action a user isn't allowed to perform:**
```jsx
<PermissionGate permission="invoice:delete">
  <Button onClick={handleDeleteClick}>Delete Invoice</Button>
</PermissionGate>
```

**Usage — requiring more than one permission at once (default `"all"`
mode):**
```jsx
<PermissionGate permission={["invoice:delete", "invoice:archive"]}>
  <BulkActionsMenu />
</PermissionGate>
```

**Usage — the hook, for guarding a page/route rather than hiding a
single element** (uses whichever navigation mechanism the active auth
pattern's router adapter provides — see that pattern's own file for the
exact redirect approach for this stack):
```jsx
const canCreateInvoice = useHasPermission("invoice:create")
if (!canCreateInvoice) {
  // redirect using this project's router adapter — see the active
  // auth pattern file for the exact mechanism on this stack
}
```

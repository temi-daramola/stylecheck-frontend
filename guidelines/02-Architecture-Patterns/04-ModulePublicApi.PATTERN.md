# Module Public API Pattern (solves Problems 2 & 3)

Every module exposes exactly **one** `index.js`, which re-exports only
what other parts of the app are allowed to use. Everything not re-exported
there is private to the module. This uses standard named ES exports (not a
bundled object) so the bundler can tree-shake unused code and editor
tooling (jump-to-def, find references) works normally.

```js
// ✅ Correct
import { InvoiceListPage } from "@/modules/invoice"

// ❌ Wrong — bypasses the module boundary
import { InvoiceListPage } from "@/modules/invoice/pages/InvoiceListPage"
```

## Rules within a module
- Pages are always in their own subfolder, even for a single file.
- Simple components/constants/utils can be plain files — no forced subfolder.
- A controller directory mirrors its page's name (minus the word
  "controller") and holds **only** that page's controller hook.
- Supporting hooks live separately in the module's flat `hooks/` folder.
- Internal files within a module import each other directly — the
  one-`index.js`-boundary rule applies to *other* modules importing *this*
  module, not to files inside it importing each other.

## What Goes Where

| Layer | Contains | Does NOT contain |
|---|---|---|
| `pages/` | JSX only — calls the controller, destructures what it needs, passes props to components | State, logic, handler definitions |
| `utils/` | Pure functions, no React, no state — formatting, calculations, validation | Anything needing `useState` or another hook |
| `services/` | Pure functions, no React — API calls, request/response shaping | State, hooks, React at all |
| `controllers/<PageName>/` | The one controller hook for that page — composes supporting hooks and adapter hooks, shapes the return value for the page | Handler logic for a single concern; that belongs in `hooks/` |
| `hooks/` (flat, module-level) | One file per distinct stateful concern (a filter, a sort order). Each owns its own state *and* its own handlers. Has its own `index.js`. | Orchestration across multiple concerns; that belongs in the controller |

**The rule that keeps controllers from growing unbounded:** new stateful
logic for a page becomes a new file in `hooks/`, not more lines inside the
controller. A controller only writes its own handler logic when that
handler must combine more than one concern at once (e.g. "reset all
filters and sorting") — that is the sole exception.

**Naming note:** only the file inside `controllers/<PageName>/` is "the
controller." Everything in `hooks/` is a supporting hook the controller
composes, kept in a separate folder specifically because it is not a
controller itself.

**Services are one file per resource, not one file per request.** A
resource's services (fetch, create, update, delete — whatever requests it
needs) live together as named exports in a single `PascalCase` file, e.g.
`InvoiceServices.js`, not split into `FetchInvoices.js`,
`CreateInvoice.js`, `UpdateInvoice.js`, `DeleteInvoice.js` individually.
No separate `index.js` is needed for this file, since it's already a
single, already-consolidated entry point — consistent with [Module Public API Pattern](04-ModulePublicApi.PATTERN.md)'s rule that
simple things (constants, utils) don't need forced subfolders or
per-item files.

```js
// modules/invoice/services/InvoiceServices.js
import { get, post, put, del } from "@/adapters/http"

export const fetchInvoices = (page) => get("/invoices", { params: { page } })
export const fetchInvoice = (id) => get(`/invoices/${id}`)
export const createInvoice = (data) => post("/invoices", data)
export const updateInvoice = ({ id, ...data }) => put(`/invoices/${id}`, data)
export const deleteInvoice = (id) => del(`/invoices/${id}`)
```

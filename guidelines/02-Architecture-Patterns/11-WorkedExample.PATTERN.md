# Worked Example — Invoice (Module-Only) and Auth (Module + App-Level State)

This file shows the architecture from `02-Architecture-Patterns/` applied
end-to-end for two resources, with full working code. It assumes that file
has already been read — this one skips the reasoning and goes straight to
application.

Two examples are worked through, chosen specifically because they differ
on the one point that matters most for state placement:

- **Invoice** — a resource that is purely module-scoped. Its data is
  server data (via the query adapter) and its UI state is page-local. It
  has no `application/` counterpart at all, because nothing about it
  needs to outlive its own pages.
- **Auth** — a resource that needs both a module (own pages, controllers,
  hooks, services) *and* app-level persisted state, since auth status must
  survive navigation across the whole app.

For setup/config, adapters, boundary enforcement, lazy-loaded routes, and
top-level wiring — the pieces that apply to every resource rather than one
specific resource — see `02-Architecture-Patterns/`.

---

## Part A — Invoice (Module-Only, No App-Level Persistence)

Invoice has no `application/` counterpart. Its server data lives in the
query cache (via the adapter); its UI state (filter text, sort order) is
scoped entirely to the pages that use it and has no reason to survive
navigating away from `/invoices`.

### A.1 Folder Structure

```
modules/invoice/
├── pages/
│   └── invoice-list-page/
│       └── InvoiceListPage.jsx
├── controllers/
│   └── invoice-list/
│       └── useInvoiceListController.js
├── hooks/
│   ├── useInvoiceFilter.js
│   ├── useInvoiceSort.js
│   └── index.js
├── services/
│   └── InvoiceServices.js
├── utils/
│   └── CalculateInvoiceTotal.js
├── components/
│   ├── InvoiceCard.jsx
│   └── InvoiceTable.jsx
└── index.js
```

### A.2 Services (pure — no React)

One file per resource, not one file per request — every request function
for a given resource lives together as named exports:

```js
// modules/invoice/services/InvoiceServices.js
import { get } from "@/adapters/http"

export const fetchInvoices = async () => get("/invoices")
```

### A.3 Utils (pure — no React)

```js
// modules/invoice/utils/CalculateInvoiceTotal.js
export const calculateInvoiceTotal = (lineItems) =>
  lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
```

### A.4 Supporting Hooks (own their state AND their handlers)

```js
// modules/invoice/hooks/useInvoiceFilter.js
import { useState } from "react"

export const useInvoiceFilter = (invoices) => {
  const [filterText, setFilterText] = useState("")
  const handleFilterChange = (text) => setFilterText(text)
  const filteredInvoices = invoices?.filter((inv) =>
    inv.name.toLowerCase().includes(filterText.toLowerCase())
  )
  return { filterText, filteredInvoices, handleFilterChange }
}
```

```js
// modules/invoice/hooks/useInvoiceSort.js
import { useState } from "react"

export const useInvoiceSort = (invoices) => {
  const [sortOrder, setSortOrder] = useState("asc")
  const handleSortChange = (order) => setSortOrder(order)
  const sortedInvoices = [...(invoices ?? [])].sort((a, b) =>
    sortOrder === "asc" ? a.total - b.total : b.total - a.total
  )
  return { sortOrder, sortedInvoices, handleSortChange }
}
```

```js
// modules/invoice/hooks/index.js
export { useInvoiceFilter } from "./useInvoiceFilter"
export { useInvoiceSort } from "./useInvoiceSort"
```

### A.5 Controller (composes only — no logic of its own)

```js
// modules/invoice/controllers/invoice-list/useInvoiceListController.js
import { useFetch } from "@/adapters/query"
import { useInvoiceFilter, useInvoiceSort } from "@/modules/invoice/hooks"
import { fetchInvoices } from "@/modules/invoice/services/InvoiceServices"

export const useInvoiceListController = () => {
  const { data: invoices, isLoading } = useFetch(["invoices"], fetchInvoices)
  const { filterText, filteredInvoices, handleFilterChange } = useInvoiceFilter(invoices)
  const { sortOrder, sortedInvoices, handleSortChange } = useInvoiceSort(filteredInvoices)

  return {
    invoices: sortedInvoices,
    isLoading,
    filterText,
    handleFilterChange,
    sortOrder,
    handleSortChange,
  }
}
```

### A.6 Page (JSX only)

```jsx
// modules/invoice/pages/invoice-list-page/InvoiceListPage.jsx
import { useInvoiceListController } from "@/modules/invoice/controllers/invoice-list/useInvoiceListController"
import { InvoiceTable } from "@/modules/invoice/components/InvoiceTable"

export const InvoiceListPage = () => {
  const { invoices, isLoading, filterText, handleFilterChange, handleSortChange } =
    useInvoiceListController()

  if (isLoading) return <div>Loading…</div>

  return (
    <div>
      <input value={filterText} onChange={(e) => handleFilterChange(e.target.value)} />
      <InvoiceTable invoices={invoices} onSortChange={handleSortChange} />
    </div>
  )
}
```

### A.7 Module Public API

```js
// modules/invoice/index.js
export { InvoiceListPage } from "./pages/invoice-list-page/InvoiceListPage"
```

**Why there's no `application/invoice`:** none of this state needs to
outlive `InvoiceListPage`. Filter and sort state resets naturally when the
page unmounts, which is the correct behavior here — there's no product
requirement for it to persist. Invoice *data* is already handled by the
query cache, which is independent of any module folder or Context.

---

## Part B — Auth (Module + App-Level Persisted State)

Auth needs everything Invoice has (its own pages/controllers/hooks/
services) *plus* a piece of state — `user` / `isAuthenticated` — that must
survive across the entire app's lifetime, not just while an auth page is
mounted. This is the one difference that justifies an `application/auth`
counterpart.

### B.1 Folder Structure

```
modules/auth/
├── pages/
│   └── login-page/
│       └── LoginPage.jsx
├── controllers/
│   └── login/
│       └── useLoginController.js
├── hooks/
│   ├── useLoginForm.js
│   └── index.js
├── services/
│   └── AuthServices.js
└── index.js

application/
├── auth/
│   ├── useAuthLogic.js
│   └── AuthProvider.jsx
└── index.js
```

### B.2 Services (pure — no React) — lives in the module

```js
// modules/auth/services/AuthServices.js
import { post } from "@/adapters/http"

export const loginRequest = async (credentials) => post("/login", credentials)
```

### B.3 Supporting Hook — form-local state, lives in the module

```js
// modules/auth/hooks/useLoginForm.js
import { useState } from "react"

export const useLoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleEmailChange = (value) => setEmail(value)
  const handlePasswordChange = (value) => setPassword(value)

  return { email, password, handleEmailChange, handlePasswordChange }
}
```

```js
// modules/auth/hooks/index.js
export { useLoginForm } from "./useLoginForm"
```

### B.4 Application Layer — the shared, persisted state

This is the only piece that lives outside the module, because `user` must
survive navigating away from the login page.

```js
// application/auth/useAuthLogic.js
import { useState, useCallback } from "react"
import { loginRequest } from "@/modules/auth"

export const useAuthLogic = () => {
  const [user, setUser] = useState(null)

  const login = useCallback(async (credentials) => {
    // loginRequest is called directly here, not through useFetch, so it
    // is NOT passed through the query adapter's `select` (04-Adapter-Patterns/04-QueryAdapter) — the
    // full { status, message, data, code, requestId } envelope is what resolves, and its
    // inner `data` is unwrapped once, right here.
    const result = await loginRequest(credentials)
    setUser(result.data.user)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return { user, isAuthenticated: !!user, login, logout }
}
```

```jsx
// application/auth/AuthProvider.jsx
import { createContext, useContext, useMemo } from "react"
import { useAuthLogic } from "./useAuthLogic"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, login, logout } = useAuthLogic()

  const value = useMemo(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
```

```js
// application/index.js
export { AuthProvider, useAuth } from "./auth/AuthProvider"
```

### B.5 Controller — composes the module's own hook AND the shared state

This is the one-directional dependency in action: the module's controller
consumes shared state from `application/`, the same way any other
consumer would — it does not call `useAuthLogic` directly.

```js
// modules/auth/controllers/login/useLoginController.js
import { useAuth } from "@/application"
import { useLoginForm } from "@/modules/auth/hooks"

export const useLoginController = () => {
  const { login } = useAuth()
  const { email, password, handleEmailChange, handlePasswordChange } = useLoginForm()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login({ email, password })
  }

  return { email, password, handleEmailChange, handlePasswordChange, handleSubmit }
}
```

### B.6 Page (JSX only)

```jsx
// modules/auth/pages/login-page/LoginPage.jsx
import { useLoginController } from "@/modules/auth/controllers/login/useLoginController"

export const LoginPage = () => {
  const { email, password, handleEmailChange, handlePasswordChange, handleSubmit } =
    useLoginController()

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => handleEmailChange(e.target.value)} />
      <input
        type="password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
      />
      <button type="submit">Log in</button>
    </form>
  )
}
```

### B.7 Module Public API

```js
// modules/auth/index.js
export { LoginPage } from "./pages/login-page/LoginPage"
export { loginRequest } from "./services/AuthServices"
```

`loginRequest` is exported here specifically because `application/auth`
needs to import it — this is the one deliberate case of `application/`
depending on the module, and it's safe because it's a pure function, not a
hook.

### B.8 Any Other Component Reading Auth State

```jsx
// e.g. layouts/dashboard-layout/Navbar.jsx
import { useAuth } from "@/application"

export const Navbar = () => {
  const { user, logout } = useAuth()
  return (
    <nav>
      <span>{user?.name}</span>
      <button onClick={logout}>Log out</button>
    </nav>
  )
}
```

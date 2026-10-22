# Lazy-Loaded Routes (solves Problem 5 — bundle size / load time)

Pages are dynamically imported (`React.lazy()` + dynamic `import()`) so a
user only downloads the code for the route they actually visit, not every
module's code upfront. Every route area follows this same pattern.

## `NotFoundPage` — Unmatched Routes, Distinct From "Not Found" Data

Distinct from a valid route whose *data* happens to be empty ([Detail Views](../06-Data-Patterns/04-DetailViews.PATTERN.md)'s
`!invoice` check) — this is hitting a URL that matches **no route at
all**. Since it belongs to no specific module (it's app-wide, never
owned by one resource), it's an "ownerless" page, same reasoning as [Base UI Component wrapping](../05-UI-Component-Patterns/01-BaseComponentWrapping.PATTERN.md)'s
exception for base UI components — it lives in a new `common/pages/`
folder, alongside `common/components/`, rather than under any module:

```jsx
// common/pages/NotFoundPage.jsx
import { BaseNotify } from "@/common/components"
import { SearchIcon } from "@/adapters/icons"
import { useNavigation } from "@/adapters/router"

export const NotFoundPage = () => {
  const { goTo } = useNavigation()

  return (
    <BaseNotify
      icon={<SearchIcon size={32} />}
      title="Page not found"
      message="The page you're looking for doesn't exist or may have been moved."
      actionLabel="Go back home"
      onAction={() => goTo("/")}
    />
  )
}
```

`BaseNotify` (custom icon), not `StatusNotify` — a 404 doesn't fit
`StatusNotify`'s fixed `state` enum (`empty`/`error`/`success`/`info`),
since it's a routing-level condition, not a data-reading outcome.

**Two catch-all routes are needed, not one — layout-aware vs. bare:**

```jsx
// routes/DashboardRoutes.jsx
import { lazy, Suspense } from "react"
import { Route } from "@/adapters/router"
import { NotFoundPage } from "@/common/pages/NotFoundPage"

const InvoiceListPage = lazy(() =>
  import("@/modules/invoice").then((m) => ({ default: m.InvoiceListPage }))
)

export const DashboardRoutes = () => (
  <>
    <Route path="invoices">
      <Route
        index
        element={
          <Suspense fallback={<div>Loading…</div>}>
            <InvoiceListPage />
          </Suspense>
        }
      />
    </Route>
    {/* Catches any unmatched path WITHIN the authenticated dashboard
        area — still rendered inside DashboardLayout, so the sidebar/nav
        stays visible and the user isn't stranded outside their normal
        navigation. */}
    <Route path="*" element={<NotFoundPage />} />
  </>
)
```

```jsx
// routes/AppRoutes.jsx
import { Routes } from "@/adapters/router"
import { DashboardRoutes } from "./DashboardRoutes"
import { PublicRoutes } from "./PublicRoutes"
import { ProtectedRoute } from "@/layouts/guards"
import { DashboardLayout } from "@/layouts/dashboard-layout"
import { NotFoundPage } from "@/common/pages/NotFoundPage"

export const AppRoutes = () => (
  <Routes>
    {PublicRoutes()}
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        {DashboardRoutes()}
      </Route>
    </Route>
    {/* Catches everything else — bad public URLs, or any top-level path
        outside the dashboard area entirely. Deliberately placed OUTSIDE
        ProtectedRoute, so a nonexistent URL shows 404 immediately,
        without first waiting on an auth/auto-login check that has
        nothing to do with whether the route even exists. */}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)
```

```jsx
// routes/PublicRoutes.jsx
import { lazy, Suspense } from "react"
import { Route } from "@/adapters/router"

const LoginPage = lazy(() =>
  import("@/modules/auth").then((m) => ({ default: m.LoginPage }))
)

export const PublicRoutes = () => (
  <Route path="auth">
    <Route
      path="login"
      element={
        <Suspense fallback={<div>Loading…</div>}>
          <LoginPage />
        </Suspense>
      }
    />
  </Route>
)
```

A route's page code is fetched only when that route renders — a user who
never visits `/invoices` never downloads the invoice module at all.

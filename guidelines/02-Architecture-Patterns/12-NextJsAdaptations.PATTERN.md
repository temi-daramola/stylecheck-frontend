# Next.js Adaptations

This file exists because a genuine subset of the React architecture pattern files assumes a Vite + React Router SPA. Most of the architecture (module
boundaries, adapters, services, error contract, forms, pagination,
mutations, UI components) is framework-agnostic and applies to Next.js
unchanged. This file states precisely what does NOT carry over, and what
replaces it.

**Read this file before starting a Next.js project, alongside the normal pattern files in `guidelines/` — it does not replace them, it overrides specific parts.**

---

## 1. What Stays Exactly the Same

- Module boundary pattern, `common/`, naming conventions, the
  `{status, message, data, code, requestId}` envelope contract, forms (`useForm`),
  pagination logic (`usePagination`), mutations (`useMutationWithFeedback`,
  the update/delete/create cache strategies), `useQueriesTracker`,
  permission gating, the Chakra component library, the http/query/
  validation/uuid/notifications/icons adapters — none of this changes.
- The overall philosophy — adapters wrap third-party libraries, services
  are consolidated per resource, controllers compose supporting hooks —
  applies identically.

## 2. What Changes, and Why

### 2.1 Routing — File-System Based, No `react-router-dom`

Next.js's App Router uses the folder structure inside `app/` as the
router itself — a folder becomes a URL segment, `page.jsx` inside it is
what renders there. There is no `<Routes>`/`<Route>` tree to author, and
`adapters/router` as documented does not apply — `react-router-dom` is
not used at all in a Next.js project.

```
app/
├── page.jsx                    ← "/"
├── (auth)/
│   └── login/
│       └── page.jsx              ← "/login"
├── dashboard/
│   ├── layout.jsx                 ← wraps everything under /dashboard
│   ├── invoices/
│   │   ├── page.jsx                ← "/dashboard/invoices"
│   │   └── [id]/
│   │       └── page.jsx              ← "/dashboard/invoices/:id"
└── not-found.jsx                ← replaces NotFoundPage's routing role
```

`AppRoutes`/`DashboardRoutes`/`PublicRoutes` ([Lazy-Loaded Routes](07-LazyLoadedRoutes.PATTERN.md))
do not exist in a Next.js project — routing is entirely file-based.
`RootLayout` (`app/layout.jsx`) replaces `main.jsx`'s job of mounting
top-level providers.

### 2.2 The Router Adapter Is Replaced, Not Removed

The *principle* still applies — never import Next.js's navigation
primitives directly outside an adapter — but the underlying library is
`next/navigation`, not `react-router-dom`:

```js
// adapters/router/index.js — Next.js version
"use client"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export const useNavigation = () => {
  const router = useRouter()
  return {
    goTo: (path) => router.push(path),
    goBack: () => router.back(),
    replace: (path) => router.replace(path),
  }
}

export const useRouteLocation = () => {
  const pathname = usePathname()
  return { path: pathname }
}

export const useQueryParams = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  return {
    get: (key) => searchParams.get(key),
    set: (key, value) => {
      const params = new URLSearchParams(searchParams)
      params.set(key, value)
      router.push(`${pathname}?${params.toString()}`)
    },
  }
}
```

Every consumer of `@/adapters/router` (`usePagination`, `ProtectedRoute`,
etc.) is unaffected by this swap, since they only ever depended on the
adapter's own function names — this is the adapter pattern doing exactly
what it was built for.

**`useRouteParams`** (reading a dynamic segment like `[id]`) maps to
`next/navigation`'s own `useParams()` hook — usable anywhere in a Client
Component tree, not just the page file itself, which fits this
architecture's pattern of reading the ID inside a *controller*, not the
page:

```js
// adapters/router/index.js — addition
import { useParams } from "next/navigation"

export const useRouteParams = () => useParams()
```

**Caution, since this changed recently and is easy to get wrong:** as of
Next.js 15, the `params` prop passed directly into a `page.jsx` file
(Server Component) is a **Promise**, and must be `await`ed —
`export default async function Page({ params }) { const { id } = await params }`.
This project's pages are Client Components (§2.3), so `useParams()`
above is the right tool almost always — but if a Server Component
genuinely needs a dynamic segment's value directly (e.g. for
`generateMetadata`), it must await the `params` promise, not destructure
it synchronously.

### 2.3 Server Components vs. Client Components — Affects Every Hook

This is the largest structural difference. Next.js's App Router defaults
every component to a **Server Component** — rendered on the server, no
`useState`, no `useEffect`, no event handlers, no hooks of any kind. A
file must explicitly opt into client-side behavior with a `"use client"`
directive at the very top, before it can use any hook this architecture
has built (`useForm`, `usePagination`, `useAuth`, `useFetch`, all of it).

**Practical rule: any file that imports from `common/hooks/`,
`application/`, or any adapter hook (`useNavigation`, `useFetch`, etc.)
needs `"use client"` at the top.** Pages, controllers, and most
components in this architecture are therefore Client Components in
practice, since almost everything here is built around hooks. Purely
presentational leaf components with zero hooks and zero interactivity
can remain Server Components if there's a reason to (smaller client
bundle), but this is an optimization, not a requirement — defaulting to
`"use client"` on anything that was already a hook-driven component in
the React/Vite version is the safe, correct starting point.

```jsx
// modules/invoice/pages/invoice-list-page/InvoiceListPage.jsx
"use client"

import { useInvoiceListController } from "@/modules/invoice/controllers/invoice-list/useInvoiceListController"
// ...unchanged from here
```

### 2.4 Environment Variables

`import.meta.env.VITE_*` (Vite) becomes `process.env.NEXT_PUBLIC_*` for
anything that must be readable in the browser — Next.js requires the
`NEXT_PUBLIC_` prefix specifically to expose a variable to client code;
anything without that prefix is server-only and will be `undefined` in
a Client Component.

```js
// common/constants/EnvConfig.js — Next.js version
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const EnvConfig = {
  BASE_URL,
  AUTH_URL: `${BASE_URL}/auth`,
  USERS_URL: `${BASE_URL}/users`,
}
```
See [Environment Variables and Design Colors](../03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md)'s "Derived Environment Values"
subsection for the full pattern — this is the same file, just showing
the Next.js-specific raw env read.

[Environment Variables and Design Colors](../03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md)'s rule (env vars live in `common/constants/`, no separate `config/`
folder) is unchanged — only the access syntax differs.

### 2.5 Lazy Loading

React Router's version ([Lazy-Loaded Routes](07-LazyLoadedRoutes.PATTERN.md), `React.lazy()` + `Suspense`) is replaced by
Next.js's own `next/dynamic`, which additionally supports SSR-specific
options:

```jsx
import dynamic from "next/dynamic"

const InvoiceTable = dynamic(() => import("@/modules/invoice/components/InvoiceTable"), {
  loading: () => <div>Loading…</div>,
})
```

In practice this matters less than it did in the Vite version — the App
Router already code-splits automatically per route segment (each
`page.jsx` is its own chunk by default), so `next/dynamic` is mainly for
splitting a large *component* out of an already-loaded page, not for
route-level splitting, which Next.js handles on its own.

### 2.6 404 / Unmatched Routes

Replaced by Next.js's own file convention — `app/not-found.jsx` — rather
than the two-catch-all-`<Route path="*">` pattern from [`NotFoundPage`](07-LazyLoadedRoutes.PATTERN.md). The
`NotFoundPage` component itself (`BaseNotify`, custom icon, "Go back
home" action) is unchanged; only how it gets wired into the router
differs:

```jsx
// app/not-found.jsx
import { NotFoundPage } from "@/common/pages/NotFoundPage"
export default function NotFound() {
  return <NotFoundPage />
}
```

The layout-aware-vs-bare distinction from [`NotFoundPage`](07-LazyLoadedRoutes.PATTERN.md) (dashboard 404 keeps the
sidebar, public 404 doesn't) is achieved by placing a `not-found.jsx`
file at different levels of the `app/` tree — Next.js resolves to the
nearest one in the folder hierarchy, so `app/dashboard/not-found.jsx`
overrides the root one specifically for anything under `/dashboard`.

### 2.7 Auth Guards — Consider Middleware Instead of (or Alongside) `ProtectedRoute`/`GuestRoute`

`ProtectedRoute`/`GuestRoute` (either auth pattern file — their `ProtectedRoute` and `GuestRoute` sections)
still work as Client Component wrappers in Next.js, unchanged. But
Next.js has a genuinely better option worth considering: a root-level
`middleware.ts` file that runs **before** a page ever starts rendering,
on the server/edge — meaning an unauthenticated user can be redirected
before any client-side JS or auto-login flash occurs at all, rather than
after the page mounts and a `useEffect` fires.

```js
// middleware.ts
import { NextResponse } from "next/server"

export function middleware(request) {
  const hasSession = request.cookies.has("session_token")
  const isProtectedPath = request.nextUrl.pathname.startsWith("/dashboard")

  if (isProtectedPath && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
```

This is a genuine architectural choice, not just a syntax swap — it
depends on the session being readable from a cookie at the edge (works
cleanly with a cookie-based session; less straightforward if the session
is only ever in memory/`localStorage`, which cannot be read by
middleware at all). If cookie-based sessions are in use, middleware
should be the first line of defense, with `ProtectedRoute` remaining as
a client-side fallback/second check. If sessions are memory/
`localStorage`-only, `ProtectedRoute`'s existing design applies unchanged
and middleware is not usable for this purpose.

### 2.8 Images

`common/components/Image.jsx` (the Chakra wrapper) can remain for
non-optimized cases, but Next.js ships `next/image`, which handles
automatic optimization, lazy loading, and layout-shift prevention — worth
a dedicated adapter if used:

```js
// adapters/image/index.js
export { default as OptimizedImage } from "next/image"
```

---

## 3. What Still Needs Deciding (Not Prescribed Here)

- **Data fetching split** — Server Components can fetch data directly
  (`async function Page() { const data = await fetchInvoices() }`)
  without TanStack Query at all. Whether to do this for initial page
  loads (faster first paint, less client JS) while keeping TanStack
  Query for anything interactive (pagination, mutations, `DataGate`'s
  gated loading states) is a real architectural decision this file does
  not make — it depends on how much of this project's data is genuinely
  static-per-request vs. needs client-side refetching/caching.
- **Server Actions** — Next.js's own mechanism for mutations (a
  `"use server"` function called directly from a form), as an
  alternative or complement to the `services/` + `useMutationWithFeedback`
  pattern. Not evaluated here.

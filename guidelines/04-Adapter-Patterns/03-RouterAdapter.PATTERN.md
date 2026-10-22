# Router Adapter

```js
// adapters/router/index.js
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom"

// JSX components — re-exporting directly is fine here, since this file
// IS the boundary.
export { BrowserRouter, Routes, Route, Navigate, Outlet, Link }

// hooks wrapped in your own functions
export const useNavigation = () => {
  const navigate = useNavigate()
  return {
    goTo: (path, state = null) =>
      navigate(path, ...(state ? [{ state }] : [])),
    goBack: () => navigate(-1),
    goForward: () => navigate(1),
    replace: (path, state = null) =>
      navigate(path, { replace: true, ...(state ? { state } : {}) }),
  }
}

export const useRouteParams = () => useParams()

export const useRouteLocation = () => {
  const location = useLocation()
  return {
    path: location.pathname,
    search: location.search,
    state: location.state,
    hash: location.hash,
  }
}

export const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  return {
    get: (key) => searchParams.get(key),
    set: (key, value) => setSearchParams({ [key]: value }),
    setMany: (params) => setSearchParams(params),
    delete: (key) => {
      searchParams.delete(key)
      setSearchParams(searchParams)
    },
    getAll: () => Object.fromEntries(searchParams.entries()),
  }
}
```

`useParams`/`useLocation`/`useSearchParams` are renamed to
`useRouteParams`/`useRouteLocation`/`useQueryParams` on export — this
avoids shadowing the raw library hook names, which keeps it obvious at
every call site that these are the adapter's own wrapped versions, not
react-router's.

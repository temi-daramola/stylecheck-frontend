# Quick Rules Reference

| Rule | Description |
|---|---|
| Path aliases | All imports use `@/...`, never relative `../../..` chains |
| Module public API | Every module exports only through its own `index.js` |
| Naming | Hooks: `camelCase`; everything else (components, pages, services, utils, constants): `PascalCase`; folders: `lowercase-with-hyphens`; `index.js` always stays lowercase |
| `common/` promotion | Only after a genuine second module needs it, never pre-emptively — except ownerless primitives (base UI, formatting utils), which start there directly |
| Deep imports | Blocked via `.vscode/settings.json` (autocomplete) + ESLint `no-restricted-imports` (hard error) |
| Third-party libraries | Only imported inside `adapters/`, wrapped in your own function names |
| Pages | Always in their own subfolder, JSX only |
| Controllers | Subfolder mirroring the page name (minus "controller"), holds only that page's controller hook |
| Supporting hooks | Live in the module's flat `hooks/` folder (own `index.js`), never inside `controllers/`; own their state + handlers |
| Services | Pure functions only — API calls, no React; throw on failure, never catch/reshape |
| Utils | Pure functions only — formatting/calculations, no React |
| Layouts | Own folder ONLY if it has co-located components (Sidebar, Navbar); otherwise a plain file in `layouts/_common/`. Each layout wraps its `<Outlet />` in an `ErrorBoundary` |
| Guards | Live inside `layouts/guards/` |
| Global state | React Context, one per resource, `useMemo` + `useCallback` required, sourced from a module's pure functions only |
| Module-local state | Lives in the module's own `store/`, exported via its `index.js`; not every module needs an `application/` counterpart |
| Routes | Always lazy-loaded per route via `React.lazy()` + dynamic `import()` |
| Errors | Services throw; query adapter catches natively; controllers pass through; pages render via `InlineAlert` (`status="error"`) or `StatusNotify` (with a retry action); layouts catch render crashes via `ErrorBoundary` |
| Pagination | Page number synced to URL via `useQueryParams`; `usePagination` owns page math + auto-corrects if the current page becomes invalid |
| Mutations | Run via `useMutationWithFeedback`; cache patched directly via the query adapter (update: swap in place; delete: shift cached pages forward) — never a full list refetch |
| No runtime container | State/module access is via normal imports and Context, not a `container` object |

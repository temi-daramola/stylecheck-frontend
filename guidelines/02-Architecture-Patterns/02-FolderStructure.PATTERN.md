# Folder Structure

```
src/
├── adapters/           ← ALL third-party library wrappers live here, nowhere else
│   ├── router/
│   ├── query/
│   ├── validation/
│   ├── http/
│   ├── uuid/
│   ├── notifications/
│   ├── storage/          ← wraps localStorage — see 04-Adapter-Patterns/08-StorageAdapter
│   ├── icons/             ← own generic names, backed by react-icons — see 04-Adapter-Patterns/09-IconsAdapter
│   └── index.js
├── application/         ← app-wide, persisted state — sourced FROM modules, never original logic
│   ├── auth/
│   │   ├── useAuthLogic.js
│   │   └── AuthProvider.jsx
│   └── index.js
├── common/               ← genuinely shared UI/utils/hooks, used by 2+ modules
│   ├── components/
│   │   ├── Input.jsx        ← wraps UI library, own prop API — see 05-UI-Component-Patterns/01-BaseComponentWrapping
│   │   ├── Select.jsx
│   │   ├── Textarea.jsx
│   │   ├── InlineAlert.jsx   ← composed with status="error" for error display — see 07-Error-Handling-Patterns/02-ExpectedFailures
│   │   ├── PaginatedView.jsx  ← see 06-Data-Patterns/02-Pagination
│   │   ├── DataGate.jsx       ← reusable initial-load gate — see 06-Data-Patterns/05-DataGate
│   │   ├── FormSkeleton.jsx
│   │   ├── TableSkeleton.jsx
│   │   └── CardSkeleton.jsx
│   ├── constants/            ← environment variables + color config — see 03-Configuration-Patterns/01-EnvAndColorConfig
│   │   └── Colors.js          ← plain, UI-library-agnostic named color values
│   ├── hooks/
│   │   ├── useForm.js         ← reusable form validation flow — see 06-Data-Patterns/11-FormValidationHook
│   │   ├── usePagination.js    ← see 06-Data-Patterns/02-Pagination
│   │   ├── useQueriesTracker.js ← gates rendering on multiple queries — see 06-Data-Patterns/03-MultiQueryGating
│   │   └── useMutationWithFeedback.js ← see 06-Data-Patterns/07-MutationFeedback
│   ├── pages/                 ← ownerless, app-wide pages (not tied to a module) — see 02-Architecture-Patterns/07-LazyLoadedRoutes
│   │   └── NotFoundPage.jsx
│   ├── utils/
│   │   └── permissions.js     ← pure permission-check logic — see 09-Access-Control-Patterns/01-PermissionGating
│   └── index.js
├── layouts/
│   ├── dashboard-layout/        ← own folder — has co-located components
│   │   ├── DashboardLayout.jsx
│   │   ├── Sidebar.jsx          ← co-located with its layout, not in common/
│   │   ├── SidebarNavItem.jsx    ← see 05-UI-Component-Patterns/
│   │   ├── useSidebarCollapse.js  ← persisted collapse state
│   │   ├── Navbar.jsx
│   │   └── index.js
│   ├── auth-layout/
│   │   └── index.js
│   ├── _common/                  ← layouts with NO co-located components —
│   │   │                            plain files, not their own folder;
│   │   │                            underscore sorts this first
│   │   └── AuthLoadingLayout.jsx  ← see 08-Authentication-Patterns/01-FrontendAuthSelection
│   ├── guards/
│   │   ├── ProtectedRoute.jsx
│   │   ├── GuestRoute.jsx
│   │   └── index.js
│   └── index.js
├── modules/
│   └── <resource>/                ← one feature module, self-contained
│       ├── pages/                 ← JSX only, one subfolder per page
│       ├── controllers/           ← one subfolder per page, controller hook only
│       ├── hooks/                 ← supporting hooks, flat, own index.js
│       ├── services/              ← pure functions: API calls, no React
│       ├── utils/                 ← pure functions: formatting, calculations
│       ├── components/            ← plain files OK, no forced subfolder
│       ├── store/                 ← module-local client state, if any
│       ├── constants/
│       └── index.js               ← the module's ONE public API — see 02-Architecture-Patterns/04-ModulePublicApi
├── routes/
│   ├── DashboardRoutes.jsx        ← lazy-loaded route definitions per area
│   ├── PublicRoutes.jsx
│   └── AppRoutes.jsx
├── App.jsx
└── main.jsx
```

There is no runtime container/registry object anywhere in this
architecture. Boundaries are enforced by (a) what each `index.js` exports,
and (b) tooling that blocks importing past that boundary — see [Enforcing the Boundary](06-BoundaryEnforcement.PATTERN.md).

**A layout gets its own folder only if it has layout-specific components
to co-locate with it** — e.g. `dashboard-layout/` genuinely needs its own
folder because `Sidebar.jsx`/`Navbar.jsx` only make sense next to that
one layout, not generic enough for `common/components/`. A layout with no
such components (nothing to co-locate) is a plain file inside
`layouts/_common/` instead — it does not get a dedicated folder just
because it's a layout. This is not automatic for every layout; check
whether there's actually something to co-locate before creating a folder.

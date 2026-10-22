# New Project Setup Checklist

1. Scaffold with Vite: `npm create vite@latest my-app -- --template react`
2. Set up the `@/` path alias in `vite.config.js` and `jsconfig.json` ([Path Aliases](../02-Architecture-Patterns/03-PathAliases.PATTERN.md))
3. Create the folder structure from [Folder Structure](../02-Architecture-Patterns/02-FolderStructure.PATTERN.md)
4. Add `.vscode/settings.json` with `autoImportFileExcludePatterns` ([VS Code auto-import exclusion](../02-Architecture-Patterns/06-BoundaryEnforcement.PATTERN.md))
5. Install and configure ESLint with `no-restricted-imports` ([ESLint deep-import rule](../02-Architecture-Patterns/06-BoundaryEnforcement.PATTERN.md))
6. (Optional) Add husky + lint-staged for pre-commit enforcement ([ESLint deep-import rule](../02-Architecture-Patterns/06-BoundaryEnforcement.PATTERN.md))
7. Build out `adapters/` — router, query, validation (yup), HTTP client
   (axios), uuid, notifications, storage, icons, and any other
   third-party libraries the project needs ([Adapter Principles](../04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md), full code in
   `04-Adapter-Patterns/`)
8. Add modules under `modules/`, each with its own `index.js` ([Module Public API Pattern](../02-Architecture-Patterns/04-ModulePublicApi.PATTERN.md))
9. For resources needing app-level persistence, build the matching
   `application/<resource>/` piece sourced from that module ([Global / App-Wide State](../02-Architecture-Patterns/09-GlobalState.PATTERN.md))
10. Add `InlineAlert`/`StatusNotify` (for error display) and
    `ErrorBoundary` to `common/components/`, and wrap each layout's
    `<Outlet />` in an `ErrorBoundary` ([Error Handling](../07-Error-Handling-Patterns/01-ErrorHandlingOverview.PATTERN.md))
11. Wire lazy routes per module under `routes/` ([Lazy-Loaded Routes](../02-Architecture-Patterns/07-LazyLoadedRoutes.PATTERN.md))
12. Wire `App.jsx` and `main.jsx` ([Top-Level Wiring](../02-Architecture-Patterns/08-TopLevelWiring.PATTERN.md))
13. Build out pagination, detail views, and mutations as each resource
    needs them ([Reading & Paginating Data](../06-Data-Patterns/01-ReadingDataOverview.PATTERN.md) to [Mutations](../06-Data-Patterns/06-MutationsOverview.PATTERN.md), full code in
    `06-Data-Patterns/`)

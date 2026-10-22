# Frontend Development Reference - Master Index

This is the **single source of truth** for the frontend architecture and scaffold patterns of this project. **All code must comply with these references.**

## Stack

- React (Vite), Chakra UI, TanStack Query, react-router-dom, yup, axios
- If this project is Next.js instead of a Vite React SPA, read [NextJsAdaptations](../02-Architecture-Patterns/12-NextJsAdaptations.PATTERN.md) FIRST — routing, Server/Client Components, env vars, and several other things work differently, and that file states exactly what changes vs. what stays the same from the patterns below.

---

## 🤖 INSTRUCTIONS FOR AI ASSISTANTS (Copilot, Claude, etc.)

### How to Traverse This Reference

When implementing any feature, fix, or audit, read and apply the guidelines in this order:

**Step 1: Check the rules first** — before proposing any code, open [RulesChecklist](../10-Rules/02-RulesChecklist.PATTERN.md). It is a condensed, checklist-style index of every rule in every file below, built to be checked against, not read once and memorized. If a task touches something it doesn't obviously cover, follow its pointer to the full file.

**Step 2: Follow folder order** — process folders numerically (01 → 02 → 03 → … → 10). For a narrow task, use the *by task* routing table below to find the folders that matter, but never skip a folder that task touches.

**Step 3: Follow file order within each folder** — within each folder, process files numerically (01 → 02 → 03 → …).

**Step 4: If a task spans more than one file**, or a file references a concept you haven't read yet, check [File Dependency Map](02-FileDependencyMap.md) — it maps which files assume concepts from which other files, so nothing gets applied out of sequence.

**Full traversal order:**
```
01-Master-Index/
  01-INDEX.md                          ← Start here (you are here)
  02-FileDependencyMap.md              ← Which files assume which (check when a task spans files)

02-Architecture-Patterns/
  01-ProblemsAndPrinciples.PATTERN.md
  02-FolderStructure.PATTERN.md
  03-PathAliases.PATTERN.md
  04-ModulePublicApi.PATTERN.md
  05-CommonFolderRules.PATTERN.md
  06-BoundaryEnforcement.PATTERN.md
  07-LazyLoadedRoutes.PATTERN.md
  08-TopLevelWiring.PATTERN.md
  09-GlobalState.PATTERN.md
  10-NamingConventions.PATTERN.md
  11-WorkedExample.PATTERN.md
  12-NextJsAdaptations.PATTERN.md   ← Read FIRST if the project is Next.js, not a Vite SPA

03-Configuration-Patterns/
  01-EnvAndColorConfig.PATTERN.md
  02-ProjectSetupChecklist.PATTERN.md

04-Adapter-Patterns/
  01-AdapterPrinciples.PATTERN.md
  02-HttpAdapter.PATTERN.md
  03-RouterAdapter.PATTERN.md
  04-QueryAdapter.PATTERN.md
  05-ValidationAdapter.PATTERN.md
  06-UuidAdapter.PATTERN.md
  07-NotificationsAdapter.PATTERN.md
  08-StorageAdapter.PATTERN.md
  09-IconsAdapter.PATTERN.md

05-UI-Component-Patterns/
  01-BaseComponentWrapping.PATTERN.md
  02-FormInputs.PATTERN.md
  03-ButtonsAndFeedback.PATTERN.md
  04-LayoutAndTypography.PATTERN.md
  05-Overlays.PATTERN.md
  06-Sidebar.PATTERN.md
  07-NavigationAndDataDisplay.PATTERN.md
  08-ComponentExports.PATTERN.md

06-Data-Patterns/
  01-ReadingDataOverview.PATTERN.md
  02-Pagination.PATTERN.md
  03-MultiQueryGating.PATTERN.md
  04-DetailViews.PATTERN.md
  05-DataGate.PATTERN.md
  06-MutationsOverview.PATTERN.md
  07-MutationFeedback.PATTERN.md
  08-CacheUpdateAndDelete.PATTERN.md
  09-CreateFlow.PATTERN.md
  10-ResourceForms.PATTERN.md
  11-FormValidationHook.PATTERN.md

07-Error-Handling-Patterns/
  01-ErrorHandlingOverview.PATTERN.md
  02-ExpectedFailures.PATTERN.md
  03-ErrorBoundaries.PATTERN.md

08-Authentication-Patterns/
  01-FrontendAuthSelection.PATTERN.md   ← Read first — confirms which auth pattern applies, never assume
  02-DeviceBoundFrontend.PATTERN.md
  03-HttpOnlyCookieFrontend.PATTERN.md
  04-DeviceBoundFlowReference.PATTERN.md
  05-HttpOnlyCookieFlowReference.PATTERN.md

09-Access-Control-Patterns/
  01-PermissionGating.PATTERN.md
  02-AccessGating.PATTERN.md

10-Rules/
  01-QuickRulesReference.PATTERN.md
  02-RulesChecklist.PATTERN.md   ← Check against this before proposing any new code
```

### Rules for AI Assistants

1. **Always read this INDEX first** before generating any code
2. **Process ALL relevant folders** — do not skip any folder the task touches
3. **Process files in numbered order** within each folder
4. **Every pattern is mandatory** — do not ignore or partially apply any guideline
5. **When in conflict** — earlier numbered patterns take priority
6. **When auditing** — check compliance against ALL patterns across ALL folders at once
7. **Never invent a function call** without first checking it is actually defined and exported from where it is claimed to come from
8. **Never assume an auth pattern** — more than one exists; confirm which one this project uses (matching the backend) before writing or auditing any auth code, starting at [FrontendAuthSelection](../08-Authentication-Patterns/01-FrontendAuthSelection.PATTERN.md)

---

## 🚨 CRITICAL RULES (Read Before Any Code)

1. **Adapters are the lowest layer** — `adapters/` never imports from `application/` or `modules/`; it is a pure leaf
2. **`application/` imports only pure functions from a module** — never hooks, components, or anything with React state
3. **Every third-party library is imported ONLY inside its own adapter file**
4. **Services: one file per RESOURCE** (`InvoiceServices.js`), not one file per request
5. **Naming** — hooks `camelCase`; everything else `PascalCase`; folders `lowercase-with-hyphens`
6. **Response shape** — every backend response, success or failure, is `{ status, message, data, code, requestId }` (five fields, not three). This is enforced once, in the HTTP adapter's interceptor. Never reshape it again anywhere downstream
7. **Permission checks are ALWAYS a permission string** (`invoice:delete`), NEVER a role name
8. **Colors come from `common/constants/Colors.js` only** — never a raw hex or a UI library's native color name; see [EnvAndColorConfig](../03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md) and how `Checkbox`/`Switch` handle a confirmed Chakra limitation in [FormInputs](../05-UI-Component-Patterns/02-FormInputs.PATTERN.md) before assuming an exception is acceptable
9. **Never assume an auth pattern** — see the instructions above

---

## 🧭 Which Folder Covers What — By Task

| Task | Read |
|---|---|
| Folder structure, module boundaries, naming, `common/` rules, global state pattern, general architecture questions | `02-Architecture-Patterns/` |
| Env vars, color config, new project setup | `03-Configuration-Patterns/` |
| Building or modifying anything in `adapters/` (http, router, query, validation, uuid, notifications, storage, icons) | `04-Adapter-Patterns/` |
| Any UI component (`Input`, `Button`, `Dialog`, `BaseNotify`/`StatusNotify`/`LoadingNotify`, `Sidebar`, etc.) | `05-UI-Component-Patterns/` |
| Pagination, mutations (create/update/delete), `useQueriesTracker`, `DataGate`, cache strategy | `06-Data-Patterns/` files 01–09 |
| Building a create OR edit form for any resource — which controller shape to use, based on how much data it needs | [ResourceForms](../06-Data-Patterns/10-ResourceForms.PATTERN.md) and [FormValidationHook](../06-Data-Patterns/11-FormValidationHook.PATTERN.md) |
| Error handling contract, `InlineAlert`/`StatusNotify`, error boundaries | `07-Error-Handling-Patterns/` |
| A worked, end-to-end example of a full module (Invoice: no app-level state; Auth: has app-level state) | [WorkedExample](../02-Architecture-Patterns/11-WorkedExample.PATTERN.md) |
| Login, logout, session expiry, auto-login, `ProtectedRoute`/`GuestRoute` — **read [FrontendAuthSelection](../08-Authentication-Patterns/01-FrontendAuthSelection.PATTERN.md) FIRST, always** — more than one pattern exists, never assume which one | `08-Authentication-Patterns/` (selection → one chosen pattern) |
| Permission-based UI gating (`PermissionGate`, `useHasPermission`) — same regardless of auth pattern | [PermissionGating](../09-Access-Control-Patterns/01-PermissionGating.PATTERN.md) |
| Blocking access to a route group until some non-auth requirement is met (`GatedLayout`, `BlurOverlay`) — e.g. onboarding completion, subscription status — NOT authentication | [AccessGating](../09-Access-Control-Patterns/02-AccessGating.PATTERN.md) |

---

## 📐 02 - Architecture Patterns

**Core structural patterns: folders, modules, boundaries, routing, wiring, global state**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [ProblemsAndPrinciples](../02-Architecture-Patterns/01-ProblemsAndPrinciples.PATTERN.md) | ⭐ The five problems the architecture exists to solve |
| 02 | [FolderStructure](../02-Architecture-Patterns/02-FolderStructure.PATTERN.md) | ⭐ Full source tree and what each folder owns |
| 03 | [PathAliases](../02-Architecture-Patterns/03-PathAliases.PATTERN.md) | `@/` alias setup, never relative `../../..` chains |
| 04 | [ModulePublicApi](../02-Architecture-Patterns/04-ModulePublicApi.PATTERN.md) | ⭐ Every module exports only through its own `index.js`; what goes where |
| 05 | [CommonFolderRules](../02-Architecture-Patterns/05-CommonFolderRules.PATTERN.md) | ⭐ Promote on the second real usage, never in anticipation |
| 06 | [BoundaryEnforcement](../02-Architecture-Patterns/06-BoundaryEnforcement.PATTERN.md) | ⭐ VS Code auto-import exclusion + ESLint `no-restricted-imports` |
| 07 | [LazyLoadedRoutes](../02-Architecture-Patterns/07-LazyLoadedRoutes.PATTERN.md) | `React.lazy()` per route, `NotFoundPage` |
| 08 | [TopLevelWiring](../02-Architecture-Patterns/08-TopLevelWiring.PATTERN.md) | `App.jsx` / `main.jsx` provider and router wiring |
| 09 | [GlobalState](../02-Architecture-Patterns/09-GlobalState.PATTERN.md) | ⭐ Multiple memoized Contexts, one per resource; one-directional dependency |
| 10 | [NamingConventions](../02-Architecture-Patterns/10-NamingConventions.PATTERN.md) | Hooks `camelCase`, everything else `PascalCase`, folders `lowercase-with-hyphens` |
| 11 | [WorkedExample](../02-Architecture-Patterns/11-WorkedExample.PATTERN.md) | End-to-end code for two contrasting resources |
| 12 | [NextJsAdaptations](../02-Architecture-Patterns/12-NextJsAdaptations.PATTERN.md) | ⭐ What changes vs. what stays the same when the project is Next.js, not Vite |

---

## ⚙️ 03 - Configuration Patterns

**Environment variables, color config, and new-project setup**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [EnvAndColorConfig](../03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md) | ⭐ `EnvConfig.js` is the only file that reads env; `COLORS` is the only source of colors |
| 02 | [ProjectSetupChecklist](../03-Configuration-Patterns/02-ProjectSetupChecklist.PATTERN.md) | Ordered setup steps for a new project |

---

## 🔌 04 - Adapter Patterns

**Wrapping every third-party library behind your own API**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [AdapterPrinciples](../04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md) | ⭐ The rule: every third-party library imported only inside its own adapter; the eight adapters |
| 02 | [HttpAdapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md) | ⭐ Interceptor, 5-field response contract `{ status, message, data, code, requestId }` |
| 03 | [RouterAdapter](../04-Adapter-Patterns/03-RouterAdapter.PATTERN.md) | Navigation, params, location, query params |
| 04 | [QueryAdapter](../04-Adapter-Patterns/04-QueryAdapter.PATTERN.md) | ⭐ `useFetch`, `useSubmit`, caching, cache-update functions |
| 05 | [ValidationAdapter](../04-Adapter-Patterns/05-ValidationAdapter.PATTERN.md) | Schema building and validation |
| 06 | [UuidAdapter](../04-Adapter-Patterns/06-UuidAdapter.PATTERN.md) | ID generation (also used for idempotency keys) |
| 07 | [NotificationsAdapter](../04-Adapter-Patterns/07-NotificationsAdapter.PATTERN.md) | Toasts |
| 08 | [StorageAdapter](../04-Adapter-Patterns/08-StorageAdapter.PATTERN.md) | Wrapped for consistency |
| 09 | [IconsAdapter](../04-Adapter-Patterns/09-IconsAdapter.PATTERN.md) | Own generic export names, never the icon's real name |

---

## 🧱 05 - UI Component Patterns

**Base UI components, wrapped from the UI library with your own prop API**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [BaseComponentWrapping](../05-UI-Component-Patterns/01-BaseComponentWrapping.PATTERN.md) | ⭐ The wrapping rule + how the Chakra implementation is scoped and verified |
| 02 | [FormInputs](../05-UI-Component-Patterns/02-FormInputs.PATTERN.md) | `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `PinInput` |
| 03 | [ButtonsAndFeedback](../05-UI-Component-Patterns/03-ButtonsAndFeedback.PATTERN.md) | `Button`, alerts, `BaseNotify`/`StatusNotify`/`LoadingNotify`, loaders, skeletons |
| 04 | [LayoutAndTypography](../05-UI-Component-Patterns/04-LayoutAndTypography.PATTERN.md) | `Heading`, `Avatar` |
| 05 | [Overlays](../05-UI-Component-Patterns/05-Overlays.PATTERN.md) | ⭐ `Dialog` (incl. `backdropPointerEvents`), `useConfirm`, `Menu`, `Tooltip`, `ToggleTip` |
| 06 | [Sidebar](../05-UI-Component-Patterns/06-Sidebar.PATTERN.md) | Icon-collapse sidebar, no borders, background-driven states |
| 07 | [NavigationAndDataDisplay](../05-UI-Component-Patterns/07-NavigationAndDataDisplay.PATTERN.md) | `Breadcrumb`, `Tabs`, `Accordion`, `Table` |
| 08 | [ComponentExports](../05-UI-Component-Patterns/08-ComponentExports.PATTERN.md) | The single public export index for shared components |

---

## 🗄️ 06 - Data Patterns

**Reading, paginating, mutating, and form-driven data flows**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [ReadingDataOverview](../06-Data-Patterns/01-ReadingDataOverview.PATTERN.md) | ⭐ The rules for reads, pagination, filtering, detail views, `DataGate` |
| 02 | [Pagination](../06-Data-Patterns/02-Pagination.PATTERN.md) | `usePagination`, paginated controller, `PaginatedView`, filtering |
| 03 | [MultiQueryGating](../06-Data-Patterns/03-MultiQueryGating.PATTERN.md) | Combine several queries into one loading/error state |
| 04 | [DetailViews](../06-Data-Patterns/04-DetailViews.PATTERN.md) | Not-found is a successful empty response, never an error |
| 05 | [DataGate](../06-Data-Patterns/05-DataGate.PATTERN.md) | ⭐ Gates mounting, not just rendering |
| 06 | [MutationsOverview](../06-Data-Patterns/06-MutationsOverview.PATTERN.md) | ⭐ Only the query adapter touches `queryClient`; update vs delete vs create |
| 07 | [MutationFeedback](../06-Data-Patterns/07-MutationFeedback.PATTERN.md) | Mutation + cache update + toast, backend message first |
| 08 | [CacheUpdateAndDelete](../06-Data-Patterns/08-CacheUpdateAndDelete.PATTERN.md) | Why they differ, patching paginated caches, module-level hooks |
| 09 | [CreateFlow](../06-Data-Patterns/09-CreateFlow.PATTERN.md) | ⭐ `invalidateQueries`, reset on success, idempotency key on create |
| 10 | [ResourceForms](../06-Data-Patterns/10-ResourceForms.PATTERN.md) | ⭐ Construction procedure: all 13 leaves for create/edit data loading |
| 11 | [FormValidationHook](../06-Data-Patterns/11-FormValidationHook.PATTERN.md) | ⭐ Full `useForm` implementation |

---

## ⚠️ 07 - Error Handling Patterns

**Expected failures, error boundaries, and how errors reach the user**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [ErrorHandlingOverview](../07-Error-Handling-Patterns/01-ErrorHandlingOverview.PATTERN.md) | ⭐ Expected vs unexpected failures, who catches what |
| 02 | [ExpectedFailures](../07-Error-Handling-Patterns/02-ExpectedFailures.PATTERN.md) | Services throw, the query adapter catches, pages render `InlineAlert`/`StatusNotify` |
| 03 | [ErrorBoundaries](../07-Error-Handling-Patterns/03-ErrorBoundaries.PATTERN.md) | Render crashes caught per layout |

---

## 🔐 08 - Authentication Patterns

**Multiple selectable auth patterns, matched to the backend — confirm which one applies**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [FrontendAuthSelection](../08-Authentication-Patterns/01-FrontendAuthSelection.PATTERN.md) | ⭐ Read first — confirms which pattern applies, never assume |
| 02 | [DeviceBoundFrontend](../08-Authentication-Patterns/02-DeviceBoundFrontend.PATTERN.md) | WebCrypto-bound rotating refresh token, works cross-site |
| 03 | [HttpOnlyCookieFrontend](../08-Authentication-Patterns/03-HttpOnlyCookieFrontend.PATTERN.md) | httpOnly cookie refresh token, same-site/same-origin only |
| 04 | [DeviceBoundFlowReference](../08-Authentication-Patterns/04-DeviceBoundFlowReference.PATTERN.md) | Stack-agnostic full flow detail for the device-bound pattern |
| 05 | [HttpOnlyCookieFlowReference](../08-Authentication-Patterns/05-HttpOnlyCookieFlowReference.PATTERN.md) | Stack-agnostic full flow detail for the httpOnly cookie pattern |

---

## 🚧 09 - Access Control Patterns

**Permission-based UI gating and non-auth access gating**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [PermissionGating](../09-Access-Control-Patterns/01-PermissionGating.PATTERN.md) | `PermissionGate`, `useHasPermission` — permission strings, never roles |
| 02 | [AccessGating](../09-Access-Control-Patterns/02-AccessGating.PATTERN.md) | ⭐ `GatedLayout`, requirement ladder, `BlurOverlay` — NOT authentication |

---

## ✅ 10 - Rules

**Condensed rules and self-audit checklist**

| # | Pattern | Description |
|---|---------|-------------|
| 01 | [QuickRulesReference](../10-Rules/01-QuickRulesReference.PATTERN.md) | One-line table of every core rule |
| 02 | [RulesChecklist](../10-Rules/02-RulesChecklist.PATTERN.md) | ⭐ Check against this before proposing any new code |

---

## 🔄 Workflow

### For New Features
1. Read this INDEX
2. Check the rules checklist
3. Traverse the relevant folders in numeric order, and the files within each in numeric order
4. Apply ALL relevant patterns before writing code

### For Code Reviews
1. Check compliance with all relevant patterns in folder order
2. Verify boundary and import rules (`02-Architecture-Patterns`)
3. Verify every third-party library lives behind its adapter (`04-Adapter-Patterns`)
4. Verify error handling and the response shape (`07-Error-Handling-Patterns`)
5. Verify auth code matches the single confirmed pattern (`08-Authentication-Patterns`)

### For Audits
1. Use `modules/` as the source of truth for resources
2. Check ALL resources at once (not one-by-one)
3. Verify compliance with EVERY pattern across ALL folders
4. Document violations and a remediation plan

---

## 🎯 Priority Order

When in doubt, follow this priority:

1. **Module boundary + path alias rules** (`02-Architecture-Patterns`) — always `@/`, always through a module's `index.js`
2. **Adapters** (`04-Adapter-Patterns`) — no third-party import outside its adapter
3. **Env and colors** (`03-Configuration-Patterns`) — only through `EnvConfig.js` and `COLORS`
4. **Response shape and error handling** (`07-Error-Handling-Patterns`, the HTTP adapter)
5. **Auth pattern confirmed against the backend** (`08-Authentication-Patterns`)
6. **Remaining patterns** — as applicable

---

## When Instructions Here Conflict With What You'd Normally Do

Follow this project's conventions, not general best-practice defaults — several choices here are deliberate and documented (e.g. adapters wrapping third-party libraries with the project's own names, the five-field response envelope, services consolidated per-resource). If something in these patterns seems wrong or outdated, flag it rather than silently working around it.

---

## 📝 Adding New Patterns

When adding new patterns:
1. Place the file in the appropriate category folder
2. Number it sequentially within that folder
3. Update this INDEX.md table for that category and the traversal list above
4. Update [File Dependency Map](02-FileDependencyMap.md) if it assumes concepts from another file
5. Include examples and an audit checklist
6. Reference related patterns

### Planned additions

- A Tailwind CSS counterpart of the UI component set in `05-UI-Component-Patterns/` — one shared file, not duplicated per scaffold. Not yet built.

---

**Version:** 2.0.0
**Status:** Active - All code must comply

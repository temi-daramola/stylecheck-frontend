# File Dependency Map — How the Pattern Files Relate to Each Other

Complements the INDEX's "Which Folder Covers What — By Task" table — that table routes by **topic** ("doing X → read Y"). This file maps **dependency and sequencing** instead: which files assume concepts from which other files, so a file is never read in isolation when it actually needed context from somewhere else first.

**Shared across both the React and Next.js scaffolds** — the dependencies between concepts don't change based on stack, only the routing-specific files' internal content does.

---

## Read First, Always

`10-Rules/02-RulesChecklist.PATTERN.md` and then the `02-Architecture-Patterns/` folder — in that order. The checklist is a condensed index of every rule in every other file; `02-Architecture-Patterns/` is where those rules are actually explained in full. Almost every other file assumes the concepts in `02-Architecture-Patterns/` are already understood — the module public API (`02-Architecture-Patterns/04-ModulePublicApi.PATTERN.md`), the `common/` rules (`02-Architecture-Patterns/05-CommonFolderRules.PATTERN.md`), the error contract (`07-Error-Handling-Patterns/01-ErrorHandlingOverview.PATTERN.md`), the adapter pattern (`04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md`), global state (`02-Architecture-Patterns/09-GlobalState.PATTERN.md`).

---

## Category-Level Dependencies

| Category | Assumes you understand | Built on by |
|---|---|---|
| `02-Architecture-Patterns/` | — (foundational; introduces the rules everything else applies) | every other category |
| `03-Configuration-Patterns/` | `02-Architecture-Patterns/05-CommonFolderRules.PATTERN.md` (why env and colors live in `common/constants/`) | `04-Adapter-Patterns/`, `05-UI-Component-Patterns/` |
| `04-Adapter-Patterns/` | `04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md` (the wrap-third-party-libraries rule), `02-Architecture-Patterns/` module boundaries | `05-UI-Component-Patterns/`, `06-Data-Patterns/`, `07-Error-Handling-Patterns/`, `08-Authentication-Patterns/`, `09-Access-Control-Patterns/` |
| `05-UI-Component-Patterns/` | `05-UI-Component-Patterns/01-BaseComponentWrapping.PATTERN.md` (the component-wrapping rule); `04-Adapter-Patterns/09-IconsAdapter.PATTERN.md` (icons) | `06-Data-Patterns/` (`DataGate`/`StatusNotify`), `08-Authentication-Patterns/` (`Dialog`, `Alert`), `09-Access-Control-Patterns/` (`Dialog`) |
| `06-Data-Patterns/` | `02-Architecture-Patterns/`; `04-Adapter-Patterns/04-QueryAdapter.PATTERN.md`; `04-Adapter-Patterns/02-HttpAdapter.PATTERN.md` (envelope); `05-UI-Component-Patterns/` (`StatusNotify`, `Skeleton`) | `10-Rules/02-RulesChecklist.PATTERN.md` |
| `07-Error-Handling-Patterns/` | `04-Adapter-Patterns/02-HttpAdapter.PATTERN.md` (the interceptor guarantees the failure shape); `05-UI-Component-Patterns/` (`InlineAlert`, `StatusNotify`) | `06-Data-Patterns/`, `08-Authentication-Patterns/` |
| `08-Authentication-Patterns/` | `08-Authentication-Patterns/01-FrontendAuthSelection.PATTERN.md` first; `04-Adapter-Patterns/` (http interceptor, storage); `05-UI-Component-Patterns/` (`Dialog`, `Alert`) | `09-Access-Control-Patterns/01-PermissionGating.PATTERN.md` (reads the authenticated user) |
| `09-Access-Control-Patterns/` | `05-UI-Component-Patterns/` (`05-UI-Component-Patterns/05-Overlays.PATTERN.md`: `Dialog`, `backdropPointerEvents`); `04-Adapter-Patterns/03-RouterAdapter.PATTERN.md` — and explicitly NOT `08-Authentication-Patterns/` | Backend `14-Authorization-Patterns` (the matching server-side enforcement) |
| `10-Rules/` | Condenses rules from `02-Architecture-Patterns/`, `05-UI-Component-Patterns/`, `06-Data-Patterns/` | — (downstream of everything; nothing depends on it) |

---

## File-Level Dependencies That Must Not Be Skipped

| File | Assumes you already read | Note |
|---|---|---|
| `06-Data-Patterns/10-ResourceForms.PATTERN.md` | `06-Data-Patterns/03-MultiQueryGating.PATTERN.md`, `06-Data-Patterns/05-DataGate.PATTERN.md`, `06-Data-Patterns/09-CreateFlow.PATTERN.md`, `06-Data-Patterns/11-FormValidationHook.PATTERN.md` | **States this explicitly in its own intro** — cannot be applied correctly without them |
| `06-Data-Patterns/09-CreateFlow.PATTERN.md` | `06-Data-Patterns/08-CacheUpdateAndDelete.PATTERN.md`, `06-Data-Patterns/11-FormValidationHook.PATTERN.md` (`resetOnSuccess`), `04-Adapter-Patterns/06-UuidAdapter.PATTERN.md` (idempotency key) | Create is the third mutation case, different from update/delete |
| `06-Data-Patterns/08-CacheUpdateAndDelete.PATTERN.md` | `06-Data-Patterns/02-Pagination.PATTERN.md` (the paginated cache shape), `04-Adapter-Patterns/04-QueryAdapter.PATTERN.md` | Mutations patch the cache shape pagination establishes |
| `08-Authentication-Patterns/02-DeviceBoundFrontend.PATTERN.md` | `08-Authentication-Patterns/01-FrontendAuthSelection.PATTERN.md`, `04-Adapter-Patterns/02-HttpAdapter.PATTERN.md` (interceptor), `04-Adapter-Patterns/08-StorageAdapter.PATTERN.md`, `05-UI-Component-Patterns/05-Overlays.PATTERN.md` (`Dialog`) | Full flow detail: `08-Authentication-Patterns/04-DeviceBoundFlowReference.PATTERN.md` |
| `08-Authentication-Patterns/03-HttpOnlyCookieFrontend.PATTERN.md` | `08-Authentication-Patterns/01-FrontendAuthSelection.PATTERN.md`, `04-Adapter-Patterns/02-HttpAdapter.PATTERN.md` (interceptor), `05-UI-Component-Patterns/05-Overlays.PATTERN.md` (`Dialog`) | Full flow detail: `08-Authentication-Patterns/05-HttpOnlyCookieFlowReference.PATTERN.md` |
| `09-Access-Control-Patterns/02-AccessGating.PATTERN.md` | `05-UI-Component-Patterns/05-Overlays.PATTERN.md`, `04-Adapter-Patterns/03-RouterAdapter.PATTERN.md` | **Not** an auth pattern — no dependency on `08-Authentication-Patterns/` in either direction |
| `02-Architecture-Patterns/11-WorkedExample.PATTERN.md` | `02-Architecture-Patterns/04-ModulePublicApi.PATTERN.md`, `02-Architecture-Patterns/09-GlobalState.PATTERN.md`; pulls examples from `04-Adapter-Patterns/` and `06-Data-Patterns/` | A worked example; nothing else depends on it |
| `02-Architecture-Patterns/12-NextJsAdaptations.PATTERN.md` | The architecture it overrides: `02-Architecture-Patterns/01-ProblemsAndPrinciples.PATTERN.md`, `02-Architecture-Patterns/02-FolderStructure.PATTERN.md`, `02-Architecture-Patterns/07-LazyLoadedRoutes.PATTERN.md`, `03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md`, `04-Adapter-Patterns/02-HttpAdapter.PATTERN.md` | — (read FIRST on a Next.js project, before the files it overrides) |

---

## What This Means Practically

- **`02-Architecture-Patterns/` is what almost everything else assumes.** If a task requires touching multiple files, and the architecture folder hasn't been read yet in this session, read it first regardless of which specific file the task seems to point at.
- **`06-Data-Patterns/10-ResourceForms.PATTERN.md` cannot be correctly applied without the data pattern files it names** — this isn't a suggestion, the file says so itself. Don't jump straight to it for a create/edit task without that context.
- **`02-Architecture-Patterns/11-WorkedExample.PATTERN.md` and `10-Rules/02-RulesChecklist.PATTERN.md` are "leaf" files** — nothing else in the dependency graph builds on top of them. The worked example is something to check work against; the checklist is a compressed summary to check work against. Neither introduces a concept that must be understood before reading some other file.
- **A genuinely new task that touches an unfamiliar area** (e.g. first time building a `Sidebar`-like layout-specific component) should follow the chain backward: check the relevant `05-UI-Component-Patterns/` file first, but if a term there isn't clear, its dependency row above shows exactly which file defines it.

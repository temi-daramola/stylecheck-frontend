# Naming Conventions

These patterns have been used consistently in every example throughout
these patterns and [Worked Example](11-WorkedExample.PATTERN.md) — this section states them
explicitly as a rule, so a new file follows the same convention without
needing to reverse-engineer it from examples.

| What | Casing | Example |
|---|---|---|
| Hooks (controllers + supporting hooks) | `camelCase`, prefixed with `use` | `useInvoiceFilter.js`, `useLoginController.js` |
| Everything else — components, pages, services, utils, constants | `PascalCase` | `InvoiceCard.jsx`, `InvoiceListPage.jsx`, `InvoiceServices.js`, `CalculateInvoiceTotal.js`, `EnvConfig.js` |
| Folders | `lowercase-with-hyphens` | `invoice-list/`, `dashboard-layout/`, `login-page/` |

**Hook naming shape:** `use<Resource><Concern>` — e.g. `useInvoiceFilter`,
`useInvoiceSort`, `useLoginForm`, `useLoginController`.

**One exception:** `index.js` always stays lowercase, exactly as written —
this is a module-resolution convention recognized by the bundler and
editor tooling, not a content-naming choice, so it isn't part of this
rule.

**Note on exported identifiers:** a file's `PascalCase` name and its main
exported identifiers don't have to match casing. `InvoiceServices.js`
still exports `camelCase` functions (`export const fetchInvoices = ...`,
`export const createInvoice = ...`), since function/variable naming
follows standard JavaScript convention (`camelCase`) regardless of the
file-naming rule above — only the file name itself follows the table.

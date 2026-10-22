# Environment Variables and Design Colors — `common/constants/`, No Separate `config/`

Environment variables (`.env`) are ownerless primitives by the same logic
as above — they don't belong to any one module — so they live in
`common/constants/` directly. The full pattern for how they're read and
derived — `EnvConfig.js`, the one file that ever touches a raw env
value — is documented below in its own subsection, "Derived Environment
Values."

**There is no separate top-level `config/` folder in this architecture.**
Anything that looks like "configuration" beyond raw environment values is
really a library's own setup — e.g. an axios instance with a base URL and
headers, or the `queryClient` instance — and that setup already lives
inside that library's own adapter ([Adapter Principles](../04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md)), since it's part of the adapter's
implementation, not a separate concern.

## Color Config

Same category as environment variables — a plain, ownerless constants
file, living in the same folder, following the same pattern. **This is
deliberately NOT a UI-library theming mechanism** (not Chakra's own
`createSystem`/`defineConfig` token system, not any other library's
equivalent) — it's a plain JS object of named color values, completely
UI-library-agnostic. Every already-wrapped component (`Input`, `Button`,
`Sidebar`, any future Tailwind equivalents) references these named
constants internally instead of a hardcoded color value — this is what
makes swapping the actual color values, or the underlying UI library
itself, not require touching component internals.

**No color value is ever used anywhere in the app outside this file —
no exceptions, and this applies retroactively.** This covers every
component's own internal implementation AND every caller consuming a
component — a caller passing a raw color name/value into any prop
(including a UI library's own native color prop, e.g. Chakra's
`colorPalette="blue"`) is the same violation as a component hardcoding a
color internally. This rule is not scoped to components written after
this file existed — any component documented before this rule was
written (e.g. `Button`, `IconButton`, `Avatar`, `InlineAlert`, and
others still showing Chakra's own native default palette names) has NOT
yet been audited against it and must be treated as unresolved technical
debt, not as an accepted exception.

**Variant structure — deliberately small, not a full numeric ramp.**
`primary`/`secondary`/`success`/`error`/`info`/`warning` each get 3
variants (`base`, `hover`, `subtle`) since all six are used on
interactive or emphasis elements (buttons, active states, badges, alert
backgrounds) — a single flat value can't cover a hover state and a light
background tint at once. `body` and `stage` are structural, not
interactive, so they get fewer variants (2 each) — a smaller set that
covers real needs without over-engineering a ramp nothing uses yet.

`secondary` is a neutral (slate), not a second saturated color — this was
a deliberate design choice, not a placeholder: pairing a strong `primary`
with an equally strong second color creates two competing focal points,
undermining the entire reason `primary` exists. A neutral keeps hierarchy
clear — `primary` always reads as "the important action," `secondary`
always reads as "the lesser one" — which is also why `secondary` doubles
as the border/divider color below, rather than introducing a dedicated
token for that.

```js
// common/constants/Colors.js
export const COLORS = {
  primary: {
    base: "#7c3aed",
    hover: "#6d28d9",
    subtle: "#ede9fe",
  },
  secondary: {
    base: "#64748b",
    hover: "#475569",
    subtle: "#f1f5f9",
  },
  success: {
    base: "#16a34a",
    hover: "#15803d",
    subtle: "#dcfce7",
  },
  error: {
    base: "#dc2626",
    hover: "#b91c1c",
    subtle: "#fee2e2",
  },
  info: {
    base: "#2563eb",
    hover: "#1d4ed8",
    subtle: "#dbeafe",
  },
  warning: {
    base: "#d97706",
    hover: "#b45309",
    subtle: "#fef3c7",
  },
  body: {
    base: "#1f2937",
    muted: "#6b7280",
  },
  stage: {
    base: "#ffffff",
    surface: "#f9fafb",
  },
}
```

```js
// common/constants/index.js — addition
export { COLORS } from "./Colors"
```

```jsx
// ✅ Correct
import { COLORS } from "@/common/constants"
<Box bg={COLORS.primary.base} _hover={{ bg: COLORS.primary.hover }} />
<Alert bg={COLORS.error.subtle} color={COLORS.error.base} />

// ❌ Wrong — a raw color value anywhere outside this file
<Box bg="#7c3aed" />
<Box bg="gray.900" />
```

**Text-on-solid-color contrast** (e.g. white text on a `primary.base`
button) is resolved as a simple universal rule rather than a fourth
variant per color: every `base` value above is dark/saturated enough
that white text always has sufficient contrast on top of it — no
per-color "contrast text" token is needed. **Border/divider color** uses
`secondary.subtle` or `secondary.base` depending on how strong a line is
needed — resolved for free by `secondary` already being a neutral, not a
second gap requiring its own token.

## Derived Environment Values — `common/constants/EnvConfig.js`

Mirrors the backend's `dotenv-expand` interpolation (e.g.
`AUTH_URL=${BASE_URL}/auth`, computed directly inside the `.env` file
itself) — Vite has no equivalent `${VAR}` interpolation inside `.env`
files, so this responsibility moves into one dedicated JS file instead.

**`common/constants/EnvConfig.js` is the ONLY file that ever reads a raw
`import.meta.env.VITE_*` value, and the ONLY file that ever derives a
value directly from one** — both the reading and the deriving happen
inside this one file, nowhere else:

```js
// common/constants/EnvConfig.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const EnvConfig = {
  BASE_URL,
  AUTH_URL: `${BASE_URL}/auth`,
  USERS_URL: `${BASE_URL}/users`,
}
```

**Base derived constants vs. dynamic derived constants — the actual
line, precisely:**
- **Base derived constant** — anything built directly from a raw env
  value (`AUTH_URL`/`USERS_URL` above). Restricted to `EnvConfig.js`
  only. No other file anywhere touches `import.meta.env` or interpolates
  off a raw env value, even indirectly.
- **Dynamic derived constant** — any OTHER constants file composing its
  own value using an already-finished base derived constant as an
  ingredient. Unrestricted — allowed anywhere, by any file, for its own
  need, as long as it only ever consumes something `EnvConfig.js`
  already fully resolved, never a raw env value itself.

```js
// ✅ Correct — a module's own constants file building on an
// already-resolved base derived constant
import { EnvConfig } from "@/common/constants"

export const InvoiceConstants = {
  DOWNLOAD_URL: `${EnvConfig.USERS_URL}/invoices/download`,
}

// ❌ Wrong — reaching for a raw env value anywhere outside EnvConfig.js
const usersUrl = `${import.meta.env.VITE_API_BASE_URL}/users`
```

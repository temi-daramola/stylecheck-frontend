# Path Aliases (solves Problem 1 — fragile imports)

An absolute alias (`@/` → `src/`) is configured at the build-tool level
and mirrored for the editor. Every import in the project uses this alias
— never relative `../../../` chains. Moving a file within `src/` then only
requires updating the one place that defines where it lives, not every
file that imports it.

```js
// vite.config.js
import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

```json
// jsconfig.json — required even if not using TypeScript, so VS Code
// understands the alias too
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```js
// ✅ Correct
import { InvoiceCard } from "@/modules/invoice"

// ❌ Wrong
import { InvoiceCard } from "../../../modules/invoice/components/InvoiceCard"
```

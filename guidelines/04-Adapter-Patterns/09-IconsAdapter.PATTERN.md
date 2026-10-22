# Icons Adapter (`react-icons`)

Every icon used anywhere in the app is imported here, and only here —
never a component or module reaching into `react-icons` directly.
**Every export is our own generic name, never the underlying icon's
actual name** — so a consumer never knows or cares which icon family a
given icon actually came from internally, and swapping icon libraries
later touches only this one file.

`react-icons` (not `lucide-react` directly) is the underlying dependency
— it's a meta-package bundling many icon families (Lucide, Font Awesome,
Material Design, and others) under one npm dependency, so if a needed
icon doesn't exist in one family, a different family can be pulled in
from within this same file without adding a second package. Most icons
here happen to come from Lucide's set (`react-icons/lu`), but the adapter
is not limited to that one family.

```js
// adapters/icons/index.js
import { LuSearch, LuInfo, LuInbox, LuCircleAlert, LuCircleCheck, LuChevronLeft, LuChevronRight, LuChevronDown, LuCheck } from "react-icons/lu"
// If a needed icon isn't in Lucide's set, a different family is imported
// here instead, exported under the same kind of generic name, e.g.:
// import { FaSomething } from "react-icons/fa"

export const SearchIcon = LuSearch
export const InfoIcon = LuInfo
export const EmptyIcon = LuInbox
export const ErrorIcon = LuCircleAlert
export const SuccessIcon = LuCircleCheck
export const ChevronLeftIcon = LuChevronLeft
export const ChevronRightIcon = LuChevronRight
export const ChevronDownIcon = LuChevronDown
export const CheckIcon = LuCheck
```

A component's own icon needs (e.g. `StatusNotify`'s state-to-icon
mapping) import from this adapter, never from `react-icons` directly:
```js
// ✅ Correct
import { EmptyIcon, ErrorIcon, SuccessIcon, InfoIcon } from "@/adapters/icons"

// ❌ Wrong — direct third-party import outside adapters/
import { LuInbox, LuCircleAlert } from "react-icons/lu"
```

```js
// adapters/index.js
export * as http from "./http"
export * as router from "./router"
export * as query from "./query"
export * as validation from "./validation"
export * as uuid from "./uuid"
export * as notifications from "./notifications"
export * as storage from "./storage"
export * as icons from "./icons"
```

Consumers import from the adapter, never the raw library:
```js
// ✅ Correct
import { get, post } from "@/adapters/http"
import { useNavigation } from "@/adapters/router"
import { useFetch } from "@/adapters/query"
import { createSchema, string, validate } from "@/adapters/validation"
import { generateId } from "@/adapters/uuid"
import { notifySuccess, notifyError } from "@/adapters/notifications"
import { EmptyIcon, ErrorIcon } from "@/adapters/icons"

// ❌ Wrong — direct third-party import outside adapters/
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import * as yup from "yup"
import { v4 } from "uuid"
import { toast } from "sonner"
import { LuInbox } from "react-icons/lu"
```

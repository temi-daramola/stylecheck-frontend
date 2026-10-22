# Notifications Adapter (sonner)

```js
// adapters/notifications/index.js
import { toast } from "sonner"

export const notifySuccess = (message, options = {}) => toast.success(message, options)
export const notifyError = (message, options = {}) => toast.error(message, options)
export const notifyWarning = (message, options = {}) => toast.warning(message, options)
export const notifyInfo = (message, options = {}) => toast.info(message, options)
export const notifyLoading = (message, options = {}) => toast.loading(message, options)
export const dismissNotification = (id) => toast.dismiss(id)
```

Each function is prefixed (`notifySuccess`, not just `success`) since a
bare `success`/`error`/`info` would be a very generic, easily-colliding
name to have floating around global autocomplete once imported — the
prefix keeps every call site unambiguous about what it does without
needing to check the import.

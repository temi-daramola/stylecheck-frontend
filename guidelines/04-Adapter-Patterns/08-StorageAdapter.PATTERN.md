# Storage Adapter (`localStorage`)

Not a third-party library, but wrapped the same way for consistency —
every place `localStorage` is touched goes through this adapter, never
called directly from a module or `application/`. This matters
specifically for the auto-login flow, where `application/auth` needs to
read/write a stored email without reaching into a raw browser API itself.

```js
// adapters/storage/index.js
export const getItem = (key) => localStorage.getItem(key)
export const setItem = (key, value) => localStorage.setItem(key, value)
export const removeItem = (key) => localStorage.removeItem(key)
```

# Auth Pattern: Device-Bound Refresh Token

Only read this if [Auth Pattern Selection](01-FrontendAuthSelection.PATTERN.md)
confirmed this is the pattern for this project — and that the backend
is running its matching `09-Authentication-Patterns/
02-DeviceBoundRefreshToken.PATTERN.md`.

**Full flow-by-flow detail (every backend endpoint, every request/
response shape) lives in the standalone reference
[Device-Bound Refresh Token](04-DeviceBoundFlowReference.PATTERN.md).** This file maps that design
onto this project's established frontend conventions — the adapter
pattern, `common/hooks/`, `application/auth/` — rather than repeating
the flow narrative.

A refresh mechanism cryptographically bound to this specific browser via
a non-extractable WebCrypto key pair — a stolen device token alone is
useless without also possessing the private key, which never leaves the
browser and isn't even readable by this page's own JavaScript.

---

## 1. Two New Adapters Required

Neither exists yet in the standard 8-adapter set. Both follow the
established rule: a new native browser API gets its own adapter, same
reasoning as the `storage` adapter wrapping `localStorage`.

```js
// adapters/webcrypto/index.js
export const generateKeyPair = () =>
  crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"])

export const exportPublicKey = (keyPair) =>
  crypto.subtle.exportKey("jwk", keyPair.publicKey)

export const signPayload = async (privateKey, payload) => {
  const encoded = new TextEncoder().encode(JSON.stringify(payload))
  const signatureBuffer = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, encoded)
  return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
}
```

```js
// adapters/indexeddb/index.js
// Minimal wrapper — this project only ever stores one thing here (the
// device key pair), so a full generic IndexedDB abstraction isn't
// warranted; wrap exactly what's needed.
const DB_NAME = "auth-device-keys"
const STORE_NAME = "keypairs"

const openDb = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

export const getStoredKeyPair = async () => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const request = tx.objectStore(STORE_NAME).get("device-key-pair")
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}

export const storeKeyPair = async (keyPair) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).put(keyPair, "device-key-pair")
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
```

---

## 2. Storage Adapter — Stores a Device Token, Not an Email

Uses the existing `storage` adapter ([Storage Adapter](../04-Adapter-Patterns/08-StorageAdapter.PATTERN.md))
unchanged — only *what* gets stored differs from any other pattern:

```js
const DEVICE_TOKEN_KEY = "device_token"
```

---

## 3. Session Expiry — HTTP Adapter Interceptor

Unchanged from the base interceptor pattern already documented
([HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)) — a `401` still triggers `onSessionExpired`, still shows the
un-closable session-expiry modal. This pattern doesn't change that
mechanism, only what `attemptAutoLogin` (below) actually does.

---

## 4. Auth Services

```js
// modules/auth/services/AuthServices.js
import { post } from "@/adapters/http"

export const signupRequest = async ({ otp, publicKey }) => post("/auth/verify-otp", { otp, publicKey })
export const loginRequest = async ({ email, password, publicKey }) => post("/auth/login", { email, password, publicKey })
export const refreshRequest = async ({ deviceToken, signature }) => post("/auth/refresh", { deviceToken, signature })
export const logoutRequest = async ({ deviceToken }) => post("/auth/logout", { deviceToken })
```

```js
// modules/auth/index.js
export { LoginPage } from "./pages/login-page/LoginPage"
export { signupRequest, loginRequest, refreshRequest, logoutRequest } from "./services/AuthServices"
```

---

## 5. `useAuthLogic`

```js
// application/auth/useAuthLogic.js
import { useState, useCallback, useEffect } from "react"
import { setup } from "@/adapters/http"
import { useClearCache } from "@/adapters/query"
import { generateKeyPair, exportPublicKey, signPayload } from "@/adapters/webcrypto"
import { getStoredKeyPair, storeKeyPair } from "@/adapters/indexeddb"
import { getItem, setItem, removeItem } from "@/adapters/storage"
import { loginRequest, refreshRequest, logoutRequest } from "@/modules/auth"

const DEVICE_TOKEN_KEY = "device_token"

export const useAuthLogic = () => {
  const [user, setUser] = useState(null)
  const [isSessionExpired, setIsSessionExpired] = useState(false)
  const clearCache = useClearCache()

  useEffect(function () {
    const { eject } = setup({
      getToken: function () { return user?.token },
      onSessionExpired: function () { setIsSessionExpired(true) },
    })
    return eject
  }, [user])

  const login = useCallback(async function (credentials) {
    let keyPair = await getStoredKeyPair()
    if (!keyPair) {
      keyPair = await generateKeyPair()
      await storeKeyPair(keyPair)
    }
    const publicKey = await exportPublicKey(keyPair)

    const result = await loginRequest({ ...credentials, publicKey })
    setUser({ ...result.data.account, token: result.data.accessToken })
    setItem(DEVICE_TOKEN_KEY, result.data.deviceToken)
  }, [])

  const logout = useCallback(async function () {
    const deviceToken = getItem(DEVICE_TOKEN_KEY)
    if (deviceToken) {
      try { await logoutRequest({ deviceToken }) } catch { /* best-effort; clear client state regardless */ }
    }
    setUser(null)
    removeItem(DEVICE_TOKEN_KEY)
    // IndexedDB key pair deliberately NOT cleared — reused on next
    // login on this same device, see 08-Authentication-Patterns/04-DeviceBoundFlowReference Flow 5
    clearCache()
  }, [clearCache])

  const attemptAutoLogin = useCallback(async function () {
    const deviceToken = getItem(DEVICE_TOKEN_KEY)
    if (!deviceToken) return { outcome: "no-stored-session" }

    try {
      const keyPair = await getStoredKeyPair()
      if (!keyPair) return { outcome: "no-stored-session" } // device token with no local key — can't sign, treat as no session

      const signature = await signPayload(keyPair.privateKey, { deviceToken })
      const response = await refreshRequest({ deviceToken, signature })

      setUser({ ...response.data.account, token: response.data.accessToken })
      setItem(DEVICE_TOKEN_KEY, response.data.deviceToken)
      return { outcome: "success" }
    } catch (error) {
      if (error?.status === 401) {
        removeItem(DEVICE_TOKEN_KEY)
        return { outcome: "invalid-session" }
      }
      return { outcome: "retryable-error", message: error?.message }
    }
  }, [])

  return { user, isAuthenticated: !!user, isSessionExpired, login, logout, attemptAutoLogin }
}
```

---

## 6. `ProtectedRoute`

Unchanged in structure from the base pattern already established — the
only thing that differs between auth patterns is what `attemptAutoLogin`
(above) actually does internally. The component itself still: shows
`AuthLoadingLayout` while checking, calls `attemptAutoLogin` once on
mount if not already authenticated, redirects to login on failure.

---

## 7. `GuestRoute`

Unchanged — synchronous `isAuthenticated` check only, no auto-login, no
storage access. Identical regardless of which auth pattern is active.

---

## 8. `AuthLoadingLayout`

Unchanged — plain loading/retry UI, lives in `layouts/_common/` (no
co-located components).

---

## 9. Session-Expiry Modal

Unchanged — reads `isSessionExpired` from `useAuth()`, un-closable,
mounted once at `app`/`main` level.

---

## Audit Checklist

- [ ] `webcrypto` and `indexeddb` are only ever touched through their own
      adapters — never called directly elsewhere
- [ ] `localStorage` holds ONLY the device token for this pattern —
      never an email, never a raw key
- [ ] The IndexedDB key pair is never cleared on logout
- [ ] `attemptAutoLogin` is only ever called from `ProtectedRoute`, never
      as a global app-boot effect
- [ ] A `401` on an ordinary API call still goes through the same
      session-expiry interceptor path as any other pattern

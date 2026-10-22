# Auth Pattern: httpOnly Cookie + JWT

Only read this if [Auth Pattern Selection](01-FrontendAuthSelection.PATTERN.md)
confirmed this is the pattern for this project — and that the backend
is running its matching `09-Authentication-Patterns/
03-HttpOnlyCookieJWT.PATTERN.md`. **Only correct when frontend and
backend share an origin or true subdomains of one site** — check the
frontend and backend domains of every stage (staging included) before
assuming this pattern fits.

**Full flow-by-flow detail lives in the standalone reference
[httpOnly Cookie + JWT](05-HttpOnlyCookieFlowReference.PATTERN.md).** This file maps that design onto
this project's established frontend conventions.

Dramatically simpler than the Device-Bound pattern — no key pair, no
IndexedDB, no signature, and **nothing client-readable stored for the
refresh mechanism at all**. The refresh token lives only as an httpOnly
cookie; this page's own JavaScript can never read it, and the browser
attaches it automatically.

---

## 1. No New Adapters Required

Nothing here needs WebCrypto or IndexedDB. The `http` adapter needs one
addition — every request must send cookies:

```js
// adapters/http/index.js — addition
const client = axios.create({
  baseURL: EnvConfig.BASE_URL,
  withCredentials: true, // required for the browser to send/accept the httpOnly cookie
  headers: { "Content-Type": "application/json" },
})
```

---

## 2. No Client-Side Storage for Auth at All

Unlike every other pattern in this architecture, **the `storage` adapter
is not used for anything auth-related here.** There is nothing to store
client-side — the refresh token is invisible to and unmanaged by
frontend code entirely.

---

## 3. Session Expiry — HTTP Adapter Interceptor

Unchanged from the base interceptor pattern ([HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)) — a `401` still
triggers `onSessionExpired`, still shows the session-expiry modal.

---

## 4. Auth Services

```js
// modules/auth/services/AuthServices.js
import { post } from "@/adapters/http"

export const signupRequest = async (credentials) => post("/auth/signup", credentials)
export const loginRequest = async (credentials) => post("/auth/login", credentials)
export const refreshRequest = async () => post("/auth/refresh") // no params — cookie auto-attached
export const logoutRequest = async () => post("/auth/logout") // same — cookie identifies the session
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
import { loginRequest, refreshRequest, logoutRequest } from "@/modules/auth"

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
    const result = await loginRequest(credentials)
    setUser({ ...result.data.account, token: result.data.accessToken })
    // nothing to persist client-side — the browser already has the cookie
  }, [])

  const logout = useCallback(async function () {
    try { await logoutRequest() } catch { /* best-effort; clear client state regardless */ }
    setUser(null)
    clearCache()
  }, [clearCache])

  const attemptAutoLogin = useCallback(async function () {
    // No stored value to check first — there's nothing client-readable
    // to look at. Just attempt the call; the browser either has a
    // valid cookie or it doesn't.
    try {
      const response = await refreshRequest()
      setUser({ ...response.data.account, token: response.data.accessToken })
      return { outcome: "success" }
    } catch (error) {
      if (error?.status === 401) {
        return { outcome: "no-stored-session" } // no distinct "invalid" case —
                                                  // a 401 here always just means
                                                  // there was nothing valid to find
      }
      return { outcome: "retryable-error", message: error?.message }
    }
  }, [])

  return { user, isAuthenticated: !!user, isSessionExpired, login, logout, attemptAutoLogin }
}
```

---

## 6. `ProtectedRoute`

Unchanged in structure — still the only place `attemptAutoLogin` is
triggered, still shows `AuthLoadingLayout` while checking. Simpler in
practice here since `attemptAutoLogin` always runs (no "check storage
first" branch needed — there's nothing to check).

---

## 7. `GuestRoute`

Unchanged — synchronous `isAuthenticated` check only.

---

## 8. `AuthLoadingLayout`

Unchanged — plain loading/retry UI.

---

## 9. Session-Expiry Modal

Unchanged — reads `isSessionExpired` from `useAuth()`.

---

## Audit Checklist

- [ ] `withCredentials: true` is set on the `http` adapter's axios
      instance — without it, the cookie is never sent or accepted
- [ ] No device token, no key pair, nothing auth-related is ever written
      to `localStorage` or IndexedDB in this pattern
- [ ] `attemptAutoLogin` always attempts the call directly — there's no
      "check for a stored value first" branch, since nothing is stored
- [ ] A `401` still goes through the same session-expiry interceptor
      path as any other pattern

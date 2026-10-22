# HTTP Adapter (axios)

The backend responds with a consistent `{ status, message, data, code, requestId }` shape
on every response — success or error. This adapter's interceptor is
responsible for making sure that exact shape is what every consumer
downstream (services, controllers, `useForm`, pages) actually receives,
regardless of whether the backend responded at all.

```js
// adapters/http/index.js
import axios from "axios"
import { EnvConfig } from "@/common/constants"

const client = axios.create({
  baseURL: EnvConfig.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const setup = ({ getToken }) => {
  const requestInterceptor = client.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  const responseInterceptor = client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // The request reached the server and the server responded (even
        // if with an error status). error.response.data IS the backend's
        // own { status, message, data, code, requestId } payload — pass it through as-is,
        // don't wrap or rename anything.
        return Promise.reject(error.response.data)
      }

      // The request never got a response at all — server unreachable, no
      // internet, timeout. There is no backend payload to unwrap, since
      // nothing came back, so the adapter constructs the same shape
      // itself, matching what a real backend error would have looked
      // like — `status` is the string 'error', matching the backend's
      // own real convention (confirmed: the backend's ResponseUtils
      // always uses 'success'/'error' as a string, never an HTTP status
      // code) — not a raw HTTP status code number.
      const message =
        error.message === "Network Error"
          ? "Unable to connect to server. Please try again"
          : "Failed to connect to server. Please try again later."

      return Promise.reject({ status: "error", message, data: null })
    }
  )

  return {
    eject: () => {
      client.interceptors.request.eject(requestInterceptor)
      client.interceptors.response.eject(responseInterceptor)
    },
  }
}

export const get = (url, config = {}) => client.get(url, config).then((res) => res.data)
export const post = (url, data = {}, config = {}) => client.post(url, data, config).then((res) => res.data)
export const put = (url, data = {}, config = {}) => client.put(url, data, config).then((res) => res.data)
export const patch = (url, data = {}, config = {}) => client.patch(url, data, config).then((res) => res.data)
export const del = (url, config = {}) => client.delete(url, config).then((res) => res.data)
```

`setup` is called once, at app boot (in `main.jsx`, or inside
`application/auth` right after `AuthProvider` mounts), so the interceptor
can read the current token via `getToken`. `delete` is exported as `del`
since `delete` is a reserved word and cannot be a named export.

`get`/`post`/`put`/`patch`/`del` each resolve with `res.data` — this is
unwrapping **axios's own** response envelope (`{ data, status, headers,
config, ... }`), not the backend's. What comes out the other side is
exactly the backend's own `{ status, message, data, code, requestId }` payload, untouched.
Every service therefore receives that full envelope directly and returns
it as-is — see [Query Adapter](04-QueryAdapter.PATTERN.md) for where and how that envelope's inner `data` gets
unwrapped for consumption downstream.

A module's `services/` calls this adapter directly for requests — never
`axios` itself:
```js
// ✅ Correct
import { get, post } from "@/adapters/http"

// ❌ Wrong — direct third-party import outside adapters/
import axios from "axios"
```

## Why Failure-Shape Enforcement Belongs in the HTTP Adapter, Not
the Query Adapter

Axios wraps every response in its own generic envelope (`{ data, status,
headers, config, request, statusText }`) — the backend's actual payload
sits inside axios's `.data` property (or `error.response.data` on
failure), untouched by axios itself. React Query never reshapes anything
either — its `data`/`error` are simply whatever a service (the queryFn)
resolved with or threw. So the guarantee that a rejection always carries
`{ status, message, data, code, requestId }` has to be enforced at the one layer that
actually touches the raw response — the http adapter's interceptor — not
the query adapter.

**How the interceptor tells the two failure cases apart:** axios exposes
this structurally, not by inspecting message text —
- `error.response` exists → the server responded (even with an error
  status) → its body is the real backend payload.
- `error.response` is `undefined` → no response ever came back (server
  down, no internet, timeout) → there is no backend payload, so the
  adapter builds an equivalent one.

Either way, everything downstream — a service's `throw`, React Query's
`error`, a controller's pass-through, `useForm`'s `onSubmit` — always
receives the same `{ status, message, data, code, requestId }` shape, never the raw axios
envelope, and never has to know or check which of the two cases occurred.

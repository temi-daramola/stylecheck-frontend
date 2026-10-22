# Top-Level Wiring

`App.jsx` composes the router around the route tree. `main.jsx` composes
whatever app-level providers exist (from `application/`, see [Global / App-Wide State](09-GlobalState.PATTERN.md)) around
`App`. There is no container-building step and no two-stage boot sequence
— wiring is just composing providers and the router.

```jsx
// App.jsx
import { BrowserRouter } from "@/adapters/router"
import { AppRoutes } from "@/routes/AppRoutes"

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
```

```jsx
// main.jsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "@/components/ui/provider"
import { QueryClientProvider, queryClient } from "@/adapters/query"
import { AuthProvider } from "@/application"
import App from "@/App"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
)
```

`AuthProvider` is a resource provider — it's only present here because
auth is currently the only resource with app-level persisted state (see
[Global / App-Wide State](09-GlobalState.PATTERN.md)). A module with no app-level state (like invoice) adds no provider at
all. Additional resources needing app-level state (e.g.
`NotificationsProvider`) nest alongside `AuthProvider`, each still mounted
once, at the same tier:

```jsx
<AuthProvider>
  <NotificationsProvider>
    <App />
  </NotificationsProvider>
</AuthProvider>
```

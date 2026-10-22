# Unexpected Failures — One Error Boundary per Layout

An error boundary is a component that catches JavaScript errors thrown
during rendering anywhere in its subtree, and shows a fallback UI instead
of the whole app crashing to a blank screen. React requires this to be a
class component — there is no hook equivalent — but this is the one
deliberate exception; nothing else in the codebase needs to be a class.

```jsx
// common/components/ErrorBoundary.jsx
import { Component } from "react"

export class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>
    }
    return this.props.children
  }
}
```

Placed once per layout, wrapping only the `<Outlet />` where the active
page renders — not one single global boundary in `main.jsx`. This means a
render crash on one page only takes out that page's content; the
surrounding shell (sidebar, navbar) stays intact and the user can still
navigate away.

```jsx
// layouts/dashboard-layout/DashboardLayout.jsx
import { ErrorBoundary } from "@/common/components"

export const DashboardLayout = () => (
  <div>
    <Sidebar />
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  </div>
)
```

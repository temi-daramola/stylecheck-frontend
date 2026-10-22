# Access Gating Pattern

A generic, standalone pattern for blocking access to part of the UI
until some condition is met — **not authentication.** `ProtectedRoute`/
`GuestRoute` (either auth pattern file) answer "is this user logged in
at all"; this pattern answers a completely different, independent
question: "has this already-authenticated user met some other
requirement" (a completed business profile, a verified identity, an
active subscription — whatever the app actually needs). The two systems
share no code and have no dependency on each other.

**The core move:** one boundary instead of many leaves. Rather than
every page under a requirement remembering to check it, one layout route
wraps the whole group and enforces it once.

---

## The Four Jobs

```
 DECIDE  →  APPLY  →  COMMUNICATE  →  RESOLVE
(policy)  (enforce)   (presentation)  (recovery)
```

---

## 1. Decide — Facts In, One Named State Out

A single function takes whatever facts the gate cares about, plus which
requirement level this route group needs, and returns exactly one named
state — never a boolean, never the raw facts passed through:

```js
// app-specific — e.g. modules/merchant-onboarding/getLock.js
// The LADDER itself, and what each level means, is entirely app-specific.
// What's reusable is the SHAPE: facts in, one named state out, first
// failing condition wins.
const LADDER = ["setup", "payouts"]

export const getLock = (facts, requires) => {
  const requiredIndex = LADDER.indexOf(requires)
  for (let i = 0; i <= requiredIndex; i++) {
    const level = LADDER[i]
    if (!facts[level]) return level // first failing condition wins
  }
  return "none"
}
```

**Why a ladder, not independent flags:** each level implies the one
before it — requiring `"payouts"` already requires `"setup"` to be true
first. A new level slots in above or below the existing ones without
touching the function's shape. **This only fits conditions that
genuinely build on each other.** Two independent requirements that don't
imply one another (e.g. "has agreed to terms" and "has verified email,"
neither implying the other) don't fit a single ladder — that case needs
its own, separate shape, not a forced ordering.

**Everything downstream reads the named state, never the raw facts.**
The apply/communicate/resolve steps below never see `facts` directly —
only whatever `getLock` returned.

---

## 2. Apply — Enforce at the Boundary, Not the Leaves

A layout route wraps the whole group. Nothing inside has to cooperate or
remember anything — a page that forgets this requirement entirely is
still covered, because the check never depended on that page doing
anything.

```jsx
// layouts/gated-layout/GatedLayout.jsx
import { Outlet, useLocation } from "react-router-dom"
import { BlurOverlay } from "@/common/components/BlurOverlay"
import { AccessGateModal } from "./AccessGateModal"
import { useGateState } from "./useGateState"

export const GatedLayout = ({ getLock, requires, presentationTable }) => {
  const location = useLocation()
  const { state, isLoading } = useGateState(getLock, requires)

  if (isLoading) return <AuthLoadingLayout /> // same loading component either gate uses, no new one needed

  const isLocked = state !== "none"

  return (
    <>
      <BlurOverlay active={isLocked}>
        <Outlet />
      </BlurOverlay>
      {isLocked && (
        <AccessGateModal state={state} originPath={location.pathname} presentationTable={presentationTable} />
      )}
    </>
  )
}
```

```jsx
// routes.jsx — usage: the gate wraps a GROUP of routes, not one page
<Route element={<GatedLayout getLock={getLock} requires="payouts" presentationTable={PAYOUT_GATE_TABLE} />}>
  <Route path="/orders" element={<OrdersPage />} />
  <Route path="/payouts" element={<PayoutsPage />} />
</Route>
```

**`BlurOverlay` has zero policy knowledge — it only knows `active`:**

```jsx
// common/components/BlurOverlay.jsx
import { Box } from "@chakra-ui/react"

export const BlurOverlay = ({ active, children }) => (
  <Box
    filter={active ? "blur(4px)" : "none"}
    pointerEvents={active ? "none" : "auto"}
    transition="filter 0.15s ease"
    aria-hidden={active}
  >
    {children}
  </Box>
)
```

Because it only takes a boolean, it's reusable for anything "visible but
not usable" — a loading state, a read-only mode, a maintenance banner —
not just this one gating use case.

**Cover, don't redirect.** The page still renders underneath the blur —
the merchant keeps their place and whatever context the page held,
rather than being yanked to a different screen. This is a deliberate,
different choice from how `ProtectedRoute` handles its own, unrelated
case (a genuine redirect to `/login`) — the two situations call for
different UX, which is part of why this is its own pattern rather than
a variant of that one.

**The layout rendering the page (`ContentLayout` or equivalent) has no
access code in it at all.** It doesn't know this gate exists, same as it
doesn't know about any other cross-cutting concern — presentation
components never need to change when policy does.

---

## 3. Communicate — One State-to-Presentation Table, Not One Component Per State

```js
// app-specific
const PAYOUT_GATE_TABLE = {
  setup: {
    size: "md",
    title: "Complete your business profile",
    description: "We need a few more details before you can view orders or payouts.",
    buttonLabel: "Go to Business Profile",
    buttonAction: "/settings/business-profile",
  },
  payouts: {
    size: "md",
    title: "Set up payouts",
    description: "Connect a payout method to start accepting orders.",
    buttonLabel: "Set Up Payouts",
    buttonAction: "/settings/payouts",
  },
}
```

A third lock level is one new row in this table — never a new component.

**The modal is blocking for the page, not for the app.** Reuses the
existing `Dialog` component (`05-UI-Component-Patterns/`)
exactly as the un-closable session-expiry modal does — `showCloseButton={false}`,
`closeOnEscape={false}`, `closeOnInteractOutside={false}` — **plus one
addition that case doesn't need**: `backdropPointerEvents="none"`, so
clicks pass through to the app shell behind it. Without this, `Dialog`'s
standard backdrop captures every click, which would also lock the
sidebar and nav — this gate is meant to block one page, not the whole
app.

```jsx
// layouts/gated-layout/AccessGateModal.jsx
import { useNavigate } from "react-router-dom"
import { Dialog } from "@/common/components/Dialog"
import { Button, Text } from "@chakra-ui/react"

export const AccessGateModal = ({ state, originPath, presentationTable }) => {
  const navigate = useNavigate()
  const { size, title, description, buttonLabel, buttonAction } = presentationTable[state]

  const handleResolve = () => {
    navigate(buttonAction, { state: { from: originPath } }) // see §4 — this is the return-to-origin handoff
  }

  return (
    <Dialog
      open
      size={size}
      title={title}
      showCloseButton={false}
      closeOnEscape={false}
      closeOnInteractOutside={false}
      backdropPointerEvents="none"
      footer={<Button onClick={handleResolve}>{buttonLabel}</Button>}
    >
      <Text color="body.muted">{description}</Text>
    </Dialog>
  )
}
```

---

## 4. Resolve — the Way Out Lives Outside the Lock, and Returns to Origin

**The pages that resolve a lock (here, Business Profile, Payout Setup)
must be siblings of the gated group in the route tree, never nested
inside it.** A lock that gates its own fix traps the user with no way
out:

```jsx
// routes.jsx — the resolving pages sit OUTSIDE GatedLayout's children
<Route path="/settings/business-profile" element={<BusinessProfilePage />} />
<Route path="/settings/payouts" element={<PayoutsPage />} />

<Route element={<GatedLayout getLock={getLock} requires="payouts" presentationTable={PAYOUT_GATE_TABLE} />}>
  <Route path="/orders" element={<OrdersPage />} />
</Route>
```

**Return to origin:** the modal handed `{ state: { from: originPath } }`
to `navigate()` when sending the merchant to resolve the lock (§3). The
resolving page reads it back and returns there once done:

```jsx
// pages/business-profile/BusinessProfilePage.jsx
import { useNavigate, useLocation } from "react-router-dom"

export const BusinessProfilePage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? "/dashboard" // sensible default if opened directly, not via a gate

  const handleSaved = () => {
    navigate(from)
  }
  // ...
}
```

**Any interrupt flow needs this, not just this one gate** — email
verification, terms acceptance, anything that temporarily routes a user
away from where they were headed owes them a way back to exactly that
place, not just "the dashboard."

---

## 5. Chain of Gates, Each Independent, Each Answering One Question

Nothing stops more than one `GatedLayout` existing in the same app, each
wrapping its own route group, each with its own `getLock`/`requires`/
presentation table — a subscription-tier lock and this onboarding lock
can both exist, independently, neither aware the other exists. Each one
only ever answers its own one question.

---

## Cross-Cutting: the UI Is Advisory, the Server Is Authority

**This is the one rule here that isn't about the UI at all, and it's
not optional.** The blur is a visual affordance only — it does not, by
itself, stop a request from reaching an endpoint it shouldn't. **Every
action this gate blocks visually must be independently re-checked and
rejected server-side, every time, regardless of what the frontend
currently renders.** See the backend's
`14-Authorization-Patterns/01-GateStateComputation.PATTERN.md` and
`02-ServerSideGateEnforcement.PATTERN.md` for the matching server-side
half of this — computing the same state the frontend does, and
independently enforcing it on every protected action.

---

## Universal vs. App-Specific

| Universal (this file) | App-specific (stays in the app) |
|---|---|
| The layout-route gate shape | The actual rule (`setup`, `payouts`, or whatever this app needs) |
| `BlurOverlay` | The modal's wording and sizes |
| State-to-presentation table shape | Which pages belong in which gated group |
| Exempt zone + return-to-origin | The specific resolving pages and their routes |
| The requirement-ladder shape | The actual ladder order and level names |

---

## Where Else This Applies

- A "trial expired" lock for subscription tiers
- Unverified email or incomplete identity checks
- A locked section for a role missing a specific permission
- A locked area during planned maintenance

---

## Limits

- **Needs one real boundary.** Only works if the wrapped `Outlet` genuinely
  contains everything that should be locked — a page rendered outside
  that boundary isn't covered, no matter how correct `getLock` is.
- **The ladder is linear.** Two independent conditions that don't imply
  each other don't fit this shape — see §1.
- **Pages still mount and fetch behind the blur.** The blur is visual
  only; the page's own data-fetching still runs underneath it. If that's
  a real cost (an expensive query, a side-effecting fetch), that's a
  separate problem this pattern doesn't solve on its own.

---

## Audit Checklist

- [ ] `getLock` returns one named state, never a boolean or the raw facts
- [ ] The gate wraps a layout route (a whole group), never checked
      individually inside each page
- [ ] `BlurOverlay` has no policy knowledge — only ever receives `active`
- [ ] The modal uses `backdropPointerEvents="none"` — confirmed the rest
      of the app shell stays clickable, not just that the modal itself
      won't dismiss
- [ ] Every page that resolves a lock is a route-tree sibling of the
      gated group, never nested inside it
- [ ] Return-to-origin is wired via navigation state, not hardcoded to
      one fixed destination
- [ ] The same state this gate computes is independently re-verified
      server-side before any blocked action is allowed to execute

---

## Related Patterns
- [Overlays](../05-UI-Component-Patterns/05-Overlays.PATTERN.md) — `Dialog`, the `backdropPointerEvents` addition
- [Router Adapter](../04-Adapter-Patterns/03-RouterAdapter.PATTERN.md) — router adapter (`useNavigate`/`useLocation`)
- Backend: `14-Authorization-Patterns/01-GateStateComputation.PATTERN.md`, `02-ServerSideGateEnforcement.PATTERN.md`

---

**One boundary, one named state, one table — and the server independently enforces every bit of it.**

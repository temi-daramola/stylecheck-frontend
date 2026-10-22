# Form Validation — a Reusable Hook in `common/hooks/`, Not the UI Components

Every form needs the same flow: track field values, run validation
against a schema on submit, show errors, block the actual submit call
until valid, clear errors as fields are corrected — and, once the actual
submit request is made, surface a server-side failure (validation
rejection, or the request failing outright) through that exact same error
state. Rewriting this per module would duplicate the same logic in every
form hook. This flow lives as one shared hook — `useForm`, in
`common/hooks/` — separate from the validation adapter ([Validation Adapter](../04-Adapter-Patterns/05-ValidationAdapter.PATTERN.md)), since the
adapter's job is only building and running schemas, not managing form
state, submission flow, or error state.

**One unified error state, regardless of source.** A form exposes exactly
two pieces of error state — per-field `errors` and a single `formError`
shown above the form — and both are populated the same way no matter
where the failure came from. The page never branches on whether a failure
was client-side or server-side; it only ever reads `errors` and
`formError`.

- **Client-side validation fails** → `errors` = the schema's per-field
  messages, `formError` = a generic constructed summary.
- **The submit request is made and the server responds with field
  validation errors** → `errors` = `error.data` (the field map from the
  http adapter's `{ status, message, data, code, requestId }` shape, [HTTP Adapter](../04-Adapter-Patterns/02-HttpAdapter.PATTERN.md)), `formError` =
  `error.message`.
- **The server responds with a generic/non-field error, or the request
  never reaches the server at all** → `error.data` is empty, so `errors`
  stays empty, and only `formError` = `error.message` is set.

**The required flow:**
- Errors do not appear until the first submit attempt.
- On submit: run client-side validation first. If invalid, populate
  `errors`/`formError` from the schema, and do not call the actual submit
  function.
- After the first submit attempt, each field re-validates live as it
  changes, so its individual error clears as soon as it becomes valid.
- Only once client-side validation passes does the actual submit function
  get called (typically a module's service call via the query adapter's
  `useSubmit`, wrapped by `application/` for resources with shared state
  like auth — see [Global / App-Wide State](../02-Architecture-Patterns/09-GlobalState.PATTERN.md)).
- If that submit call throws, its rejection — already shaped as
  `{ status, message, data, code, requestId }` by the http adapter — is written into the
  same `errors`/`formError` state client validation uses, so the page
  renders both cases identically.

A module's own form hook (e.g. `useLoginForm`) doesn't reimplement any of
this — it only supplies the module-specific pieces (`initialValues`,
`schema`, what `onSubmit` should do) to the shared hook.

**`resetOnSuccess` (default `false`) — opt-in reset back to
`initialValues` after a successful submit.** Most forms should stay
exactly as they are after submitting — an edit form should keep showing
the values just saved, a login form navigates away entirely. A create
form is the deliberate exception: the pattern for "create another one
immediately" is to clear the form back to blank, ready for the next
entry, rather than leaving stale submitted values on screen (see
[Create flow](09-CreateFlow.PATTERN.md) for the worked create-flow
example). Because the default is `false`, no existing usage (login, edit
forms) changes behavior — only a form that explicitly opts in resets.

```js
// common/hooks/useForm.js
import { useState } from "react"
import { validate } from "@/adapters/validation"

export const useForm = ({ initialValues, schema, onSubmit, resetOnSuccess = false }) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const runValidation = async (currentValues) => {
    const result = await validate(schema, currentValues)
    setErrors(result.errors ?? {})
    setFormError(result.success ? "" : "Please fix the errors below")
    return result.success
  }

  const handleChange = async (field, value) => {
    const newValues = { ...values, [field]: value }
    setValues(newValues)

    // Only live-validate after the first submit attempt, so errors don't
    // appear before the user has tried to submit once.
    if (hasAttemptedSubmit) {
      await runValidation(newValues)
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    setHasAttemptedSubmit(true)

    const isValid = await runValidation(values)
    if (!isValid) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)

      // Only runs if onSubmit resolved successfully (no throw) — a form
      // that opted in gets cleared back to its starting state, ready for
      // the next entry.
      if (resetOnSuccess) {
        setValues(initialValues)
        setErrors({})
        setFormError("")
        setHasAttemptedSubmit(false)
      }
    } catch (error) {
      // error is already { status, message, data, code, requestId } — guaranteed by the
      // http adapter's interceptor (04-Adapter-Patterns/02-HttpAdapter), whether this was a real
      // backend rejection or a network failure that never reached the
      // server. Written into the SAME state client validation uses, so
      // the page renders both cases identically.
      setErrors(error?.data ?? {})
      setFormError(error?.message ?? "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, formError, isSubmitting, handleChange, handleSubmit }
}
```

```js
// common/hooks/index.js
export { useForm } from "./useForm"
```

`onSubmit` must be a function that returns a genuine promise and rejects
on failure — when wiring a mutation into `useForm` ([Mutations](06-MutationsOverview.PATTERN.md)), use React
Query's `mutateAsync`, not the fire-and-forget `mutate`, since
`handleSubmit`'s `await onSubmit(values)` inside a `try/catch` depends on
that behavior.

A worked example wiring `useForm` together with the validation adapter, a
module's form hook, and the `Input` component is a planned addition to
this guidelines set (Phase 3 — component/logic adaptation), once the
UI component set is finalized.

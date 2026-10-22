# When Something Belongs in `common/`

`common/` holds genuinely shared UI/utils/hooks used by 2+ modules — but
without a clear rule for *when* something graduates there, it tends to
either stay nearly empty (duplicated logic sitting in multiple modules) or
turn into a dumping ground for things only one module ever actually used.

**Rule: promote to `common/` only on the second real usage, never in
anticipation of one.**

Build something inside the module that needs it first. Only move it into
`common/` once a *second* module genuinely needs the same thing — at that
point, generalize it against the two real call sites (remove anything
specific to the first module, e.g. hardcoded text or prop names), then
update both modules to import the shared version.

```
// modules/invoice/components/StatusBadge.jsx   ← built here first
// ...second module (e.g. contact) later needs the same thing...
// common/components/StatusBadge.jsx            ← moved here, generalized
```

**Why this direction and not the reverse:** guessing what might be reused
tends to produce shared code shaped around a guess rather than real usage
— a first version built for one module's needs usually isn't actually
reusable as-is. Waiting for a genuine second usage means the abstraction
gets shaped by two real call sites instead of being repeatedly reshaped
every time a new consumer reveals the first guess was wrong.

**Exception — genuinely generic, ownerless primitives.** Some things never
start inside a module because no module is a sensible first owner: a base
`Button`, `Modal`, `Input`, a `formatDate` util, or the adapters-facing
wrapper hooks. These go directly into `common/` from day one. The
duplication-first rule applies to things that *could* plausibly start as
module-owned but turn out to be shared — not to obviously generic
building blocks that were never going to belong to one module in the
first place.

**Where the sub-rules live:** environment variables and color config — [Environment Variables and Design Colors](../03-Configuration-Patterns/01-EnvAndColorConfig.PATTERN.md); base UI components — [Base UI Component wrapping](../05-UI-Component-Patterns/01-BaseComponentWrapping.PATTERN.md); the reusable form validation hook — [Form Validation hook](../06-Data-Patterns/11-FormValidationHook.PATTERN.md).

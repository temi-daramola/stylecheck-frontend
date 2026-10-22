# Base UI Components — Wrapped in `common/components/`, Same Principle as Adapters

Base UI primitives (`Input`, `Select`, `Textarea`, `Button`, `Checkbox`,
and similar) are ownerless — no single module is a sensible first owner —
so they live directly in `common/components/` from day one, same as the
exception already stated in [When Something Belongs in `common/`](../02-Architecture-Patterns/05-CommonFolderRules.PATTERN.md).

**The rule, independent of whichever UI library is in use:** a base
component wraps the UI library's component and exposes **your own** prop
API, not a bare pass-through. This is the exact same principle as an
adapter ([Adapter Principles](../04-Adapter-Patterns/01-AdapterPrinciples.PATTERN.md)) — the library can be swapped later (e.g. Chakra → MUI)
without every consumer changing — just applied to a UI component instead
of a hook or a plain function.

Concretely, this means:

- **No hardcoded content.** Label text, error text, placeholder text —
  anything that varies per use — is a prop, never a literal baked into the
  component. A component that only ever renders as one specific field
  (e.g. always labeled "Email") isn't reusable and shouldn't exist as a
  shared component.
- **No hardcoded state.** Validation/error state (e.g. `invalid`) is a
  prop driven by whatever produced it upstream (typically a module's form
  hook, built using the validation adapter from [Validation Adapter](../04-Adapter-Patterns/05-ValidationAdapter.PATTERN.md)) — never hardcoded
  to a fixed value.
- **Correct prop forwarding.** The component takes the full incoming
  props object (`(props) => ...` or `({ ...props }) => ...`) so anything
  not explicitly destructured still reaches the underlying library
  component — a component that silently drops unrecognized props is a
  bug, not a design choice.
- **Your own naming for the component and its props**, even where the
  underlying library's prop names would work as-is — this is what keeps
  the wrapper genuinely swappable, not just a renamed re-export.

The full implementation of this rule using Chakra UI (the UI library
currently in use) is in `05-UI-Component-Patterns/` —
covering every base component this architecture uses, not just form
inputs. Because the rule above is written independent of any specific
library, swapping UI libraries later means replacing that companion
file's implementation — this rule and every consumer of
`common/components/` stays unchanged. A parallel Tailwind CSS
implementation of the same component set is the next planned addition.

## Chakra UI Implementation Notes

This file is purely the implementation of specific UI-library components,
following the wrapping rule established in [Base UI Component wrapping](01-BaseComponentWrapping.PATTERN.md)
(own prop API, no hardcoded content, no hardcoded state, full prop
forwarding) — nothing else. It does not cover hooks in general
(`useForm` and similar live in [Form Validation hook](../06-Data-Patterns/11-FormValidationHook.PATTERN.md), since
they're library-agnostic), and it does not cover how these components
wire into existing logic (forms, mutations, etc.) — that's a separate,
later discussion. **Two narrow exceptions:** `useDisclosure` is included
here, immediately before the two alert components, since it exists
specifically to support their dismiss behavior and is easiest to
understand right next to its first real consumers — it is still fully
library-agnostic (plain `useState`, no Chakra dependency) and belongs in
`common/hooks/` in the real project, same as any other hook.
`useSidebarCollapse` (in the Sidebar section) is a different kind of
exception — it's genuinely layout-specific, not a `common/hooks/`
candidate at all, and lives co-located inside `layouts/dashboard-layout/`
alongside the component it exists to support.

Every prop table/enum below was verified against Chakra UI's current (v3)
documentation before being written here — not assumed from memory or
older tutorials, since Chakra has renamed a number of props between v2
and v3 (`isLoading` → `loading`, `colorScheme` → `colorPalette`,
`leftIcon`/`rightIcon` → children, among others).

A parallel Tailwind CSS implementation of this same component set,
sharing the same prop APIs where practical, is the next planned addition
to this guidelines set.

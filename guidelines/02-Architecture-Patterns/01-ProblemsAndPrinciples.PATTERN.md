# Problems This Architecture Solves

This category is the source of truth for how React projects are structured: the rules, the folder layout, and every piece of infrastructure that applies across the whole app rather than to one specific resource. For full worked, end-to-end code applying these rules to two contrasting resources, see [Worked Example](11-WorkedExample.PATTERN.md).

1. **Fragile imports** — moving a file breaks every relative import path
   pointing at it.
2. **Tight coupling between modules** — modules reach directly into each
   other, so changing one silently breaks another.
3. **Modules reaching into each other's internals** — no clear line between
   "this is public API" and "this is a private implementation detail."
4. **Uncontrolled third-party library usage** — a library imported directly
   all over the codebase is painful and risky to swap or upgrade later.
5. **Bundle size / load performance** — without deliberate structure, apps
   tend to load all feature code upfront regardless of which page the user
   is actually on.

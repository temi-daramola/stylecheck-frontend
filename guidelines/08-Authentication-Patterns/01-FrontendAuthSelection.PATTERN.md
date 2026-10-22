# Auth Pattern Selection

**Read this before implementing or auditing anything auth-related.** This
project's architecture supports more than one authentication pattern —
never assume one. Confirm which pattern applies to this specific project
before reading further or writing any auth code.

---

## The Rule

**Do not default to a pattern. Ask which one applies to this project,
then read that pattern's file in full, before writing any authentication
code.** These are matched frontend+backend *pairs* — the chosen pattern
must be the same on both sides. A project cannot mix, for example, a
Device-Bound backend with an httpOnly-Cookie-pattern frontend; the two
halves only work together as designed.

---

## Available Patterns

| Pattern | File | Fits when |
|---|---|---|
| Device-Bound Refresh Token | [Auth Pattern: Device-Bound Refresh Token](02-DeviceBoundFrontend.PATTERN.md) | Frontend and backend may be deployed on different domains/sites, or multi-device session management (per-device revocation) is needed |
| httpOnly Cookie + JWT | [Auth Pattern: httpOnly Cookie + JWT](03-HttpOnlyCookieFrontend.PATTERN.md) | Frontend and backend share an origin or true subdomains of one site; simpler, fewer moving parts |

Both are fully specified, production-grade patterns — **neither is "the
old way" or "the new way."** Which one is correct depends entirely on
this project's actual deployment topology and session requirements, not
on recency. The cross-site cookie constraint — whether frontend and
backend share a site in every stage, staging included — most often
decides which one fits.

**[Permission Gating](../09-Access-Control-Patterns/01-PermissionGating.PATTERN.md) applies regardless of which
pattern is chosen** — it's unaffected by the auth pattern, since it only
checks permission strings on an already-authenticated user.

---

## The Required Step Before Writing Any Auth Code

1. **Ask**: "Which authentication pattern applies to this project —
   Device-Bound Refresh Token or httpOnly Cookie + JWT?" Confirm this
   matches whatever the backend is actually using — do not assume.
2. **Read that pattern's file in full** before writing anything.
3. Everything else in this architecture (adapters, components, resource
   forms, etc.) applies identically regardless of which pattern is
   chosen — only the auth-specific pieces differ.

---

## Audit Checklist

- [ ] Was the pattern explicitly confirmed — against what the backend
      actually uses — rather than assumed?
- [ ] Does the implementation match ONE pattern consistently, not a mix
      (e.g. storing a device token in `localStorage` *and* relying on an
      httpOnly cookie would be redundant, not "extra security")?
- [ ] Does the chosen pattern's own file's Audit Checklist pass?

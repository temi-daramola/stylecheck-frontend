# httpOnly Cookie + JWT — Generic Auth Flow Reference

A standalone, project-agnostic reference for a common auth pattern:
short-lived JWT access tokens paired with a refresh token delivered as
an httpOnly cookie. Written generically, with no project-specific
naming, so it can be handed to any project where this pattern is
actually the right fit.

**This is not "the old, wrong way."** It's a completely standard, secure
pattern in the right context. See "When this pattern fits" before
assuming it doesn't apply to whatever you're building next.

**Status:** Flows 1 through 5 (Sign Up, Log In, Refresh, Password Reset
Session Invalidation, Logout) are all worked through in full below —
Flows 4 and 5 were added after review of the original version of this
document identified the same two gaps already found and fixed in the
companion device-bound reference ([Device-Bound Refresh Token](04-DeviceBoundFlowReference.PATTERN.md)):
no session invalidation on password reset, and no logout flow. Flow 3
was also corrected — refresh-token rotation (with reuse detection) is
now the required default behavior, not an optional hardening step, per
RFC 9700's requirement that public-client refresh tokens be either
sender-constrained or rotated.

---

## Terminology

- **Access token** — short-lived JWT (e.g. 15 min), sent as a standard
  `Authorization: Bearer <token>` header, kept in frontend memory only.
  Same role as in the device-token pattern — nothing different here.
- **Refresh token** — a long-lived, random, opaque value. Unlike the
  device-token pattern, this *is* sent to the client as a literal
  refresh token — but as an **httpOnly cookie**, meaning no JavaScript,
  on this page or any other, can ever read its value. The browser
  attaches it automatically on requests to the matching domain; frontend
  code never touches it directly.
- **Account** — generic stand-in for whatever your user/account model is
  called.

---

## Flow 1: Sign Up

1. Person submits registration details (email, password, etc.).
2. Backend creates the account, hashes the password.
3. Backend issues both tokens: an access token (returned in the JSON
   body) and a refresh token (set as an httpOnly cookie in the response
   headers — never appears in the body at all).
4. Frontend keeps the access token in memory. The refresh token cookie
   is invisible to and unmanaged by frontend code — the browser stores
   and sends it automatically from here on.

### Backend

```js
app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);
  const account = await Account.create({ email, passwordHash });

  const refreshToken = randomBytes(32).toString("hex");
  const refreshTokenHash = createHash("sha256").update(refreshToken).digest("hex");

  await RefreshToken.create({
    account: account._id,
    tokenHash: refreshTokenHash,
    expiresAt: addDays(new Date(), 30)
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict", // safe here specifically because frontend and
                         // backend share the same site — this is the
                         // one thing that stops holding true the moment
                         // they're on separate domains (see "When this
                         // pattern doesn't fit")
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/auth"
  });

  const accessToken = jwt.sign({ accountId: account._id }, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });

  res.json({ accessToken, account: { id: account._id, email: account.email } });
});
```

### Frontend

```js
const { data } = await axios.post("/auth/signup", { email, password }, {
  withCredentials: true // required for the browser to accept and store
                         // the Set-Cookie header — without this, the
                         // cookie is silently dropped
});

// data.accessToken → keep in memory
// the refresh token cookie needs no handling here at all
```

---

## Flow 2: Log In

Same shape as Sign Up, minus account creation — check credentials
instead, then issue both tokens identically.

### Backend

```js
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const account = await Account.findOne({ email });
  if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const refreshToken = randomBytes(32).toString("hex");
  const refreshTokenHash = createHash("sha256").update(refreshToken).digest("hex");

  // One record per account (simplest version of this pattern — a new
  // login just replaces the previous one). Per-device records, like the
  // device-bound pattern's RefreshRecord, are possible here too, but
  // add meaningfully more complexity — not needed unless multi-device
  // session management specifically matters for what you're building.
  await RefreshToken.findOneAndUpdate(
    { account: account._id },
    { tokenHash: refreshTokenHash, expiresAt: addDays(new Date(), 30) },
    { upsert: true }
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/auth"
  });

  const accessToken = jwt.sign({ accountId: account._id }, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });

  res.json({ accessToken, account: { id: account._id, email: account.email } });
});
```

### Frontend

```js
const { data } = await axios.post("/auth/login", { email, password }, {
  withCredentials: true
});
// data.accessToken → memory
```

---

## Flow 3: Refresh (silent auto-login)

This is the entire point of the pattern, and it's dramatically simpler
than the device-token version — there's no key pair, no signature, no
localStorage/IndexedDB management on the frontend at all.

1. App loads with no access token in memory.
2. Frontend just calls the refresh endpoint directly — it doesn't need
   to read or send anything itself; the browser automatically attaches
   the httpOnly cookie to any request to a matching origin.
3. Backend reads the cookie, hashes it, looks up the matching record,
   checks it's unexpired **and not already used**.
4. Valid → issue a fresh access token **and a fresh refresh token**,
   marking the old one used. Invalid, expired, or already-used →
   revoke the account's refresh tokens and fall back to the login
   screen.

**Rotation on every refresh is required here, not optional — this
isn't a stylistic choice.** RFC 9700 (the IETF's current OAuth 2.0
security standard) states refresh tokens for public clients — which a
browser-based app is — **must** either be sender-constrained or use
rotation. This pattern has no sender-constraining mechanism at all (that's
specifically what the device-bound pattern adds instead), so rotation is
the only way this design meets that bar. An earlier version of this
document called rotation "optional hardening" — that was incorrect.

**Rotation alone isn't the point — reuse detection is.** The actual
security value comes from what rotating lets you detect: if a refresh
token is ever presented a second time after it's already been rotated,
that's a strong signal a copy exists somewhere it shouldn't — the
account's sessions get revoked, exactly like the device-bound pattern's
theft response.

### Backend

```js
app.post("/auth/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
  const record = await RefreshToken.findOne({ tokenHash });

  if (!record || record.expiresAt < new Date()) {
    return res.status(401).json({ error: "Session expired" });
  }

  if (record.used) {
    // Already rotated once before — this presentation is either a
    // stale retry or a stolen copy. Either way, don't trust it: revoke
    // every refresh token this account has outstanding.
    await RefreshToken.deleteMany({ account: record.account });
    res.clearCookie("refreshToken", { path: "/auth" });
    return res.status(401).json({ error: "Session revoked, please log in again" });
  }

  record.used = true;
  await record.save();

  const newRefreshToken = randomBytes(32).toString("hex");
  const newRefreshTokenHash = createHash("sha256").update(newRefreshToken).digest("hex");

  await RefreshToken.create({
    account: record.account,
    tokenHash: newRefreshTokenHash,
    used: false,
    expiresAt: addDays(new Date(), 30)
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/auth"
  });

  const accessToken = jwt.sign({ accountId: record.account }, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });

  res.json({ accessToken });
});
```

### Frontend

```js
// Called automatically on app load whenever there's no access token in memory
const { data } = await axios.post("/auth/refresh", {}, { withCredentials: true });
// data.accessToken → memory
// the new refresh-token cookie needs no handling here either — the
// browser replaces the old one automatically, same as Flow 1/2
```

**Worth knowing, not fixed here:** since the cookie is shared across
every tab of the browser the same way `localStorage` is, this pattern
has the same structural shape as the cross-tab race condition found and
fixed in the device-bound reference (two tabs both refreshing around the
same time, one presenting an already-rotated token to the other's
request). Not fixed in this document, since it wasn't the specific gap
raised here — if it becomes a real problem in practice, the same two
fixes apply: a `navigator.locks`-based wrapper around the refresh call
on the frontend, and a short grace window on `used` checks on the
backend, both documented in [Device-Bound Refresh Token](04-DeviceBoundFlowReference.PATTERN.md).

---

## Flow 4: Password Reset — Session Invalidation

**Not a full auth flow of its own** — the actual password reset
mechanism (requesting it, verifying it, whatever authorizes setting a
new password) is project-specific and isn't covered here, same
referencing approach used throughout this document. This section covers
only the one thing the original version of this reference was missing:
what happens to existing sessions when a password reset completes.

**The gap this closes:** without this, a refresh token issued *before* a
password compromise stays fully valid even *after* the compromised
password itself is fixed — the whole point of resetting a compromised
password is undermined if whatever session already exists keeps working
regardless.

**The fix — one line, added wherever the password reset flow already
sets the new `passwordHash`:**

```js
// Wherever the existing password-reset flow finishes hashing and
// saving the new password:
await RefreshToken.deleteMany({ account: account._id });
```

`deleteMany`, not `deleteOne` — even though the base pattern above uses
one record per account, per-device records are a noted optional
variation (see Flow 2); `deleteMany` handles either case correctly
without needing to know which one a given project actually uses.

---

## Flow 5: Logout

**What happens, in order:**
1. User clicks "log out."
2. Frontend sends the request — no token to read or attach manually,
   the browser sends the httpOnly cookie automatically, same as every
   other request to this origin.
3. Backend reads the cookie, deletes the matching `RefreshToken` record,
   and clears the cookie itself.
4. Frontend has nothing else to clean up — unlike the device-bound
   pattern's logout, which has to deliberately decide what to keep (an
   IndexedDB key pair) vs. clear (a device token), this pattern never
   stored anything client-readable in the first place.

### Backend

```js
app.post("/auth/logout", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    await RefreshToken.deleteOne({ tokenHash });
  }

  // path must match exactly what was used when the cookie was
  // originally set (see Flow 1/2 above) — a common, easy-to-miss bug:
  // clearCookie silently does nothing if the path (or any other
  // cookie-scoping option) doesn't match what the cookie actually has.
  res.clearCookie("refreshToken", { path: "/auth" });
  res.json({ success: true });
});
```

### Frontend

```js
await axios.post("/auth/logout", {}, { withCredentials: true });
// nothing else to clean up
```

---

## Data model: RefreshToken

```
RefreshToken
  account     ObjectId → Account
  tokenHash   String — SHA-256 hash; the raw value only ever exists as
              the httpOnly cookie itself, never stored in plain form
  used        Boolean, default false — flips true on first use. Required
              now that Flow 3 rotates on every refresh (RFC 9700) — a
              token presented again after this is already true signals
              reuse, not a valid retry.
  expiresAt   Date
```

---

## When this pattern fits

- **Frontend and backend share an origin** — a monolith where the same
  server renders pages and serves the API, or a frontend and backend
  deployed on the same domain or true subdomains of one shared root
  (e.g. `app.example.com` and `api.example.com`, both under
  `example.com`).
- Server-rendered apps generally, where the browser is already making
  same-origin requests as a matter of course.
- Projects that don't need multiple independent devices to each hold
  their own separately-revocable session — one refresh token per account
  is enough.

If any of these don't hold, re-check before defaulting to this pattern.

## When this pattern doesn't fit — and why

**The one thing this entire pattern depends on:** the browser has to
treat the cookie as belonging to the site currently being viewed. The
moment frontend and backend live on genuinely separate domains, the
cookie becomes cross-site — and Safari blocks cross-site cookies by
default, unconditionally, as a standing platform policy, not a
configurable heuristic. No cookie attribute or clever header fixes this.
`SameSite=None; Secure` doesn't help either — it's what a cross-site
cookie requires just to be considered at all, and Safari still blocks it
regardless. Any product with separate-domain frontend/backend hosting
and a meaningful Safari/iOS user base will hit this directly — worth
checking hosting plans against this pattern's requirement *before*
committing to it, not after.

---

## Known limitations, stated honestly

**Strong protection against a stolen token being read and copied.**
Because the value is httpOnly, no JavaScript — including injected
malicious code — can ever read it at all. There's nothing to
exfiltrate, full stop. This is actually a stronger baseline against
passive theft than a client-readable value ever can be, rotation or not.

**No protection against a live, actively-running malicious script
triggering a request.** An httpOnly cookie stops *reading*, not
*sending* — if malicious code is running on the page, it can still
trigger a request, and the browser will attach the cookie automatically,
the same as it would for a real click. No auth mechanism — cookie-based
or otherwise — fully closes this specific gap. The real defense is
preventing malicious code from running on the page at all (safe
rendering of external content, a strict Content-Security-Policy),
unrelated to which auth pattern is used.

**A real tradeoff worth naming, specific to this pattern: CSRF
exposure.** Because the browser attaches the cookie automatically to
*any* matching-origin request — including one triggered by a completely
different, unrelated website the person happens to have open in another
tab — a malicious third-party page can potentially trigger authenticated
requests without ever touching the cookie's value at all. `SameSite=Strict`
(used above) closes most of this by refusing to attach the cookie to
cross-site-initiated requests in the first place, but for state-changing
endpoints, a dedicated CSRF token is the standard additional layer if the
stakes justify it. Client-held-token patterns (a token explicitly read
from storage and attached by frontend JavaScript, rather than sent
automatically by the browser) don't have this specific exposure, since
another origin's script can't read this origin's storage at all — worth
weighing against this pattern's cross-domain limitation above when
choosing between the two.

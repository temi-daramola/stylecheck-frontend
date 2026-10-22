# StyleCheck frontend

React (Vite) + Chakra UI v3 app for StyleCheck supervisors.

Architecture rules live in [`guidelines/`](guidelines/01-Master-Index/01-INDEX.md) (start at the index). Key ones: third-party libraries are imported only in `src/adapters`, the UI library only in `src/common/components`, colors only from `src/common/constants/Colors.js`, and modules are imported only through their `index.js`. `npm run lint` enforces these.

## Setup
```bash
npm install
cp .env.example .env.development
npm run dev        # http://localhost:5173
```

| Variable | Notes |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL including `/api` (dev: `http://localhost:5000/api`) |

The backend must be running and allow this origin (`FRONTEND_URL` on the backend).

## Scripts
- `npm run dev`: dev server
- `npm run build`: production build into `dist/`
- `npm run lint`: ESLint, including the import-boundary rules

## Screens
`/login`, `/forgot-password`, `/reset-password`, `/dashboard`, `/results/:checkId`, `/share/:checkId`, `/settings`, and `/admin` (admins only: add supervisors, resend invites, deactivate or reactivate accounts).

The style manual is read in the browser (pdf.js for PDF, mammoth for DOCX) and only its text is sent to the backend. A scanned PDF has no text layer and is rejected with a message before anything is sent.

## Session
The refresh token is an httpOnly cookie the page cannot read. The short-lived access token lives in memory and is refreshed automatically before it expires. Refresh tokens are single use, so all refreshes share one in-flight request.

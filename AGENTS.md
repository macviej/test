<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This is a single self-contained Next.js 16 (App Router, Turbopack) app — `imago-app`, a conference registration + QR ticket + admin/Q&A web app. There are no databases, containers, or external services; the frontend, API route handlers, and data layer all run in the one dev process. Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`).

- Dev server runs on **port 3002** (not the default 3000): `npm run dev` serves at `http://localhost:3002`.
- Data persists to gitignored JSON files under `data/` (`participants.json`, `questions.json`), auto-created on first write, with an in-memory fallback when file writes fail. Delete files under `data/` to reset state; ticket codes (`IGC-2026-NNN`) increment from stored data.
- Admin auth is a self-contained HMAC cookie session with safe dev defaults, so no `.env` is needed to run. Defaults: `ADMIN_LOGIN=admin`, `ADMIN_PASSWORD=admin`, `ADMIN_SECRET=imago-dev-secret` (override via env vars from `.env.example`). Admin login page: `/admin/login`.
- `npm run lint` currently reports 2 pre-existing `react-hooks/set-state-in-effect` errors (in `src/app/qa/page.tsx` and `src/app/admin/qa/page.tsx`) plus `<img>` warnings. These are unrelated to environment setup.
- The QR scanner check-in page (`/admin/scanner`) uses `html5-qrcode` and needs camera access, so it is hard to exercise headlessly.

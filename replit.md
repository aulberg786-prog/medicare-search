# MediCare Search

A medicine information app for Pakistani families — search any medicine name and get uses, dosage, side effects, and precautions in English, Roman Urdu, or Urdu Script. Connected to Firebase Firestore and powered by Gemini AI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/medicare-search run dev` — run the frontend (port 23713)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secret: `GEMINI_API_KEY` — Google Gemini AI API key (from aistudio.google.com)
- Required secrets (Firebase): `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/medicare-search)
- API: Express 5 (artifacts/api-server)
- DB: PostgreSQL + Drizzle ORM (medicine_history table)
- AI: Google Gemini 2.5 Flash via direct REST API
- Firebase: Firestore (saves searches to medicine_searches collection)
- Languages: English, Roman Urdu, Urdu Script (RTL supported)
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/medicine_history.ts` — DB schema for search history
- `artifacts/api-server/src/routes/medicine.ts` — medicine search route (Gemini + DB)
- `artifacts/medicare-search/src/pages/home.tsx` — main page orchestration
- `artifacts/medicare-search/src/components/` — header, search-hero, medicine-result, recent-searches
- `artifacts/medicare-search/src/lib/firebase.ts` — Firebase initialization (guarded against missing config)

## Architecture decisions

- Gemini AI is called server-side (API server) to keep the API key secure — not from the browser
- Firebase Firestore saves searches client-side (in addition to PostgreSQL), only when Firebase is configured
- Firebase initialization is guarded: checks for required env vars before init, so app degrades gracefully if not configured
- Search history is stored in both PostgreSQL (via API) and Firestore (via Firebase SDK)
- Language context (english/romanUrdu/urduScript) is managed via React Context; RTL applied for urduScript

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Firebase VITE_ env vars must be prefixed with `VITE_` to be exposed to the Vite frontend
- Do NOT change `info.title` in openapi.yaml — it controls generated filenames
- After DB schema changes: run `pnpm --filter @workspace/db run push` then restart API server

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

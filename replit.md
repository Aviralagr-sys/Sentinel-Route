# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 (existing), Python FastAPI (Sentinel Route backend)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Leaflet

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── sentinel-route/     # React + Vite frontend (Sentinel Route app)
├── server/                 # Python FastAPI backend
│   ├── main.py             # FastAPI server with safety scoring engine
│   └── delhi_dataset.json  # Delhi area safety dataset (25 areas, 8 routes)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Sentinel Route App

### Architecture
- **Frontend**: React + Vite at `/` (artifacts/sentinel-route)
  - Leaflet maps with safety heatmap overlay
  - Split-screen UI: map on left, sidebar on right
  - Temporal Sentiment toggle for nighttime score adjustment
  - Route comparison: Fastest vs Sentinel Safe routes
  - Route Personality tags (Well-lit, Police Patrolled, etc.)
- **Backend**: Python FastAPI at port 5000 (server/)
  - Safety Scoring Engine: 15-point deduction per negative keyword
  - Temporal mode: extra penalty for poorly-lit areas 10PM-10AM
  - Local JSON dataset with 25 Delhi areas and mock Google Maps reviews
  - Vite dev server proxies `/pyapi` to Python backend

### API Endpoints (Python FastAPI)
- `GET /api/health` — Health check
- `GET /api/areas?temporal=bool` — All areas with safety scores
- `GET /api/routes` — List all available routes
- `GET /api/route/{route_id}?temporal=bool` — Route details with comparison
- `GET /api/area/{area_id}?temporal=bool` — Single area details
- `POST /api/score` — Recalculate all scores

### Safety Scoring
- Base score: 100
- Deduction: -15 per negative keyword (dark, secluded, deserted, unsafe, no lighting, isolated, creepy, dangerous)
- Temporal penalty: -20 (poor lighting) or -10 (moderate lighting) during 10PM-10AM
- Score range: 0-100

### Workflows
- `artifacts/sentinel-route: web` — Vite dev server (port from PORT env var)
- `Python Backend` — FastAPI server (port 5000)
- `artifacts/api-server: API Server` — Express server (port 8080)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — package A depends on B → A's tsconfig lists B in references

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build`
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly`

## Packages

### `artifacts/sentinel-route` (`@workspace/sentinel-route`)

React + Vite frontend for the Sentinel Route safety navigation app. Uses Leaflet for maps, Tailwind CSS for styling.

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server (existing, not used by Sentinel Route).

### `server/` (Python FastAPI)

Python backend serving safety data. Not a pnpm workspace package — runs independently via uvicorn.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package.

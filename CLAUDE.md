# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PriceTrack — auto-collect, visualize, and alert on product prices. Firebase backend + Gatsby frontend. No TypeScript anywhere — pure JavaScript.

## Structure

Three independent npm packages (not workspaces, no shared node_modules):

- `functions/` — Firebase Cloud Functions (Express). Scraper configs in `config/`, function modules in `modules/`, shared utils in `utils/`
- `hosting/` — Gatsby 2.x frontend (React 16). Pages in `src/pages/`, components in `src/components/`
- `worker-functions/` — Standalone Koa server that reuses functions modules

Each has its own `package.json` and `package-lock.json`. Install and run commands per-directory.

## Commands

```bash
# Functions
cd functions && npm run lint          # eslint .
cd functions && npm run serve         # firebase serve --only functions
cd functions && npm test              # mocha (configured, but no test files exist)

# Hosting
cd hosting && npm run lint            # eslint .
cd hosting && npm run develop         # gatsby develop (proxies /api to localhost:5000)
cd hosting && npm run build           # rm -rf public && gatsby build

# Deploy (requires FIREBASE_TOKEN)
cd functions && npm run deploy        # firebase deploy --only functions
cd hosting && npm run deploy          # firebase deploy --only hosting
```

## Code Style

ESLint only — no Prettier, no Biome.

**functions/** — extends `eslint:recommended` + `eslint-config-standard`. Node env, ES2022.

**hosting/** — extends `airbnb-base`. Key overrides vs airbnb defaults:
- Single quotes required (`quotes: [2, "single"]`)
- `comma-dangle: 0`, `eol-last: 0`, `no-multiple-empty-lines: 0`
- `no-param-reassign: ["error", { props: false }]` — mutating param properties is allowed
- `arrow-parens: ["error", "always"]`
- `no-underscore-dangle: 0`, `no-shadow: 0`

## Local Development

1. Export Firebase config: `firebase functions:config:get > functions/.runtimeconfig.json`
2. Start functions: `cd functions && npm run serve`
3. Start frontend: `cd hosting && npm run develop`

Firebase config vars are set via `firebase functions:config:set` (not `.env`). See `env.example.sh` for the full list.

## CI/CD

- Push to `master` → auto-deploy functions (if `functions/**` changed) and hosting (if `hosting/**` changed)
- `releases/*` branches → deploy everything (functions + hosting + database/storage/firestore rules)
- PRs → lint both `functions/` and `hosting/`
- Renovate bot manages dependency updates with auto-merge for minor/patch

## Node Version

Node 20 (see `.nvmrc`). All `engines.node` fields enforce `^20`.

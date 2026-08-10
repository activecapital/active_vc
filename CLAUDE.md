# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Uses yarn (yarn.lock is checked in):

```bash
yarn install      # install dependencies
yarn dev          # dev server at http://localhost:3000
yarn lint         # next lint
yarn build        # runs `next lint & next build`
```

There is no test suite.

## What this is

The Active Capital (VC firm) marketing site plus a self-editing admin CMS: an AI chat editor at `/admin/editor` that can modify both site content (Supabase) and this repository's own files (via the GitHub API). Next.js 16 App Router, React 19, Tailwind 4, TypeScript, deployed on Vercel.

## Branch / environment model

Two branches map to two Vercel deployments and **two separate Supabase projects**:

- `staging` branch → staging.active.vc → staging Supabase project
- `main` branch → production → production Supabase project

`VERCEL_ENV === "production"` is the switch (see `lib/supabase.ts`):

- `getSupabase()` — always the **staging** DB (service role). All admin editing APIs write here.
- `getProductionSupabase()` — production DB, used only by publish/versioning.
- `getPublicSupabase()` — what public reads use: production DB in production, staging DB otherwise.

The AI editor's file edits are committed to the `staging` branch through `lib/github-api.ts` (not the local checkout). Publishing (`/api/admin/publish`) copies staging DB content → production DB, saves a semver snapshot to `content_versions`, and/or merges `staging` → `main` on GitHub (`action: "db" | "git" | "both"`), which triggers the production deploy. Chat transcripts are appended as markdown to `admin_ai_conversations/` and committed to `main`.

## Content model

Editable content lives in the `site_content` key/value table; `lib/content.ts` defines the `SiteContent` shape and `DEFAULT_CONTENT` fallbacks used when the DB is unreachable or a key is missing. The public homepage (`app/page.tsx`, a client component) fetches it from `/api/content`. Version history lives in `content_versions` (see `supabase/migrations/`).

Everything else on the page — portfolio companies, testimonials, logos, characteristics — is static data in `app/src/*.ts`, not the database. Presentational components are in `app/components/`.

## Auth and middleware

- `proxy.ts` (Next 16's middleware, matches all paths) refreshes the Supabase session on every request and enforces a 1-hour max session age on `/admin` routes. Its comment about keeping `getUser()` immediately after client creation is load-bearing.
- Admin login is Supabase OTP (email or phone) restricted to the `admin_users` table; server routes use `lib/supabase-server.ts` (cookie-based SSR client).
- All admin API routes go through `lib/rate-limit.ts` (in-memory per-route configs; Upstash Redis optional in production).

## Conventions

- Path alias `@/*` maps to the repo root (so `@/lib/content`, not `@/src/lib/...`).
- Required env vars are documented in `env.example` (Anthropic key, GitHub token, and the staging/production Supabase pairs).

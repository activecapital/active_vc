# Architecture

The public layout in `app/layout.tsx` renders the navigation, hero, page content,
and footer. `app/page.tsx` composes the remaining sections and keeps client-side
analytics and carousels. Both hero and homepage import the same `SITE_CONTENT`
constant from `lib/content.ts`, so content is present in the initial HTML without
a client fetch, environment switch, or database connection.

`app/components/` contains presentation, including team and advisors. `app/src/`
contains portfolio and testimonial records. Static assets are in `public/`.
The October 29, 2026 production content export is retained in
`content/production-snapshot.json` for migration provenance and regression checks.

The only application API, `app/api/subscribe/route.ts`, sends newsletter requests
to Beehiiv using server-side credentials. `lib/rate-limit.ts` uses in-memory
counters scoped to each running process. Distributed rate limiting is not used.

`proxy.ts` builds a per-request Content Security Policy with `lib/csp.ts`, forwards
the nonce to Next.js, and supplies the pathname used for the homepage canonical.
Security headers and staging crawler protection remain in `next.config.mjs`.

Vercel deploys `staging` and `main` from Git. All environments render the same
source-controlled content. Content editing, previewing, reviewing, and publishing
now follow normal source changes and deployment. Historical CMS code remains
recoverable through Git history; no hosted data was deleted.

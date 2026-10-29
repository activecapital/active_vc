# Active Capital

The Active Capital marketing website uses Next.js 16, React 19, TypeScript, and
Tailwind CSS 4. All page content and assets live in this repository.

## Getting started

Use Node.js 24 and Yarn:

```bash
yarn install --frozen-lockfile
yarn dev       # http://localhost:3000
yarn test      # production content, HTML sanitization, and CSP regressions
yarn build     # production build and TypeScript validation
yarn start     # serve the production build
```

No environment variables are required to render the site. Newsletter subscriptions
use the Beehiiv credentials documented in [env.example](./env.example).

## Updating content

Edit `lib/content.ts` for the hero, Pat's introduction, firm description, approach,
and contact copy. Portfolio companies and testimonials live in `app/src/`;
team members and advisors live in `app/components/`. Images live in `public/img/`.
Changes go through Git and deployment.

The initial hardcoded copy was read directly from production on October 29, 2026
and compared with the live website's content API. The content-only export,
including original update timestamps, is in `content/production-snapshot.json`.
It contains no credentials. The content regression test compares the initial copy
against that snapshot; intentionally update the test when publishing new copy.

## Deployment

The `staging` branch deploys to staging.active.vc and `main` deploys to active.vc.
Both use the same checked-in content. The site has no admin interface, login,
content API, database client, migrations, or remote publishing controls.
The former hosted databases were not changed by this code migration.

The only application API is `POST /api/subscribe`, which forwards newsletter
subscriptions to Beehiiv. Its rate limiter is process-local and requires no data
store. Limits are per server instance and reset on restart or serverless cold start.

## Security and indexing

`proxy.ts` supplies a fresh CSP nonce to Next.js and the Google Tag Manager script
on every request. HTML sanitization remains enabled for authored marketing copy.
`vercel.json` retains Node module compatibility for that sanitizer.

`app/robots.ts` disallows crawling outside production. `next.config.mjs` adds
`X-Robots-Tag: noindex, nofollow` to preview responses and staging.active.vc,
including static files. The homepage canonical URL is https://active.vc/.

# Active Capital

A one-page Next.js 16 website using React 19, TypeScript, and Tailwind CSS 4.
All copy is hardcoded in the page and components.

## Development

Use Node.js 24 and Yarn:

```bash
yarn install --frozen-lockfile
yarn dev       # http://localhost:3000
yarn test      # CSP regression checks
yarn build     # production build and TypeScript validation
yarn start     # serve the production build
```

No environment variables are needed to render the page. Newsletter subscriptions
use the Beehiiv credentials in [env.example](./env.example).

## Editing the site

- `app/page.tsx`: Pat's introduction, About, contact copy, and page sections.
- `app/components/TopHeroCard.tsx`: hero heading and subtitle.
- `app/components/HowWeInvest.tsx`: the six approach items.
- `app/components/`: team, advisors, newsletter, navigation, and footer.
- `app/src/`: portfolio companies and testimonials.
- `public/img/`: images and logos.

Marketing copy is ordinary JSX text. There is no content object, content API,
HTML injection, CMS, authentication system, or database dependency. The original
production export from October 29, 2026 remains recoverable in Git history.

## Deployment

The `staging` branch deploys to staging.active.vc; `main` deploys to active.vc.
Both render the same source-controlled copy.

The only application API, `POST /api/subscribe`, forwards subscriptions to Beehiiv.
Its rate limiter is process-local and resets on restart or serverless cold start.

`proxy.ts` supplies CSP nonces to Next.js and Google Tag Manager. Security headers
and staging's `noindex, nofollow` protection live in `next.config.mjs`.
The homepage canonical URL is https://active.vc/.

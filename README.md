# RagAdvise Site Assistant — Shopify App

A free, public Shopify app that adds the [RagAdvise](https://ragadvise.com) AI site
assistant to a merchant's storefront. The widget is installed through a **theme app
extension app embed block** — the merchant toggles it on in the theme editor and pastes
their workspace slug. No Liquid editing, no `ScriptTag`, loads on every page.

Built on the official [`@shopify/shopify-app-react-router`](https://shopify.dev/docs/api/shopify-app-react-router)
template (React Router 7, App Bridge, Polaris web components, Prisma session storage).

## How it works

```
Merchant installs app (OAuth)
        │
Admin page (app/routes/app._index.tsx) → "Open theme editor"
        │
Theme editor → App embeds → enable "RagAdvise Site Assistant" → paste Workspace slug → Save
        │
Theme app extension (extensions/ragadvise-widget) injects before </body> on every page:
   <script src="https://ragadvise-agent-widget.pages.dev/embed.js" data-workspace-slug="…" async></script>
```

The app itself requests **no access scopes** and stores **no customer data** — it only
injects the storefront loader. The only persisted data is the OAuth session row (Prisma),
deleted on `app/uninstalled` and `shop/redact`.

## Project structure

```
app/                          React Router app (embedded admin + OAuth + webhooks)
  routes/app._index.tsx       Merchant setup page (theme-editor deep link + steps)
  routes/webhooks.*           app/uninstalled, app/scopes_update, and the three
                              mandatory GDPR compliance webhooks
  shopify.server.ts           shopifyApp() config (AppStore distribution)
extensions/ragadvise-widget/  Theme app extension
  blocks/ragadvise-widget.liquid   App embed block (target: body) + settings
  shopify.extension.toml
prisma/schema.prisma          Session storage (SQLite dev; use Postgres in prod)
shopify.app.toml              App config + webhook subscriptions
```

## Prerequisites

- Node `>=20.19 <22 || >=22.12`
- A [Shopify Partner](https://partners.shopify.com) account
- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) (`npm i -g @shopify/cli`)
- A development store

## Local development

```sh
npm install
npm run dev          # Shopify CLI: creates/links the app, tunnels, injects env vars
```

On first run the CLI walks you through creating the app in your Partner Dashboard and
links it (writing `client_id` + URLs into `shopify.app.toml`). Open the preview URL,
install on your dev store, then use the **Setup** page to enable the app embed.

## Deploy (Vercel)

The embedded app is hosted on **Vercel** (React Router 7 SSR via the
[`@vercel/react-router`](https://vercel.com/docs/frameworks/frontend/react-router) preset
in `react-router.config.ts`). Session storage uses **Postgres** (SQLite can't persist on
serverless) — Neon or Vercel Postgres both work.

1. **Provision a Postgres database** (e.g. Neon) and copy its pooled connection string.
2. **Import the repo into Vercel** as a new project. Vercel auto-detects React Router.
   `vercel.json` runs `prisma db push && react-router build`, which creates the `Session`
   table on first deploy.
3. **Set Vercel env vars** (all environments):
   - `DATABASE_URL` — the Postgres pooled connection string
   - `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` — from the app in the Dev Dashboard
   - `SHOPIFY_APP_URL` — your Vercel production URL (e.g. `https://ragadvise-shopify.vercel.app`)
   - `SCOPES` — empty
   - `THEME_APP_EXTENSION_UUID` — from `shopify app deploy` output (optional; enables the
     admin deep-link)
4. **Point Shopify at the Vercel URL**: set `application_url` and `[auth].redirect_urls` in
   `shopify.app.toml` to the Vercel URL, then run `npm run deploy` to push the config +
   theme extension to Shopify.

> Local dev (`npm run dev`) also needs `DATABASE_URL` now (Postgres), since the session
> store is no longer SQLite. Point it at a dev Postgres / Neon branch.

## App Store submission notes

- **Compliance webhooks** (`customers/data_request`, `customers/redact`, `shop/redact`)
  are subscribed in `shopify.app.toml` and handled under `app/routes/webhooks.*` — required
  for every public app.
- **Scopes**: none requested; justify in the listing as "storefront widget via theme app
  extension; no Admin API access required."
- The app is **embedded** and uses **App Bridge** + **Polaris web components**, per current
  App Store requirements.

## References

- Theme app extensions: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions
- App embed blocks (target `body`): https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration
- shopify-app-react-router: https://shopify.dev/docs/api/shopify-app-react-router
- Privacy / GDPR webhooks: https://shopify.dev/docs/apps/build/privacy-law-compliance

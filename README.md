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

## Deploy

1. **Create the app** in the Partner Dashboard (or let `npm run dev` create it), then
   `npm run config:link` to populate `shopify.app.toml`.
2. **Host the web app** (any Node host — Fly.io, Render, Railway, a container, etc.).
   For production, switch Prisma to Postgres in `prisma/schema.prisma` and set
   `DATABASE_URL`. A `Dockerfile` is included (`npm run docker-start` runs migrations +
   serves).
3. Set env vars on the host: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`,
   `SCOPES` (empty), and update `application_url` / `[auth].redirect_urls` in
   `shopify.app.toml` to the host URL.
4. **Deploy the extension + config**: `npm run deploy`. Capture the theme app extension
   UUID from the output and set `THEME_APP_EXTENSION_UUID` so the admin page can deep-link
   merchants to the pre-activated embed.

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

# Astro Paywall Template Service

Standalone iframe template service built with Astro SSR, Vite, and Tailwind 4.
It serves embeddable paywall and survey templates through stable route contracts.

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start local dev:

   ```bash
   npm run dev
   ```

3. Verify health route:

   ```bash
   curl -i http://localhost:4321/local_health
   ```

4. Run the full validation pass:

   ```bash
   npm run verify
   ```

## Endpoints

- `/local_health` returns `200` and body `ok`.
- `/templates/paywall` renders the default plan dialog.
- `/templates/paywall_sitewide` fetches campaign payloads and returns `204` for ineligible or invalid data.
- `/templates/paywall_free_week` renders the free-week conversion template.
- `/templates/paywall_free_group` renders the group-upgrade template.
- `/templates/not_ready_to_upgrade_survey` renders the not-ready survey template.

## Runtime Integration Contracts

- Templates include `/iframeResizer.contentWindow.min.js` for iframe sizing compatibility.
- Parent compatibility events are preserved via `postMessage`: `closePaywall` and `closeDialog`.
- Outbound CTAs use `target="_parent"` so host apps control navigation.

## Environment Variables

Copy `.env.example` to `.env` and override values as needed.

- `APP_BASE_URL`
- `APP_API_URL`
- `CAMPAIGN_SERVICE_URL`
- `DASHBOARD_URL`
- `WORKSPACE_URL`
- `LEGAL_COOKIES_URL`

## Scripts

- `npm run dev` starts the Astro dev server.
- `npm run typecheck` runs `astro check`.
- `npm run test` runs route and helper tests with Node test runner.
- `npm run build` creates production output.
- `npm run verify` runs typecheck, tests, and build in sequence.
- `npm run deploy:vercel` deploys to Vercel production.

## Vercel Deployment

1. Authenticate once:

   ```bash
   npx vercel login
   ```

2. Deploy:

   ```bash
   npm run deploy:vercel
   ```

3. Configure required env vars in the Vercel project settings:
   - `APP_BASE_URL`
   - `APP_API_URL`
   - `CAMPAIGN_SERVICE_URL`
   - `DASHBOARD_URL`
   - `WORKSPACE_URL`
   - `LEGAL_COOKIES_URL`

## Next.js Host Demo

A simple host app lives in `host-next` and opens this paywall in a modal iframe.

1. Start Astro in this directory:

   ```bash
   npm run dev
   ```

2. Start the Next.js host:

   ```bash
   cd host-next
   npm install
   npm run dev
   ```

3. Open `http://localhost:3000` and click **Open paywall**.

# Next.js Host App

Simple host application with a landing page button that opens the Astro paywall inside a modal iframe.

## Run locally

1. In the Astro service root (`astro-paywall`):

   ```bash
   npm run dev
   ```

2. In this folder (`astro-paywall/host-next`):

   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:3000` and click **Open paywall**.

## Configuration

Copy `.env.example` to `.env.local` to point to a different paywall URL.

```bash
cp .env.example .env.local
```

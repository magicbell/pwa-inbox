# PWA Inbox

A Progressive Web Application that provides a real-time notification inbox, powered by [MagicBell](https://www.magicbell.com/).

Each visitor gets a unique inbox URL with server-generated authentication. On mobile, the app can be installed as a PWA with push notification support.

## Stack

- **Preact 10** with SSR via `preact-render-to-string`
- **Hono** for server-side routing
- **Vite 6** with `@cloudflare/vite-plugin` and `@preact/preset-vite`
- **Tailwind CSS 4** via `@tailwindcss/vite`
- **Cloudflare Workers** for deployment
- **MagicBell** for notifications, inbox UI, and web push

## Getting Started

### Prerequisites

- Node.js 18+
- A [Cloudflare](https://dash.cloudflare.com/) account
- MagicBell API credentials (API key and secret)

### Setup

```sh
npm install
```

Create a `.dev.vars` file with your MagicBell credentials:

```
API_KEY=your_api_key
API_SECRET=your_api_secret
```

### Development

```sh
npm run dev
```

### Deploy

```sh
npm run deploy
```

Before your first deploy, set the production secrets:

```sh
npx wrangler secret put API_KEY
npx wrangler secret put API_SECRET
```

## How It Works

1. Visiting `/` generates a unique ID and redirects to `/:id`
2. The worker generates a JWT token for the inbox and SSR-renders the page
3. The client hydrates with the MagicBell Inbox component
4. On mobile, a dialog prompts to enable push notifications via PWA install
5. On desktop, a dialog shows a QR code for mobile setup and a curl snippet for testing

## Project Structure

```
src/
  index.tsx          # Worker entry point (Hono routes, SSR)
  client.tsx         # Client entry point (hydration)
  App.tsx            # Main Preact component
  styles.css         # Tailwind + MagicBell style overrides
  components/        # UI components (Dialog, SendTestButton, etc.)
  lib/               # Shared utilities (JWT, echo, badge sync, etc.)
  templates/         # Service worker template
```

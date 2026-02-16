import { Hono } from "hono"
import { renderToString } from "preact-render-to-string"
import { App } from "./App"
import { generateToken } from "./lib/jwt"
import {
  createSignedId,
  verifySignedId,
  createWriteId,
  verifyWriteId,
  readIdFromNanoid,
} from "./lib/signed-id"
import { serviceWorkerScript } from "./templates/sw"
import { SendForm } from "./components/SendForm"
import type { Bindings } from "./lib/types"

const app = new Hono<{ Bindings: Bindings }>()

// Static assets
app.get("/assets/*", (c) => c.env.ASSETS.fetch(c.req.raw))
app.get("/src/*", (c) => c.env.ASSETS.fetch(c.req.raw))

// Root: serve OG tags for social crawlers, redirect everyone else
const crawlerPattern =
  /facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Redditbot/i

app.get("/", async (c) => {
  const ua = c.req.header("user-agent") || ""
  if (crawlerPattern.test(ua)) {
    const origin = new URL(c.req.url).origin
    return c.html(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PWA Inbox</title>
  <meta property="og:title" content="PWA Inbox" />
  <meta property="og:type" content="website" />
  <meta property="og:description" content="PWA Inbox — a Progressive Web Application powered by MagicBell" />
  <meta property="og:url" content="${origin}/" />
  <meta property="og:image" content="${origin}/sharing-banner.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${origin}/sharing-banner.png" />
</head>
<body></body>
</html>`)
  }

  const token = await createSignedId(c.env.API_SECRET)
  return c.redirect(`/${token}`)
})

// Manifest
app.get("/:id{[A-Za-z0-9_-]{14}}/manifest.json", (c) => {
  const id = c.req.param("id")
  return c.json({
    name: "PWA Inbox",
    short_name: "PWA Inbox",
    description:
      "PWA Inbox — a Progressive Web Application powered by MagicBell",
    start_url: `/${id}`,
    scope: `/${id}`,
    display: "standalone",
    theme_color: "#6E56CF",
    background_color: "#23283b",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/ios/16.png", sizes: "16x16", type: "image/png" },
      { src: "/icons/ios/32.png", sizes: "32x32", type: "image/png" },
      { src: "/icons/ios/72.png", sizes: "72x72", type: "image/png" },
      { src: "/icons/ios/96.png", sizes: "96x96", type: "image/png" },
      { src: "/icons/ios/128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/ios/144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/ios/152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/ios/180.png", sizes: "180x180", type: "image/png" },
      { src: "/icons/ios/192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/ios/256.png", sizes: "256x256", type: "image/png" },
      { src: "/icons/ios/512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/ios/1024.png", sizes: "1024x1024", type: "image/png" },
      {
        src: "/icons/android/android-launchericon-48-48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        src: "/icons/android/android-launchericon-72-72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/android/android-launchericon-96-96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/android/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/icons/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  })
})

// Service Worker
app.get("/:id{[A-Za-z0-9_-]{14}}/sw.js", (c) => {
  const id = c.req.param("id")
  return c.text(serviceWorkerScript(id), 200, {
    "Content-Type": "application/javascript",
    "Service-Worker-Allowed": `/${id}`,
  })
})

// QR code for social sharing
app.get("/:id{[A-Za-z0-9_-]{14}}/og.png", async (c) => {
  const id = c.req.param("id")
  const verified = await verifySignedId(id, c.env.API_SECRET)
  if (!verified) return c.text("Not found", 404)

  const pageUrl = new URL(`/${id}`, c.req.url).href
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(pageUrl)}`
  const res = await fetch(qrUrl)
  return new Response(res.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  })
})

// Send endpoint — write-only capability URL
app.post("/send/:writeId{[A-Za-z0-9_-]{14}}", async (c) => {
  const writeId = c.req.param("writeId")
  const nanoid = await verifyWriteId(writeId, c.env.API_SECRET)
  if (!nanoid) return c.json({ ok: false, error: "Not found" }, 404)

  const readId = await readIdFromNanoid(nanoid, c.env.API_SECRET)
  const token = await generateToken(readId, c.env.API_KEY, c.env.API_SECRET)

  const body = await c.req.json<{
    title?: string
    content?: string
    action_url?: string
  }>()

  const res = await fetch(c.env.API_URL + "/codeinbox/echo", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: body.title || "Notification",
      content: body.content || "",
      action_url: body.action_url || "",
    }),
  })

  if (!res.ok) {
    return c.json({ ok: false, error: "Failed to send" }, 502)
  }
  return c.json({ ok: true })
})

// Send form — browser-based UI for write-only endpoint
app.get("/send/:writeId{[A-Za-z0-9_-]{14}}", async (c) => {
  const writeId = c.req.param("writeId")
  const nanoid = await verifyWriteId(writeId, c.env.API_SECRET)
  if (!nanoid) return c.text("Not found", 404)

  const origin = new URL(c.req.url).origin
  const sendUrl = `${origin}/send/${writeId}`
  const formHtml = renderToString(<SendForm writeId={writeId} sendUrl={sendUrl} />)

  const template = await c.env.ASSETS.fetch(
    new URL("/send.html", c.req.url),
  ).then((r) => r.text())

  const html = template.replace(
    '<div id="app"><!--ssr--></div>',
    `<div id="app" data-write-id="${writeId}" data-send-url="${sendUrl}">${formHtml}</div>`,
  )

  return c.html(html)
})

// Inbox page — signed ID: nanoid(8) + HMAC sig(6)
app.get("/:id{[A-Za-z0-9_-]{14}}", async (c) => {
  const id = c.req.param("id")
  const verified = await verifySignedId(id, c.env.API_SECRET)
  if (!verified) return c.text("Not found", 404)
  const token = await generateToken(id, c.env.API_KEY, c.env.API_SECRET)
  const writeId = await createWriteId(id, c.env.API_SECRET)
  const apiUrl = c.env.API_URL
  const url = c.req.url
  const serverTime = new Date().toISOString()

  const appHtml = renderToString(
    <App
      id={id}
      url={url}
      token={token}
      apiUrl={apiUrl}
      writeId={writeId}
      serverTime={serverTime}
    />,
  )

  const template = await c.env.ASSETS.fetch(
    new URL("/index.html", c.req.url),
  ).then((r) => r.text())

  const title = "PWA Inbox"
  const origin = new URL(c.req.url).origin

  const html = template
    .replace("<!--title-->", title)
    .replace(/<!--og-title-->/g, title)
    .replace("<!--canonical-->", `<link rel="canonical" href="${origin}/" />`)
    .replace("<!--og-url-->", `<meta property="og:url" content="${origin}/" />`)
    .replace(
      "<!--og-image-->",
      `<meta property="og:image" content="${origin}/${id}/og.png" />`,
    )
    .replace(
      "<!--twitter-image-->",
      `<meta name="twitter:image" content="${origin}/${id}/og.png" />`,
    )
    .replace(
      "<!--manifest-->",
      `<link rel="manifest" href="/${id}/manifest.json" />`,
    )
    .replace(
      '<div id="app"><!--ssr--></div>',
      `<div id="app" data-id="${id}" data-url="${url}" data-token="${token}" data-api-url="${apiUrl}" data-write-id="${writeId}" data-server-time="${serverTime}"${c.env.POSTHOG_API_KEY ? ` data-posthog-key="${c.env.POSTHOG_API_KEY}"` : ""}>${appHtml}</div>`,
    )

  return c.html(html)
})

export default app

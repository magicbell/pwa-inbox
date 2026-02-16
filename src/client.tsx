import { hydrate } from "preact"
import posthog from "posthog-js"
import { App } from "./App"
import { setupBadgeSync } from "./lib/badge"
import * as device from "./lib/device"

const el = document.getElementById("app")!

const id = el.getAttribute("data-id") ?? ""
const posthogKey = el.getAttribute("data-posthog-key")

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: "https://ph.magicbell.com",
    ui_host: "https://us.posthog.com",
    defaults: "2025-11-30",
  })

  posthog.identify(id)
  if (device.isPWADesktop()) {
    posthog.setPersonProperties(undefined, { pwa_installed_desktop: true })
  } else if (device.isPWAMobile()) {
    posthog.setPersonProperties(undefined, { pwa_installed_mobile: true })
  }
}

const url = el.getAttribute("data-url") ?? location.href
const token = el.getAttribute("data-token") ?? ""
const apiUrl = el.getAttribute("data-api-url") ?? ""
const writeId = el.getAttribute("data-write-id") ?? ""
const serverTime = el.getAttribute("data-server-time") ?? ""

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(`/${id}/sw.js`, { scope: "/" + id })
    .then((reg) => {
      console.log("[Inbox] SW registered, scope:", reg.scope)
      if (!navigator.serviceWorker.controller) {
        console.log("[Inbox] Waiting for SW to claim...")
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("[Inbox] SW now controlling page")
        })
      }
    })
    .catch((err) => console.error("[Inbox] SW registration failed:", err))
}

setupBadgeSync(id, token, apiUrl)

hydrate(
  <App
    id={id}
    url={url}
    token={token}
    apiUrl={apiUrl}
    writeId={writeId}
    serverTime={serverTime}
  />,
  el,
)

import { useState, useEffect, useRef } from "preact/hooks"
import { MagicBellProvider, WebPushButton } from "@magicbell/preact"
import { BrandedInbox } from "./components/BrandedInbox"
import { Dialog } from "./components/Dialog"
import { MobilePushContent } from "./components/MobilePushContent"
import { DesktopDialogContent } from "./components/DesktopDialogContent"
import { SendTestButton } from "./components/SendTestButton"
import { PwaInstall } from "./components/PwaInstall"
import * as device from "./lib/device"
import { GITHUB_URL } from "./lib/constants"

type WebPushStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "request-install"
  | "unsupported"

type AppProps = {
  id: string
  url: string
  token: string
  apiUrl: string
  writeId: string
  serverTime: string
}

function useIsMobile() {
  const [value, setValue] = useState<boolean | null>(null)
  useEffect(() => {
    setValue(device.isMobile())
  }, [])
  return value
}

function useIsPWAMobile() {
  const [value, setValue] = useState(false)
  useEffect(() => {
    setValue(device.isPWAMobile())
  }, [])
  return value
}

export function App({ id, url, token, apiUrl, writeId, serverTime }: AppProps) {
  const sendUrl = writeId ? `${new URL(url).origin}/send/${writeId}` : ""
  const isMobile = useIsMobile()
  const isPWAMobile = useIsPWAMobile()
  const [pushStatus, setPushStatus] = useState<WebPushStatus>("loading")
  const [dialogOpen, setDialogOpen] = useState(false)
  const autoOpened = useRef(false)

  // Auto-open dialog: desktop immediately, mobile when push is idle
  useEffect(() => {
    if (isMobile === null) return // not determined yet
    if (autoOpened.current) return

    if (isMobile && pushStatus === "idle") {
      setDialogOpen(true)
      autoOpened.current = true
    } else if (!isMobile) {
      setDialogOpen(true)
      autoOpened.current = true
    }
  }, [isMobile, pushStatus])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const btn = (e.target as Element).closest('[title="Preferences"]')
      if (btn) {
        e.preventDefault()
        e.stopPropagation()
        setDialogOpen(true)
      }
    }
    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [])

  const webPushButton = (
    <WebPushButton
      serviceWorkerPath={`/${id}/sw.js`}
      idleLabel="Enable push notifications"
      loadingLabel="Enabling..."
      requestInstallLabel="Please first install the app as PWA to enable notifications"
      unsupportedLabel="Push notifications not supported on this browser"
      successLabel="Disable push notifications"
      errorLabel="Failed to enable notifications"
      onStatusChange={setPushStatus}
    />
  )

  return (
    <MagicBellProvider token={token} baseUrl={apiUrl}>
      <BrandedInbox />
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
        }}
      >
        {isMobile === null ? null : isMobile ? (
          <MobilePushContent status={pushStatus} sendUrl={sendUrl}>
            {webPushButton}
          </MobilePushContent>
        ) : (
          <DesktopDialogContent
            url={url}
            sendUrl={sendUrl}
            token={token}
            apiUrl={apiUrl}
          />
        )}
      </Dialog>
      {!isMobile && (
        <div class="flex items-center gap-2 px-4 py-2 max-w-md mx-auto">
          <div class="flex-1">{webPushButton}</div>
          {pushStatus === "success" && (
            <div class="flex-1">
              <SendTestButton sendUrl={sendUrl} showCurl={false} />
            </div>
          )}
        </div>
      )}
      <PwaInstall
        class={dialogOpen ? "hidden" : ""}
        manifestUrl={`/${id}/manifest.json`}
        icon="/icons/ios/180.png"
      />
      <footer class="flex items-center justify-between text-xs text-gray-400 px-4 py-4 mx-auto w-full">
        <div></div>
        <div class="space-x-3">
          <a
            href="https://www.magicbell.com/privacy-policy"
            class="hover:text-gray-600"
          >
            Privacy
          </a>
          <a
            href="https://www.magicbell.com/cookie-policy"
            class="hover:text-gray-600"
          >
            Cookies
          </a>
          <a
            href="https://www.magicbell.com/terms-and-conditions"
            class="hover:text-gray-600"
          >
            Terms
          </a>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener"
          class="hover:opacity-80"
        >
          <img
            src="/github-mark.svg"
            alt="GitHub"
            class="w-5 h-5 opacity-40 hover:opacity-70"
          />
        </a>
      </footer>
    </MagicBellProvider>
  )
}

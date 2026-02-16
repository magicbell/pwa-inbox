import { useState, useEffect, useRef } from "preact/hooks"

const POLL_INTERVAL_MS = 5000

type TokenStatus = {
  hasMultipleInApp: boolean
  hasWebPush: boolean
}

async function fetchTokenCount(
  apiUrl: string,
  token: string,
  endpoint: string,
): Promise<number> {
  try {
    const res = await fetch(apiUrl + endpoint, {
      headers: { Authorization: "Bearer " + token },
    })
    if (!res.ok) return 0
    const json = await res.json()
    return Array.isArray(json.data) ? json.data.length : 0
  } catch (e) {
    console.error("[TokenChecker] Failed to fetch " + endpoint + ":", e)
    return 0
  }
}

export function useTokenStatus(apiUrl: string, token: string): TokenStatus {
  const [hasMultipleInApp, setHasMultipleInApp] = useState(false)
  const [hasWebPush, setHasWebPush] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      const [inAppCount, webPushCount] = await Promise.all([
        fetchTokenCount(apiUrl, token, "/channels/in_app/inbox/tokens"),
        fetchTokenCount(apiUrl, token, "/channels/web_push/tokens"),
      ])

      if (cancelled) return

      const inApp = inAppCount >= 2
      const webPush = webPushCount >= 1
      setHasMultipleInApp(inApp)
      setHasWebPush(webPush)

      if (inApp && webPush && intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        console.log("[TokenChecker] Polling stopped — all satisfied")
      }
    }

    check()
    intervalRef.current = setInterval(check, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [apiUrl, token])

  return { hasMultipleInApp, hasWebPush }
}

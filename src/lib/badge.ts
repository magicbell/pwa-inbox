let badgeSyncController: AbortController | null = null
let badgeSyncTimeout: ReturnType<typeof setTimeout> | null = null

export function setupBadgeSync(
  id: string,
  token: string,
  apiUrl: string,
) {
  const dbName = "installable-inbox-" + id

  function syncBadge() {
    if (!navigator.setAppBadge) return

    if (badgeSyncTimeout) clearTimeout(badgeSyncTimeout)
    if (badgeSyncController) badgeSyncController.abort()

    badgeSyncTimeout = setTimeout(async () => {
      badgeSyncController = new AbortController()

      try {
        const res = await fetch(apiUrl + "/notifications/unread/count", {
          headers: { Authorization: "Bearer " + token },
          signal: badgeSyncController.signal,
        })
        if (!res.ok) throw new Error("Failed to fetch unread count")

        const { count } = await res.json()

        if (count > 0) {
          await navigator.setAppBadge(count)
        } else {
          await navigator.clearAppBadge()
        }

        const db = await openBadgeDB(dbName)
        await setCount(db, count)

        console.log("[Inbox] Badge synced:", count)
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("[Inbox] Badge sync failed:", e)
        }
      } finally {
        badgeSyncController = null
      }
    }, 100)
  }

  document.addEventListener("visibilitychange", syncBadge)
  syncBadge()
}

function openBadgeDB(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1)
    req.onupgradeneeded = () => req.result.createObjectStore("badge")
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function setCount(db: IDBDatabase, count: number): Promise<void> {
  return new Promise((resolve) => {
    const tx = db.transaction("badge", "readwrite")
    tx.objectStore("badge").put(count, "count")
    tx.oncomplete = () => resolve()
  })
}

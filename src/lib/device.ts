export function isMobile(): boolean {
  return /iPad|iPhone|iPod|Android/.test(navigator.userAgent)
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone ||
    document.referrer.includes("android-app://")
  )
}

export function isPWAMobile(): boolean {
  const canPush =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    (!isIOS() || isStandalone())

  return isMobile() && canPush
}

export function isPWADesktop(): boolean {
  return !isMobile() && isStandalone()
}

import { useRef, useEffect } from "preact/hooks"
import posthog from "posthog-js"

type Props = {
  manifestUrl: string
  icon: string
  class?: string
}

export function PwaInstall({ manifestUrl, icon, class: className }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => posthog.capture?.("pwa_install_success")
    el.addEventListener("pwa-install-success-event", handler)
    return () => el.removeEventListener("pwa-install-success-event", handler)
  }, [])

  return (
    <pwa-install
      ref={ref}
      class={className}
      manifest-url={manifestUrl}
      icon={icon}
    ></pwa-install>
  )
}

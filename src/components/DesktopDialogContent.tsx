import { useState, useMemo } from "preact/hooks"
import { useTokenStatus } from "../lib/use-token-status"
import { curlSnippet } from "../lib/echo"
import { GITHUB_URL } from "../lib/constants"

function Step({
  label,
  status,
}: {
  label: string
  status: "pending" | "current" | "done"
}) {
  return (
    <div
      class={`flex items-center gap-2.5 text-[13px] transition-opacity duration-300 ${status === "pending" ? "opacity-40" : ""}`}
    >
      <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
        {status === "done" ? (
          <div class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              class="w-3 h-3 text-green-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        ) : status === "current" ? (
          <div class="w-4 h-4 rounded-full border-2 border-gray-300 border-t-(--app-primary) animate-spin" />
        ) : (
          <div class="w-4 h-4 rounded-full border-2 border-gray-300" />
        )}
      </div>
      <span class={status === "done" ? "text-green-700" : "text-gray-700"}>
        {label}
      </span>
    </div>
  )
}

type Props = {
  url: string
  sendUrl: string
  token: string
  apiUrl: string
}

export function DesktopDialogContent({ url, sendUrl, token, apiUrl }: Props) {
  const { hasMultipleInApp, hasWebPush } = useTokenStatus(apiUrl, token)
  const [copied, setCopied] = useState(false)
  const snippet = curlSnippet(sendUrl)

  const qrUrl = useMemo(
    () =>
      `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`,
    [url],
  )

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div class="grid grid-cols-[2fr_3fr] min-h-75">
      <div class="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-bl-xl">
        <h3 class="text-base font-semibold text-gray-900 mb-4">
          Install on Mobile
        </h3>
        <img
          src={qrUrl}
          alt="QR code"
          width={160}
          height={160}
          class="rounded-lg"
        />
        <div class="flex flex-col gap-3 mt-5 w-full px-2">
          <Step
            label="Open on another device"
            status={hasMultipleInApp ? "done" : "current"}
          />
          <Step
            label="Install PWA & enable notifications"
            status={
              hasMultipleInApp && hasWebPush
                ? "done"
                : hasMultipleInApp
                  ? "current"
                  : "pending"
            }
          />
        </div>
      </div>

      <div class="flex flex-col p-4">
        <h3 class="text-base font-semibold text-gray-900 mb-4">
          Send yourself a notification
        </h3>
        <div class="relative flex-1 flex flex-col">
          <pre class="flex-1 m-0 p-3 pr-16 bg-gray-900 text-gray-300 rounded-lg font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-all overflow-y-auto max-h-[300px]">
            {snippet}
          </pre>
          <button
            onClick={copy}
            class="absolute top-2 right-2 px-2.5 py-1 bg-gray-700 text-gray-300 border-none rounded text-xs cursor-pointer hover:bg-gray-600 active:bg-gray-500 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p class="mt-2 text-xs text-gray-400">
          Prefer a UI? Use our{" "}
          <a
            href={`${new URL(sendUrl).pathname}?ref=inbox`}
            target="_blank"
            rel="noopener"
            class="text-(--app-primary) hover:underline"
          >
            web form
          </a>{" "}
          to compose your request.
        </p>
        <p class="mt-3 text-xs text-gray-400">
          Like this project?{" "}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener"
            class="text-(--app-primary) hover:underline"
          >
            Star us on GitHub
          </a>
        </p>
      </div>
    </div>
  )
}

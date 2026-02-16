import { useState, useRef } from "preact/hooks"
import { sendEcho, curlSnippet } from "../lib/echo"

type Status = "idle" | "sending" | "sent"

type Props = {
  sendUrl: string
  showCurl?: boolean
  pulse?: boolean
  class?: string
}

export function SendTestButton({
  sendUrl,
  showCurl = true,
  pulse = false,
  class: className,
}: Props) {
  const [status, setStatus] = useState<Status>("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [curlOpen, setCurlOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  const snippet = curlSnippet(sendUrl)

  async function handle() {
    if (status === "sending") return

    if (timer.current) clearTimeout(timer.current)

    setStatus("sending")
    await sendEcho(sendUrl)
    setStatus("sent")

    timer.current = setTimeout(() => {
      setStatus("idle")
      timer.current = null
    }, 10000)
  }

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const label =
    status === "sending"
      ? "Sending..."
      : status === "sent"
        ? "Sent! \u2713"
        : "Send me something to my inbox"

  return (
    <>
      <button
        onClick={handle}
        disabled={status === "sending"}
        class={`w-full py-3 px-4 rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap
          disabled:opacity-50 disabled:cursor-not-allowed
          bg-(--app-primary) text-white hover:opacity-90 ${pulse && status === "idle" ? "animate-pulse-border" : ""} ${className || ""}`}
      >
        {label}
      </button>

      {showCurl && (
        <div class="mt-2 text-center">
          <button
            onClick={() => setCurlOpen(!curlOpen)}
            class="text-xs text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
          >
            {curlOpen ? "\u25be Close" : "\u25b8 Show"} curl command
          </button>

          <div
            class="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: curlOpen ? "300px" : "0",
              opacity: curlOpen ? 1 : 0,
            }}
          >
            <div class="relative mt-2">
              <pre class="m-0 p-3 pr-14 bg-gray-900 text-gray-300 rounded-lg font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-all text-left">
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
          </div>
        </div>
      )}
    </>
  )
}

import { useState } from "preact/hooks"
import { CurlPreview } from "./CurlPreview"

type Props = {
  writeId: string
  sendUrl: string
}

function isValidUrl(s: string): boolean {
  try {
    new URL(s)
    return true
  } catch {
    return false
  }
}

const isOwner =
  typeof location !== "undefined" &&
  new URLSearchParams(location.search).get("ref") === "inbox"

export function SendForm({ writeId, sendUrl }: Props) {
  const [title, setTitle] = useState("")
  const [copied, setCopied] = useState(false)
  const shareUrl = sendUrl.split("?")[0]
  const [content, setContent] = useState("")
  const [actionUrl, setActionUrl] = useState("")
  const [urlTouched, setUrlTouched] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  )
  const [errorMsg, setErrorMsg] = useState("")

  const urlInvalid = urlTouched && actionUrl !== "" && !isValidUrl(actionUrl)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch(sendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          action_url: actionUrl || "https://magicbell.com",
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus("sent")
      } else {
        setErrorMsg(data.error || "Failed to send")
        setStatus("error")
      }
    } catch {
      setErrorMsg("Network error")
      setStatus("error")
    }
  }

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-sm p-8 w-full max-w-3xl mx-auto">
        <h1 class="text-xl font-semibold text-gray-900 mb-6">
          Send something to{" "}
          <code class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-base font-mono border border-gray-200">
            {writeId}
          </code>
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <form onSubmit={handleSubmit} class="flex flex-col gap-4">
              <div>
                <label
                  for="title"
                  class="block text-sm font-medium text-gray-600 mb-1"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Hello!"
                  required
                  value={title}
                  onInput={(e) =>
                    setTitle((e.target as HTMLInputElement).value)
                  }
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-(--app-primary) focus:ring-2 focus:ring-(--app-primary)/15"
                />
              </div>
              <div>
                <label
                  for="content"
                  class="block text-sm font-medium text-gray-600 mb-1"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  placeholder="Your message here..."
                  value={content}
                  onInput={(e) =>
                    setContent((e.target as HTMLTextAreaElement).value)
                  }
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-y min-h-20 focus:outline-none focus:border-(--app-primary) focus:ring-2 focus:ring-(--app-primary)/15"
                />
              </div>
              <div>
                <label
                  for="action_url"
                  class="block text-sm font-medium text-gray-600 mb-1"
                >
                  Action URL (optional)
                </label>
                <input
                  id="action_url"
                  type="url"
                  placeholder="https://example.com"
                  value={actionUrl}
                  onInput={(e) => {
                    setActionUrl((e.target as HTMLInputElement).value)
                    setUrlTouched(true)
                  }}
                  class={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-(--app-primary) focus:ring-2 focus:ring-(--app-primary)/15 ${urlInvalid ? "border-red-300" : "border-gray-200"}`}
                />
                {urlInvalid && (
                  <p class="mt-1 text-xs text-red-500">
                    Please enter a valid URL (e.g. https://example.com)
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                class="w-full py-3 bg-(--app-primary) text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending..." : "Send"}
              </button>
            </form>
            {status === "sent" && (
              <div class="mt-4 p-3 rounded-lg text-sm text-center bg-green-50 text-green-700">
                Sent!
              </div>
            )}
            {status === "error" && (
              <div class="mt-4 p-3 rounded-lg text-sm text-center bg-red-50 text-red-700">
                {errorMsg}
              </div>
            )}
          </div>

          <CurlPreview
            sendUrl={sendUrl}
            title={title}
            content={content}
            actionUrl={actionUrl}
          />
        </div>
      </div>
      {isOwner && (
        <div class="mt-4 text-center text-sm text-gray-500 max-w-3xl">
          <p class="mb-2">
            This page can be safely shared with others to let them send
            notifications to your inbox. Anyone with this link can send to you
            but cannot read your inbox.
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              })
            }}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-(--app-primary) border border-(--app-primary)/25 rounded-lg hover:bg-(--app-primary)/5 cursor-pointer bg-transparent transition-colors"
          >
            {copied ? "Copied!" : "Copy shareable link"}
          </button>
        </div>
      )}
    </div>
  )
}

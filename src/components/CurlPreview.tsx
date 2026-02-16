import { useMemo, useState } from "preact/hooks"

type Props = {
  sendUrl: string
  title: string
  content: string
  actionUrl: string
}

function escapeShell(s: string): string {
  return s.replace(/'/g, "'\\''")
}

export function CurlPreview({ sendUrl, title, content, actionUrl }: Props) {
  const [copied, setCopied] = useState(false)

  const snippet = useMemo(() => {
    const payload: Record<string, string> = { title: title || "Hello!" }
    if (content) payload.content = content
    payload.action_url = actionUrl || "https://magicbell.com"
    const json = JSON.stringify(payload, null, 2)
    return `curl -X POST '${escapeShell(sendUrl)}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${escapeShell(json)}'`
  }, [sendUrl, title, content, actionUrl])

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div class="flex flex-col">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-600">curl</span>
        <button
          onClick={copy}
          class="px-2.5 py-1 bg-gray-700 text-gray-300 border-none rounded text-xs cursor-pointer hover:bg-gray-600 active:bg-gray-500 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre class="flex-1 m-0 p-3 bg-gray-900 text-gray-300 rounded-lg font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all">
        {snippet}
      </pre>
    </div>
  )
}

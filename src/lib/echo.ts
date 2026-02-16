const TITLES = [
  "Welcome aboard!",
  "You've got mail",
  "New update available",
  "Don't forget!",
  "Quick heads up",
  "Something new for you",
]

const CONTENTS = [
  "This is your first push notification. Neat, right?",
  "Your inbox is all set up and ready to go.",
  "Notifications are working like a charm.",
  "Everything is connected. You're good to go!",
  "Push notifications are live. Try sending another!",
  "Hello from MagicBell!",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function echoPayload(): { title: string; content: string; action_url: string } {
  return {
    title: pick(TITLES),
    content: pick(CONTENTS),
    action_url: "https://www.magicbell.com/",
  }
}

export async function sendEcho(sendUrl: string): Promise<boolean> {
  try {
    const res = await fetch(sendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(echoPayload()),
    })
    return res.ok
  } catch {
    return false
  }
}

export function curlSnippet(sendUrl: string): string {
  return [
    `curl -X POST '${sendUrl}' \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -d '{`,
    `    "title": "Test Notification",`,
    `    "content": "Hello from curl!",`,
    `    "action_url": "https://www.magicbell.com/"`,
    `  }'`,
  ].join("\n")
}

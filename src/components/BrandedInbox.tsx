import { Inbox } from "@magicbell/preact"

export function BrandedInbox() {
  return (
    <div class="app__inbox">
      <Inbox />
      <div class="app__inbox-empty">
        <h2>Welcome to your PWAInbox!</h2>
        <p>
          PWAInbox turns any browser into a push notification endpoint. Share
          your unique link and anyone can reach you with a single HTTP POST
          request. Add it to your home screen for instant, real-time alerts on
          any device.
        </p>
        <a
          class="magicbell-branding"
          href="https://www.magicbell.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/ios/64.png" alt="MagicBell" width="32" height="32" />
          <span>powered by MagicBell</span>
        </a>
      </div>
    </div>
  )
}

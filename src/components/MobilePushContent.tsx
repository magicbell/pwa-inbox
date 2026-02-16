import type { ComponentChildren } from "preact"
import { SendTestButton } from "./SendTestButton"

type WebPushStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "request-install"
  | "unsupported"

type Props = {
  status: WebPushStatus
  sendUrl: string
  children: ComponentChildren // the WebPushButton
}

function StatusPanel({
  visible,
  children,
}: {
  visible: boolean
  children: ComponentChildren
}) {
  return (
    <div
      class={`absolute inset-0 flex flex-col items-center justify-center text-center px-6
        transition-all duration-300 ease-in-out
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
    >
      {children}
    </div>
  )
}

export function MobilePushContent({ status, sendUrl, children }: Props) {
  return (
    <div class="flex flex-col items-center grow px-4 pb-4">
      <div class={`relative w-full flex-1 overflow-hidden ${status === "idle" || status === "loading" || status === "success" ? "min-h-48" : ""}`}>
        <StatusPanel visible={status === "idle"}>
          <div class="text-4xl mb-3">🔔</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            One last step!
          </h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            Tap the button below to enable push notifications and never miss an
            update.
          </p>
        </StatusPanel>

        <StatusPanel visible={status === "loading"}>
          <div class="w-12 h-12 rounded-full border-4 border-gray-200 border-t-(--app-primary) animate-spin" />
        </StatusPanel>

        <StatusPanel visible={status === "success"}>
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-green-700">You're all set!</p>
        </StatusPanel>
      </div>
      <div class="w-full shrink-0 flex justify-center">{children}</div>
      <hr class="w-full border-t border-gray-200 my-5" />
      <div class="w-full">
        <SendTestButton
          sendUrl={sendUrl}
          pulse={status === "success"}
        />
      </div>
    </div>
  )
}

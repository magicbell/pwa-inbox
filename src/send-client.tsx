import { hydrate } from "preact"
import { SendForm } from "./components/SendForm"

const el = document.getElementById("app")!
const writeId = el.getAttribute("data-write-id") ?? ""
const sendUrl = el.getAttribute("data-send-url") ?? ""

hydrate(<SendForm writeId={writeId} sendUrl={sendUrl} />, el)

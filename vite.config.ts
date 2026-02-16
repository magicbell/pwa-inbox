import { resolve } from "node:path"
import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import tailwindcss from "@tailwindcss/vite"
import { cloudflare } from "@cloudflare/vite-plugin"

export default defineConfig({
  plugins: [preact(), tailwindcss(), cloudflare()],
  server: {
    allowedHosts: ["af1e-83-46-210-242.ngrok-free.app"],
  },
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, "index.html"),
            send: resolve(__dirname, "send.html"),
          },
        },
      },
    },
  },
})

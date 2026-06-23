import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    // Bind to all interfaces so the server is reachable
    host: "0.0.0.0",
    port: 3000,
    // Use polling to avoid file watcher issues
    watch: {
      usePolling: true,
    },
    // HMR uses the origin that loaded the page, so browser can reconnect properly
    hmr: {
      host: "localhost",
      port: 3000,
      protocol: "ws",
    },
  },
});

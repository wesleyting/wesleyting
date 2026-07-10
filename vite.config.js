import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "projects/duuduu-mattress": resolve(__dirname, "projects/duuduu-mattress.html"),
        "projects/vegaspaulyc": resolve(__dirname, "projects/vegaspaulyc.html"),
        "projects/token-studio": resolve(__dirname, "projects/token-studio.html"),
        "projects/clearbooks-tech": resolve(__dirname, "projects/clearbooks-tech.html"),
      },
    },
  },
});
import { access, copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "vite";

function sitesStaticAdapter() {
  return {
    name: "sites-static-adapter",
    apply: "build",
    async closeBundle() {
      const serverDirectory = resolve(__dirname, "dist", "server");
      const metadataDirectory = resolve(__dirname, "dist", ".openai");
      const hostingConfig = resolve(__dirname, ".openai", "hosting.json");

      await mkdir(serverDirectory, { recursive: true });
      await mkdir(metadataDirectory, { recursive: true });
      await copyFile(
        resolve(__dirname, "worker", "index.js"),
        resolve(serverDirectory, "index.js"),
      );

      try {
        await access(hostingConfig);
        await copyFile(hostingConfig, resolve(metadataDirectory, "hosting.json"));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    },
  };
}

export default defineConfig({
  plugins: [sitesStaticAdapter()],
  server: {
    host: true,
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        "projects/duuduu-mattress": resolve(__dirname, "projects/duuduu-mattress.html"),
        "projects/vegaspaulyc": resolve(__dirname, "projects/vegaspaulyc.html"),
        "projects/token-studio": resolve(__dirname, "projects/token-studio.html"),
        "projects/clearbooks-tech": resolve(__dirname, "projects/clearbooks-tech.html"),
      },
    },
  },
});

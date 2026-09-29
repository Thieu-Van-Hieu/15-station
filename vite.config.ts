/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import type { Plugin } from "vite";

function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (url.startsWith("/api/state")) {
          const mod = await server.ssrLoadModule("/api/state.ts");
          return mod.default(req, res);
        }
        if (url.startsWith("/api/vote")) {
          const mod = await server.ssrLoadModule("/api/vote.ts");
          return mod.default(req, res);
        }
        if (url.startsWith("/api/tally")) {
          const mod = await server.ssrLoadModule("/api/tally.ts");
          return mod.default(req, res);
        }
        if (url.startsWith("/api/round")) {
          const mod = await server.ssrLoadModule("/api/round.ts");
          return mod.default(req, res);
        }
        if (url.startsWith("/api/join")) {
          const mod = await server.ssrLoadModule("/api/join.ts");
          return mod.default(req, res);
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevPlugin()],
  test: {
    // Test engine và script validate chạy trên Node. Test component tự khai jsdom qua @vitest-environment jsdom.
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts", "api/**/*.test.ts"],
  },
});

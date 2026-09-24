import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import { createProjectsApi } from "./server/projects-api.ts";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(
    mode,
    fileURLToPath(new URL(".", import.meta.url)),
    "OWNER_",
  );
  return {
    plugins: [
      react(),
      {
        name: "local-project-editor",
        configureServer(server) {
          server.middlewares.use(
            createProjectsApi(
              fileURLToPath(new URL("./public/projects.json", import.meta.url)),
              { passwordHash: environment.OWNER_PASSWORD_HASH },
            ),
          );
        },
      },
    ],
  };
});

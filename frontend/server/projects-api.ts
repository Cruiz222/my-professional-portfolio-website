import { createHash, randomUUID } from "node:crypto";
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { parseProjects } from "../src/data/projects.ts";

import { createOwnerAuth } from "./owner-auth.ts";

const revision = (data: string) =>
  createHash("sha256").update(data).digest("hex");

// Only mounted by Vite's development server. Production has no write endpoint.
export function createProjectsApi(
  filename: string,
  options: { passwordHash?: string; now?: () => number } = {},
) {
  const auth = createOwnerAuth(options.passwordHash, options.now);
  let queue: Promise<void> = Promise.resolve();
  return (
    request: IncomingMessage,
    response: ServerResponse,
    next: () => void,
  ) => {
    const route = request.url?.split("?")[0];
    const sessionRoute = route === "/api/owner/session";
    if (route !== "/api/projects" && !sessionRoute) return next();
    const send = (status: number, data: unknown) => {
      response.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(data));
    };
    const address = request.socket.remoteAddress;
    const host = request.headers.host;
    if (
      !address ||
      !["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address) ||
      !host ||
      !/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)
    ) {
      send(403, {
        error:
          "Project management is available only on this computer through localhost.",
      });
      return;
    }
    const allowed = sessionRoute ? ["GET", "POST", "DELETE"] : ["GET", "PUT"];
    if (!allowed.includes(request.method ?? "")) {
      send(405, { error: "Method not allowed." });
      return;
    }
    if (
      request.method !== "GET" &&
      (request.headers.origin !== `http://${host}` ||
        request.headers["content-type"]?.split(";")[0] !== "application/json")
    ) {
      send(403, { error: "Save projects from the local project manager." });
      return;
    }
    async function run() {
      try {
        if (sessionRoute) {
          await auth.handle(request, response, send);
          return;
        }
        if (!auth.authorized(request)) {
          send(401, { error: "Sign in as the owner to manage projects." });
          return;
        }
        if (request.method === "GET") {
          const raw = await readFile(filename, "utf8");
          send(200, {
            projects: parseProjects(JSON.parse(raw)),
            revision: revision(raw),
          });
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of request) {
          size += Buffer.byteLength(chunk);
          if (size > 256 * 1024) {
            send(413, { error: "Project data is too large." });
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        let projects;
        try {
          projects = parseProjects(
            JSON.parse(Buffer.concat(chunks).toString("utf8")),
          );
        } catch (error) {
          send(400, {
            error:
              error instanceof Error ? error.message : "Invalid project data.",
          });
          return;
        }
        // Serialize writes so the revision check and replacement are one operation.
        const save = async () => {
          if (!auth.authorized(request)) {
            send(401, {
              error: "Your owner session has expired. Sign in again.",
            });
            return;
          }
          const raw = await readFile(filename, "utf8");
          if (request.headers["if-match"] !== revision(raw)) {
            send(409, {
              error:
                "Projects changed in another editor. Reload the manager before saving again.",
            });
            return;
          }
          const data = JSON.stringify(projects, null, 2) + "\n";
          const temporary = `${filename}.${randomUUID()}.tmp`;
          try {
            await writeFile(temporary, data, { flag: "wx" });
            await rename(temporary, filename);
          } finally {
            await unlink(temporary).catch(() => {});
          }
          send(200, { projects, revision: revision(data) });
        };
        const operation = queue.then(save);
        queue = operation.catch(() => {});
        await operation;
      } catch {
        send(500, {
          error:
            "Project content could not be read or saved. Check the content file and server permissions.",
        });
      }
    }
    void run();
  };
}

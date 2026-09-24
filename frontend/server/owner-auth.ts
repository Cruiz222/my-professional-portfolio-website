import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const cookieName = "portfolio_owner";
const lifetime = 60 * 60 * 1000;
const attemptWindow = 15 * 60 * 1000;

type Send = (status: number, data: unknown) => void;

export function createOwnerAuth(passwordHash?: string, now = Date.now) {
  const configured =
    typeof passwordHash === "string" &&
    /^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash);
  const sessions = new Map<string, number>();
  let attempts = 0;
  let windowEnds = 0;

  function token(request: IncomingMessage) {
    return request.headers.cookie
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
  }
  function authorized(request: IncomingMessage) {
    for (const [key, expires] of sessions)
      if (expires <= now()) sessions.delete(key);
    const key = token(request);
    return configured && !!key && sessions.has(key);
  }
  function clearCookie(response: ServerResponse) {
    response.setHeader(
      "Set-Cookie",
      `${cookieName}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0`,
    );
  }
  async function handle(
    request: IncomingMessage,
    response: ServerResponse,
    send: Send,
  ) {
    if (request.method === "GET") {
      send(200, { configured, authenticated: authorized(request) });
      return;
    }
    if (request.method === "DELETE") {
      const key = token(request);
      if (key) sessions.delete(key);
      clearCookie(response);
      send(200, { authenticated: false });
      return;
    }
    if (!configured) {
      send(503, {
        error:
          "Owner access has not been configured. Run npm run owner:setup in the frontend directory, then restart the development server.",
      });
      return;
    }
    if (now() >= windowEnds) {
      attempts = 0;
      windowEnds = now() + attemptWindow;
    }
    if (attempts >= 5) {
      response.setHeader(
        "Retry-After",
        String(Math.ceil((windowEnds - now()) / 1000)),
      );
      send(429, { error: "Too many login attempts. Try again in 15 minutes." });
      return;
    }
    attempts += 1;
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of request) {
      size += Buffer.byteLength(chunk);
      if (size > 4096) {
        send(413, { error: "Login request is too large." });
        return;
      }
      chunks.push(Buffer.from(chunk));
    }
    let password: unknown;
    try {
      password = JSON.parse(Buffer.concat(chunks).toString("utf8")).password;
    } catch {
      send(400, { error: "Invalid login request." });
      return;
    }
    const [salt, expected] = passwordHash!.split(":");
    if (
      typeof password !== "string" ||
      password.length > 1024 ||
      !timingSafeEqual(
        scryptSync(password, salt, 64),
        Buffer.from(expected, "hex"),
      )
    ) {
      send(401, { error: "Incorrect owner password." });
      return;
    }
    attempts = 0;
    // Rotate the current session and bound the number of active owner sessions.
    const old = token(request);
    if (old) sessions.delete(old);
    authorized(request);
    if (sessions.size >= 10) sessions.delete(sessions.keys().next().value!);
    const key = randomBytes(32).toString("hex");
    sessions.set(key, now() + lifetime);
    response.setHeader(
      "Set-Cookie",
      `${cookieName}=${key}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${lifetime / 1000}`,
    );
    send(200, { authenticated: true });
  }
  return { authorized, handle };
}

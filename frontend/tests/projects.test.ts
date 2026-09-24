import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer, get } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseProjects } from "../src/data/projects.ts";
import { createProjectsApi } from "../server/projects-api.ts";
import { hashPassword } from "../server/owner-auth.ts";

const project = {
  id: "test-project",
  title: "  Test project  ",
  description: "A test-only fixture",
  technologies: ["React", "React"],
  category: "Software",
  contribution: "Personal project",
  repositoryUrl: "",
  demoUrl: "",
};

test("content validation normalizes input and rejects unsafe or malformed data", () => {
  assert.deepEqual(parseProjects([]), []);
  const [result] = parseProjects([project]);
  assert.equal(result.title, "Test project");
  assert.deepEqual(result.technologies, ["React"]);
  assert.throws(() => parseProjects([{ ...project, title: "   " }]));
  assert.throws(() =>
    parseProjects([{ ...project, description: "x".repeat(1001) }]),
  );
  assert.throws(() => parseProjects([{ ...project, category: "Unknown" }]));
  assert.throws(() => parseProjects([{ ...project, technologies: "Python" }]));
  assert.throws(() =>
    parseProjects([{ ...project, demoUrl: "javascript:alert(1)" }]),
  );
  assert.throws(() =>
    parseProjects([{ ...project, demoUrl: "https://user:secret@example.com" }]),
  );
  assert.throws(() => parseProjects([project, project]));
  assert.throws(() => parseProjects({ projects: [] }));
  assert.equal(
    parseProjects([{ ...project, title: "<script>alert(1)</script>" }])[0]
      .title,
    "<script>alert(1)</script>",
  );
});

test("local API persists additions, edits and deletions; rejects unsafe and stale writes", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-projects-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const filename = join(directory, "projects.json");
  await writeFile(filename, "[]\n");
  const middleware = createProjectsApi(filename, {
    passwordHash: hashPassword("test-owner-password"),
  });
  const server = createServer((req, res) =>
    middleware(req, res, () => {
      res.writeHead(404);
      res.end();
    }),
  );
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  const endpoint = `${base}/api/projects`;
  const login = await fetch(`${base}/api/owner/session`, {
    method: "POST",
    headers: { Origin: base, "Content-Type": "application/json" },
    body: JSON.stringify({ password: "test-owner-password" }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")!.split(";")[0];
  const load = async () =>
    (await fetch(endpoint, { headers: { Cookie: cookie } })).json();
  const put = (rows: unknown, revision: string, origin = base) =>
    fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        "If-Match": revision,
        Cookie: cookie,
      },
      body: JSON.stringify(rows),
    });
  const initial = await load();
  assert.deepEqual(initial.projects, []);
  assert.equal(
    (await put([project], initial.revision, "https://untrusted.example"))
      .status,
    403,
  );
  assert.equal(
    await new Promise<number | undefined>((resolve, reject) => {
      get(endpoint, { headers: { Host: "untrusted.example" } }, (response) => {
        response.resume();
        resolve(response.statusCode);
      }).on("error", reject);
    }),
    403,
  );
  assert.equal(
    (await put([{ ...project, title: "" }], initial.revision)).status,
    400,
  );
  assert.equal((await put([project], initial.revision)).status, 200);
  assert.equal(
    JSON.parse(await readFile(filename, "utf8"))[0].title,
    "Test project",
  );
  assert.equal((await put([], initial.revision)).status, 409);
  const saved = await load();
  const results = await Promise.all([
    put([{ ...project, title: "Updated project" }], saved.revision),
    put([{ ...project, title: "Other tab" }], saved.revision),
  ]);
  assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
  const edited = await load();
  assert.equal(edited.projects.length, 1);
  assert.equal((await put([], edited.revision)).status, 200);
  assert.deepEqual(JSON.parse(await readFile(filename, "utf8")), []);
  assert.equal((await fetch(endpoint, { method: "POST" })).status, 405);
  await writeFile(filename, "not valid JSON");
  assert.equal(
    (await fetch(endpoint, { headers: { Cookie: cookie } })).status,
    500,
  );
});

for (const configured of [false, true]) {
  test(`owner access ${configured ? "requires login and revokes sessions" : "fails closed before setup"}`, async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "portfolio-owner-test-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const filename = join(directory, "projects.json");
    await writeFile(filename, "[]\n");
    let currentTime = 1_000_000;
    const middleware = createProjectsApi(filename, {
      passwordHash: configured
        ? hashPassword("private-test-password")
        : undefined,
      now: () => currentTime,
    });
    const server = createServer((req, res) =>
      middleware(req, res, () => {
        res.writeHead(404);
        res.end();
      }),
    );
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    t.after(
      () =>
        new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve())),
        ),
    );
    const address = server.address();
    assert(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}`;
    const session = `${base}/api/owner/session`;
    const endpoint = `${base}/api/projects`;
    const login = (password: string, origin = base) =>
      fetch(session, {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
    const put = (cookie = "", revision = "") =>
      fetch(endpoint, {
        method: "PUT",
        headers: {
          Origin: base,
          "Content-Type": "application/json",
          Cookie: cookie,
          "If-Match": revision,
        },
        body: JSON.stringify([project]),
      });
    assert.equal((await fetch(endpoint)).status, 401);
    assert.equal((await put()).status, 401);
    assert.equal((await put("portfolio_owner=forged-token")).status, 401);
    assert.deepEqual(await (await fetch(session)).json(), {
      configured,
      authenticated: false,
    });
    if (!configured) {
      assert.equal((await login("private-test-password")).status, 503);
      assert.equal(await readFile(filename, "utf8"), "[]\n");
      return;
    }
    assert.equal(
      (await login("private-test-password", "https://untrusted.example"))
        .status,
      403,
    );
    for (let index = 0; index < 5; index++)
      assert.equal((await login("wrong-password")).status, 401);
    assert.equal((await login("private-test-password")).status, 429);
    currentTime += 15 * 60 * 1000;
    const signedIn = await login("private-test-password");
    assert.equal(signedIn.status, 200);
    const setCookie = signedIn.headers.get("set-cookie")!;
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    const cookie = setCookie.split(";")[0];
    const headers = { Cookie: cookie };
    assert.equal(
      (await (await fetch(session, { headers })).json()).authenticated,
      true,
    );
    const saved = await (await fetch(endpoint, { headers })).json();
    assert.equal((await put(cookie, saved.revision)).status, 200);
    const badLogout = await fetch(session, {
      method: "DELETE",
      headers: {
        ...headers,
        Origin: "https://untrusted.example",
        "Content-Type": "application/json",
      },
    });
    assert.equal(badLogout.status, 403);
    assert.equal((await fetch(endpoint, { headers })).status, 200);
    const signedOut = await fetch(session, {
      method: "DELETE",
      headers: { ...headers, Origin: base, "Content-Type": "application/json" },
    });
    assert.equal(signedOut.status, 200);
    assert.match(signedOut.headers.get("set-cookie")!, /Max-Age=0/);
    assert.equal((await put(cookie)).status, 401);
    assert.equal((await fetch(endpoint, { headers })).status, 401);
    const next = await login("private-test-password");
    const nextCookie = next.headers.get("set-cookie")!.split(";")[0];
    assert.notEqual(nextCookie, cookie);
    currentTime += 60 * 60 * 1000;
    assert.equal((await put(nextCookie)).status, 401);
    assert.equal(
      (await (await fetch(session, { headers: { Cookie: nextCookie } })).json())
        .authenticated,
      false,
    );
  });
}

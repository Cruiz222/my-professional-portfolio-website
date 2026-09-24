import { randomBytes, scryptSync } from "node:crypto";
import { chmod, readFile, writeFile } from "node:fs/promises";

// Password input is never echoed or passed through command-line arguments.
function readPassword(prompt) {
  if (!process.stdin.isTTY)
    throw new Error("Run this command in an interactive terminal.");
  process.stdin.setRawMode(true);
  process.stdout.write(prompt);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  return new Promise((resolve, reject) => {
    let value = "";
    function finish(error) {
      process.stdin.removeListener("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      if (error) reject(error);
      else resolve(value);
    }
    function onData(chunk) {
      for (const char of chunk) {
        if (char === "\u0003") {
          finish(new Error("Cancelled."));
          return;
        }
        if (char === "\r" || char === "\n") {
          finish();
          return;
        }
        if (char === "\u007f" || char === "\b")
          value = [...value].slice(0, -1).join("");
        else if (char >= " ") value += char;
      }
    }
    process.stdin.on("data", onData);
  });
}

try {
  const password = await readPassword(
    "Choose your owner password (at least 12 characters): ",
  );
  if (password.length < 12 || password.length > 1024 || !password.trim())
    throw new Error("Use a password between 12 and 1024 characters.");
  const confirmation = await readPassword("Confirm your owner password: ");
  if (password !== confirmation)
    throw new Error("Passwords do not match. No changes made.");
  const salt = randomBytes(16).toString("hex");
  const hash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
  const filename = new URL("../.env.local", import.meta.url);
  let existing = "";
  try {
    existing = await readFile(filename, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const lines = existing
    .split(/\r?\n/)
    .filter((line) => !/^\s*(export\s+)?OWNER_PASSWORD_HASH\s*=/.test(line));
  await writeFile(
    filename,
    `${lines.join("\n").trimEnd()}\nOWNER_PASSWORD_HASH=${hash}\n`,
    { mode: 0o600 },
  );
  await chmod(filename, 0o600);
  console.log(
    "Owner password configured. Restart the development server, then open #manage-projects to sign in.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

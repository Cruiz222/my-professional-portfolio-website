import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";

export default function OwnerAccess({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function check() {
      try {
        const response = await fetch("/api/owner/session", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Could not check owner access.");
        setConfigured(data.configured);
        setAuthenticated(data.authenticated);
      } catch (reason) {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not check owner access.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    function expired() {
      setAuthenticated(false);
      setPassword("");
      setError("Your session ended. Sign in again to manage projects.");
    }
    void check();
    window.addEventListener("focus", check);
    window.addEventListener("owner-session-expired", expired);
    return () => {
      controller.abort();
      window.removeEventListener("focus", check);
      window.removeEventListener("owner-session-expired", expired);
    };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/owner/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not sign in.");
      setAuthenticated(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
    } finally {
      setPassword("");
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/owner/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok)
        throw new Error("Could not sign out. Please try again.");
      setAuthenticated(false);
      setPassword("");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not sign out.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <main className="section manager">
        <p role="status">Checking owner access…</p>
      </main>
    );
  if (authenticated)
    return (
      <>
        <div className="owner-session">
          <span>Signed in as owner</span>
          <button
            className="button"
            disabled={busy}
            onClick={() => void logout()}
          >
            Sign out
          </button>
          <p role="alert">{error}</p>
        </div>
        {children}
      </>
    );
  return (
    <main className="section manager">
      <a className="text-link" href="#projects">
        ← Back to portfolio
      </a>
      <p className="eyebrow">Owner access</p>
      <h1>Sign in to manage projects</h1>
      <p>Only the owner can add, edit, or delete projects.</p>
      <p className="form-error" role="alert">
        {error}
      </p>
      {configured === false ? (
        <div className="empty-state">
          <h2>Set up your owner password</h2>
          <p>
            In your terminal, open the frontend directory and run{" "}
            <code>npm run owner:setup</code>. Then restart the development
            server and refresh this page.
          </p>
          <p>Editing stays locked until setup is complete.</p>
        </div>
      ) : (
        configured === true && (
          <form className="project-editor" onSubmit={login}>
            <label htmlFor="owner-password">Owner password</label>
            <input
              id="owner-password"
              type="password"
              autoComplete="current-password"
              value={password}
              maxLength={1024}
              required
              disabled={busy}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button className="button primary" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )
      )}
    </main>
  );
}

import { useEffect, useState } from "react";
import { parseProjects } from "./projects";
import type { Project } from "./projects";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch(
          `${import.meta.env.BASE_URL}projects.json`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("Failed to load projects");
        const rows = parseProjects(await response.json());
        if (!controller.signal.aborted) {
          setProjects(rows);
          setError("");
        }
      } catch {
        if (!controller.signal.aborted)
          setError(
            "Projects could not be loaded. Please refresh to try again.",
          );
      } finally {
        pending = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    window.addEventListener("focus", load);
    window.addEventListener("portfolio-projects-updated", load);
    const interval = window.setInterval(() => {
      if (!document.hidden) void load();
    }, 15000);
    return () => {
      controller.abort();
      window.removeEventListener("focus", load);
      window.removeEventListener("portfolio-projects-updated", load);
      window.clearInterval(interval);
    };
  }, []);
  return { projects, loading, error };
}

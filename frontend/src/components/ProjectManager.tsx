import { useEffect, useState } from "react";
import ProfileEditor from "./ProfileEditor";
import ProjectForm from "./ProjectForm";
import OwnerAccess from "./OwnerAccess";
import { parseProjects } from "../data/projects";
import type { Project } from "../data/projects";

export default function ProjectManager() {
  return (
    <OwnerAccess>
      <ProjectEditor />
    </OwnerAccess>
  );
}

function ProjectEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Project | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/projects", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 401)
          window.dispatchEvent(new Event("owner-session-expired"));
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Could not load projects.");
        setProjects(parseProjects(data.projects));
        setRevision(data.revision);
      } catch (reason) {
        if (!controller.signal.aborted)
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not load projects.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  async function save(next: Project[], successMessage: string) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "If-Match": revision },
        body: JSON.stringify(next),
      });
      if (response.status === 401)
        window.dispatchEvent(new Event("owner-session-expired"));
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Could not save projects.");
      setProjects(parseProjects(data.projects));
      setRevision(data.revision);
      setEditing(undefined);
      setDeleting(null);
      setMessage(successMessage);
      window.dispatchEvent(new Event("portfolio-projects-updated"));
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not save projects.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="section manager">
      <a className="text-link" href="#projects">
        ← Back to portfolio
      </a>
      <p className="eyebrow">Portfolio content</p>
      <h1>Your portfolio studio</h1>
      <nav className="studio-navigation" aria-label="Dashboard sections"><button type="button" className="button" onClick={() => document.getElementById("manage-images")?.scrollIntoView()}>Profile & background pictures ↓</button><button type="button" className="button" onClick={() => document.getElementById("manage-work")?.scrollIntoView()}>Projects & project pictures ↓</button></nav>
      <ProfileEditor />
      <p>
        {import.meta.env.DEV ? "You are editing local files. Push your changes to publish them. Online edits are stored separately in the hosted database." : "Manage your live portfolio here. Saved changes publish immediately and persist across deployments. Images upload to your portfolio storage."}
      </p>
      <p role="alert" className="form-error">
        {error}
      </p>
      <p role="status">{message}</p>
      {loading ? (
        <p>Loading projects…</p>
      ) : (
        revision && (
          <>
            <div id="manage-work" className="manager-toolbar">
              <span>{projects.length} projects</span>
              <button
                className="button primary"
                disabled={saving || editing !== undefined}
                onClick={() => {
                  setEditing(null);
                  setDeleting(null);
                }}
              >
                Add project & pictures
              </button>
            </div>
            {editing !== undefined && (
              <ProjectForm
                key={editing?.id ?? "new"}
                project={editing}
                saving={saving}
                onCancel={() => setEditing(undefined)}
                onSave={(entry) =>
                  save(
                    editing
                      ? projects.map((row) =>
                          row.id === entry.id ? entry : row,
                        )
                      : [...projects, entry],
                    "Project saved. Your portfolio is updated.",
                  )
                }
              />
            )}
            {projects.length === 0 && editing === undefined && (
              <div className="empty-state">
                <h2>No projects yet</h2>
                <p>Add your first project when you are ready to share it.</p>
              </div>
            )}
            <ul className="manager-list">
              {projects.map((project) => (
                <li key={project.id}>
                  <div>
                    <h2>{project.title}</h2>
                    <p>
                      {project.category} · {project.contribution}
                    </p>
                  </div>
                  {deleting === project.id ? (
                    <div>
                      <p>Delete “{project.title}” from the portfolio?</p>
                      <div className="form-actions">
                        <button
                          className="button"
                          disabled={saving}
                          onClick={() =>
                            void save(
                              projects.filter((row) => row.id !== project.id),
                              "Project deleted.",
                            )
                          }
                        >
                          Confirm deletion
                        </button>
                        <button
                          className="button"
                          disabled={saving}
                          onClick={() => setDeleting(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="form-actions">
                      <button
                        className="button"
                        disabled={saving || editing !== undefined}
                        onClick={() => {
                          setEditing(project);
                          setDeleting(null);
                        }}
                      >
                        Edit<span className="sr-only"> {project.title}</span>
                      </button>
                      <button
                        className="button"
                        disabled={saving || editing !== undefined}
                        onClick={() => setDeleting(project.id)}
                      >
                        Delete<span className="sr-only"> {project.title}</span>
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )
      )}
    </main>
  );
}

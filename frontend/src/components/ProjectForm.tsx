import { useState } from "react";
import type { FormEvent } from "react";
import { categories, contributions, parseProjects } from "../data/projects";
import type { Project } from "../data/projects";

interface Props {
  project: Project | null;
  saving: boolean;
  onSave: (project: Project) => Promise<boolean>;
  onCancel: () => void;
}

function ProjectForm({ project, saving, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [technologies, setTechnologies] = useState(
    project?.technologies.join(", ") ?? "",
  );
  const [category, setCategory] = useState<Project["category"]>(
    project?.category ?? "Software",
  );
  const [contribution, setContribution] = useState<Project["contribution"]>(
    project?.contribution ?? "Personal project",
  );
  const [repositoryUrl, setRepositoryUrl] = useState(
    project?.repositoryUrl ?? "",
  );
  const [demoUrl, setDemoUrl] = useState(project?.demoUrl ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const [entry] = parseProjects([
        {
          id: project?.id ?? crypto.randomUUID(),
          title,
          description,
          category,
          contribution,
          technologies: technologies
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          repositoryUrl,
          demoUrl,
        },
      ]);
      await onSave(entry);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Check the project fields.",
      );
    }
  }

  return (
    <form className="project-editor" onSubmit={handleSubmit}>
      <h2>{project ? "Edit project" : "Add project"}</h2>
      <fieldset disabled={saving}>
        <label htmlFor="project-title">Project title</label>
        <input
          id="project-title"
          value={title}
          maxLength={80}
          required
          onChange={(event) => setTitle(event.target.value)}
        />
        <label htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          value={description}
          maxLength={1000}
          required
          rows={5}
          onChange={(event) => setDescription(event.target.value)}
        />
        <label htmlFor="project-category">Category</label>
        <select
          id="project-category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as Project["category"])
          }
        >
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <label htmlFor="project-contribution">Contribution</label>
        <select
          id="project-contribution"
          value={contribution}
          onChange={(event) =>
            setContribution(event.target.value as Project["contribution"])
          }
        >
          {contributions.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <label htmlFor="project-technologies">
          Technologies (comma-separated, optional)
        </label>
        <input
          id="project-technologies"
          value={technologies}
          maxLength={820}
          onChange={(event) => setTechnologies(event.target.value)}
        />
        <label htmlFor="project-repository">Repository URL (optional)</label>
        <input
          id="project-repository"
          type="url"
          value={repositoryUrl}
          maxLength={2048}
          onChange={(event) => setRepositoryUrl(event.target.value)}
        />
        <label htmlFor="project-demo">Live demo URL (optional)</label>
        <input
          id="project-demo"
          type="url"
          value={demoUrl}
          maxLength={2048}
          onChange={(event) => setDemoUrl(event.target.value)}
        />
        <p className="form-error" role="alert">
          {error}
        </p>
        <div className="form-actions">
          <button className="button primary" type="submit">
            {saving ? "Saving…" : "Save project"}
          </button>
          <button className="button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default ProjectForm;

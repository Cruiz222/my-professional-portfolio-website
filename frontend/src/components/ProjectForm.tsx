import { useState } from "react";
import type { FormEvent } from "react";
import ProjectCard from "./ProjectCard";
import type { Project } from "./ProjectCard";

function ProjectForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<Project | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError(
        "Please enter a title and description with more than just spaces.",
      );
      return;
    }
    setError("");
    setPreview({
      id: 4,
      title: title.trim(),
      description: description.trim(),
      technologies: [],
      category: "Software",
      contribution: "Local preview",
    });
  }

  return (
    <div className="preview-layout">
      <form onSubmit={handleSubmit}>
        <label htmlFor="project-title">Project title</label>
        <input
          id="project-title"
          value={title}
          maxLength={80}
          required
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What are you building?"
        />
        <label htmlFor="project-description">Description</label>
        <textarea
          id="project-description"
          value={description}
          maxLength={400}
          required
          rows={4}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the problem your project solves."
        />
        <p role="alert" className="form-error">
          {error}
        </p>
        <div className="form-actions">
          <button className="button primary" type="submit">
            Preview project →
          </button>
          <button
            className="button"
            type="button"
            onClick={() => {
              setTitle("");
              setDescription("");
              setPreview(null);
              setError("");
            }}
          >
            Reset
          </button>
        </div>
      </form>
      <div>
        <p className="sr-only" role="status">
          {preview
            ? `Preview updated: ${preview.title}`
            : "No project preview yet"}
        </p>
        {preview ? (
          <ul className="preview-card">
            <ProjectCard project={preview} />
          </ul>
        ) : (
          <div className="preview-placeholder">
            <span aria-hidden="true">+</span>
            <p>Your next idea starts here.</p>
            <small>Fill out the form to preview a project card.</small>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectForm;

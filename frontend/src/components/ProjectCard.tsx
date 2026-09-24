import type { Project } from "../data/projects";

function ProjectCard({ project }: { project: Project }) {
  return (
    <li className="project-card">
      <div className="project-visual" aria-hidden="true">
        <span className="project-code">{project.category}</span>
        <span className="project-glyph">
          {project.title.slice(0, 1).toUpperCase()}
          <span>↗</span>
        </span>
        <span className="visual-caption">
          {project.technologies.join(" / ")}
        </span>
      </div>
      <div className="project-body">
        <p className="eyebrow">{project.contribution}</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <ul className="tags">
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        <div className="project-links">
          {project.repositoryUrl && (
            <a
              className="text-link"
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Repository ↗
            </a>
          )}
          {project.demoUrl && (
            <a
              className="text-link"
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live demo ↗
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export default ProjectCard;

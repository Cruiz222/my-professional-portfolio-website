import type { Project } from "../data/projects";

function ProjectCard({ project }: { project: Project }) {
  return (
    <li className="project-card">
      {project.images?.length ? <div className="project-gallery" tabIndex={0} role="region" aria-label={`${project.title} pictures — scroll to browse`}>{project.images.map((src, i) => <img key={i} src={src} alt={`${project.title} — image ${i + 1}`} loading="lazy" />)}</div> : <div className="project-visual" aria-hidden="true">
        <span className="project-code">{project.category}</span>
        <span className="project-glyph">
          {project.title.slice(0, 1).toUpperCase()}
          <span>↗</span>
        </span>
        <span className="visual-caption">
          Selected work / CruizTech
        </span>
      </div>
      }
      <div className="project-body">
        <p className="eyebrow">{project.contribution}</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {!!project.technologies.length && <details className="technology-details">
        <summary>Technologies · {project.technologies.length} entries</summary>
        <ul className="tags">
          {project.technologies.map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
        </details>}
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

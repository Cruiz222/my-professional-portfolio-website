export type ProjectCategory =
  | "Software"
  | "AI"
  | "Cybersecurity"
  | "AI Security"
  | "Automation";

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  category: ProjectCategory;
  contribution: "Personal project" | "Contributed project" | "Local preview";
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <li className="project-card">
      <div className="project-visual" aria-hidden="true">
        <span className="project-code">
          {String(project.id).padStart(2, "0")} / {project.category}
        </span>
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
      </div>
    </li>
  );
}

export default ProjectCard;

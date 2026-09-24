import { useState } from "react";
import ProjectCard from "./ProjectCard";
import type { Project, ProjectCategory } from "./ProjectCard";

const projects: Project[] = [
  {
    id: 1,
    title: "Budget Manager",
    description:
      "A budget and finance manager for organizing personal finances.",
    technologies: ["Python", "FastAPI", "SQLite"],
    category: "Software",
    contribution: "Personal project",
  },
  {
    id: 2,
    title: "Maco Industries sales tracker",
    description:
      "A sales tracking application for clearer company records and organized reporting.",
    technologies: ["Python", "React", "SQLite"],
    category: "Software",
    contribution: "Contributed project",
  },
  {
    id: 3,
    title: "Lily online shopping store",
    description:
      "An e-commerce storefront for presenting and selling goods online.",
    technologies: ["Python", "TypeScript", "SQLite"],
    category: "Software",
    contribution: "Contributed project",
  },
];
const categories: ("All" | ProjectCategory)[] = [
  "All",
  "Software",
  "AI",
  "Cybersecurity",
  "AI Security",
  "Automation",
];

function Projects({ title }: { title: string }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const visibleProjects = projects.filter(
    (project) => category === "All" || project.category === category,
  );
  return (
    <section id="projects" className="section">
      <p className="eyebrow">01 / Selected work</p>
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>
            Practical problems. Considered solutions. Lessons in every build.
          </p>
        </div>
        <span className="project-count">
          {String(projects.length).padStart(2, "0")} projects
        </span>
      </div>
      <div
        className="filters"
        role="group"
        aria-label="Filter projects by category"
      >
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {visibleProjects.length} projects shown
      </p>
      {visibleProjects.length ? (
        <ul className="project-grid">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <h3>More to build. More to share.</h3>
          <p>No {category} projects have been added yet.</p>
          <button className="button" onClick={() => setCategory("All")}>
            View all projects
          </button>
        </div>
      )}
    </section>
  );
}

export default Projects;

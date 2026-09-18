function ProjectCard({project}) {
    return (
        <li>
        <h4>{project.title}</h4>
        <p>{project.description}</p>
        </li>

    )
}

  export default ProjectCard

function ProjectCard({project}) {
    return (
        
        <li>
        <h4>{project.title}</h4>
        <p>{project.description}</p>

        <ul>
            {project.technologies.map((technology) => {
                return <li key={technology}>{technology}</li>
            }

            )}
        </ul>

        </li>

    )
}

  export default ProjectCard

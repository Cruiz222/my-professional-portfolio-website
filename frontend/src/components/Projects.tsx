import ProjectCard from "./ProjectCard"

function Projects({title}) {
    const  projects = [
        {id: 1,
         title: "Budget Manager",
         description: "A smart budget and finance manager",
         technologies: ["Python", "FastAPI", "SQLite"]
       } 
        
    ]

    const workedOnProjects =  [
                    {id: 1, 
                     title: "sales tracker for Maco industries", 
                     description: "An algorithm that tracks the over sales of the company to smart record keeping",
                     technologies: ["Python", "React", "SQLite"]
                    },

                    {id: 2, 
                     title: "lily online shopping store", 
                     description: "An online store e-commerce store for selling goods",
                     technologies: ["Python", "TypeScript", "SQLite"]
                    }
                    
    ]              

    return (
        <section id="projects">

            <h2>{title}</h2>
            <p>Below are the projects i've worked on and built</p>

                    <h3>Personal Projects</h3>

                  
            <ul>
                {projects.map((project) => {
                    return <ProjectCard key={project.id} project={project} />
                        
                })}
            </ul>

                  <h3>Projects Worked On</h3>

                  <ul>
                    {workedOnProjects.map((project) => {
                        return <ProjectCard key={project.id} project={project} />
                    })}
                  </ul>
        </section>
    )
}

 export default Projects
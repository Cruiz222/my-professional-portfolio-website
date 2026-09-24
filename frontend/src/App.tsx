import "./App.css";
import Header from "./components/Header";
import About from "./components/About";
import Projects from "./components/Projects";
import { lazy, Suspense, useEffect, useState } from "react";
import { useProjects } from "./data/useProjects";
const ProjectManager = import.meta.env.DEV
  ? lazy(() => import("./components/ProjectManager"))
  : null;

function App() {
  const { projects, loading, error } = useProjects();
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  if (ProjectManager && hash === "#manage-projects") {
    return (
      <Suspense
        fallback={
          <main>
            <p role="status">Loading project manager…</p>
          </main>
        }
      >
        <ProjectManager />
      </Suspense>
    );
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <About />
        <Projects
          title="Selected projects"
          projects={projects}
          loading={loading}
          error={error}
        />
        <section id="skills" className="section">
          <p className="eyebrow">02 / Skills & direction</p>
          <h2>A foundation built through practice.</h2>
          <div className="skill-grid">
            <article>
              <span className="card-number">01</span>
              <h3>Software engineering</h3>
              <p>Building practical skills through software projects.</p>
            </article>
            <article>
              <span className="card-number">02</span>
              <h3>Artificial intelligence</h3>
              <p>
                Exploring intelligent applications, model integration, and
                reliable AI systems.
              </p>
              <span className="status">Learning focus</span>
            </article>
            <article>
              <span className="card-number">03</span>
              <h3>Cybersecurity</h3>
              <p>
                Developing a foundation in secure application design, defensive
                security, and AI security.
              </p>
              <span className="status">Learning focus</span>
            </article>
          </div>
        </section>
        <section id="journey" className="section journey">
          <div>
            <p className="eyebrow">03 / Engineering journey</p>
            <h2>
              Build. Understand.
              <br />
              Improve.
            </h2>
            <p>
              This portfolio is also my engineering laboratory: a place to
              practice, document decisions, and develop with security in mind.
            </p>
          </div>
          <div className="milestones">
            <article>
              <span className="status">Current foundation</span>
              <h3>Building for the web</h3>
              <p>
                Developing this portfolio with React and TypeScript, from
                reusable components to interactive project views.
              </p>
            </article>
            <article>
              <span className="status">Next steps</span>
              <h3>Intelligent, secure systems</h3>
              <p>
                Deepening Python, backend engineering, and security fundamentals
                through practical projects.
              </p>
            </article>
            <article>
              <span className="status">Certifications</span>
              <h3>Learning backed by evidence</h3>
              <p>Verified credentials will be added here as they are earned.</p>
            </article>
          </div>
        </section>
        <section id="contact" className="section contact">
          <p className="eyebrow">04 / Contact</p>
          <h2>
            Good work starts
            <br />
            with a conversation.
          </h2>
          <p>
            Interested in software engineering, AI, and cybersecurity
            collaborations.
          </p>
          <p>
            Professional contact details and profile links will be added soon.
          </p>
          <a className="text-link" href="#projects">
            Explore my work ↗
          </a>
        </section>
      </main>
      <footer>
        <a className="brand" href="#about">
          JA<span>.</span>
        </a>
        <p>John Abah · Built with curiosity and care.</p>
        {import.meta.env.DEV && <a href="#manage-projects">Owner login</a>}
        <a href="#about">Back to top ↑</a>
      </footer>
    </>
  );
}

export default App;

function About() {
  return (
    <section id="about" className="hero section">
      <div>
        <p className="eyebrow">John Abah / Engineering portfolio</p>
        <h1>
          Thoughtful software.
          <br />
          <span>Intelligent solutions.</span>
          <br />
          Security in mind.
        </h1>
        <p className="hero-intro">
          I'm John, an emerging software engineer exploring the intersection of
          full stack development, artificial intelligence, and cybersecurity.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#projects">
            Explore my projects ↗
          </a>
          <a className="text-link" href="#journey">
            My engineering journey →
          </a>
        </div>
      </div>
      <div className="engineering-panel">
        <div className="panel-top">
          <span className="live-dot" /> Always learning <span>/ 001</span>
        </div>
        <div className="orbit" aria-hidden="true">
          <div className="orbit-inner">
            <span>JA</span>
            <small>BUILD WITH INTENT</small>
          </div>
          <span className="orbit-label label-software">Software</span>
          <span className="orbit-label label-ai">AI</span>
          <span className="orbit-label label-security">Security</span>
        </div>
        <p>
          Think in systems.
          <br />
          Build with purpose.
        </p>
        <div className="panel-bottom">Curiosity → Practice → Progress</div>
      </div>
      <div className="hero-bottom">
        <span>SOFTWARE ENGINEERING</span>
        <span>ARTIFICIAL INTELLIGENCE</span>
        <span>CYBERSECURITY</span>
      </div>
    </section>
  );
}

export default About;

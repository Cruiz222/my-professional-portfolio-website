import { useEffect, useState } from "react";
function About() {
  const [image, setImage] = useState("/profile.png");
  useEffect(() => {
    const load = () => { fetch("/profile.json", {cache:"no-store"}).then(r => r.json()).then(d => setImage(d.image || "/profile.png")).catch(() => {}); };
    load(); window.addEventListener("focus", load); window.addEventListener("portfolio-profile-updated", load);
    return () => { window.removeEventListener("focus", load); window.removeEventListener("portfolio-profile-updated", load); };
  }, []);
  return (
    <section id="about" className="hero section">
      <img className="portrait-backdrop" src={image} alt="" aria-hidden="true" />
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
      <div className="engineering-panel portrait-panel">
        <img className="floating-portrait" src={image} alt="John Abah at work" />
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

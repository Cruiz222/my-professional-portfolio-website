function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#about" aria-label="John Abah home">
        JA<span>.</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="#skills">Skills</a>
        <a href="#journey">Journey</a>
        <a className="nav-contact" href="#contact">
          Let's connect ↗
        </a>
      </nav>
    </header>
  );
}

export default Header;

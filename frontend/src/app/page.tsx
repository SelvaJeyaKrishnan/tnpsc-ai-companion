import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Capture your study",
    description: "Photograph a textbook page and turn it into searchable study material."
  },
  {
    number: "02",
    title: "Ask your materials",
    description: "Explore your own notes with answers grounded in retrieved passages."
  },
  {
    number: "03",
    title: "Verify with trusted sources",
    description: "Compare personal notes with a curated library of reliable references."
  },
  {
    number: "04",
    title: "Revise intelligently",
    description: "Build toward topic-wise quizzes, progress tracking and spaced revision."
  }
];

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <Link className="brand" href="/" aria-label="TNPSC AI Companion home">
          <span className="brand-mark">T</span>
          <span>TNPSC <b>AI Companion</b></span>
        </Link>
        <span className="nav-label">EARLY DEVELOPMENT PREVIEW</span>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span className="pulse" /> YOUR PERSONAL LEARNING SPACE</div>
        <h1>Study smarter.<br /><span>Remember longer.</span></h1>
        <p className="hero-copy">
          Turn the pages you study into a personal learning space.
          Ask questions, check reliable references and prepare for your next revision.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#features">Explore the platform <span>↗</span></a>
          <span className="build-note">Built for TNPSC aspirants</span>
        </div>

        <div className="preview-card">
          <div className="preview-top">
            <div>
              <div className="preview-kicker">YOUR LEARNING WORKSPACE</div>
              <h2>Good learning starts with a plan.</h2>
            </div>
            <span className="preview-status">FOUNDATION</span>
          </div>
          <div className="preview-grid">
            <div className="preview-tile capture">
              <span className="tile-icon">⌗</span>
              <span className="tile-label">STUDY MATERIAL</span>
              <strong>Capture a page</strong>
              <small>Bring your printed notes into your study space.</small>
            </div>
            <div className="preview-tile ask">
              <span className="tile-icon">✳</span>
              <span className="tile-label">PERSONAL AI</span>
              <strong>Ask your notes</strong>
              <small>Find concepts inside the material you have studied.</small>
            </div>
            <div className="preview-tile verify">
              <span className="tile-icon">✓</span>
              <span className="tile-label">TRUSTED KNOWLEDGE</span>
              <strong>Check the evidence</strong>
              <small>Compare answers with reliable reference sources.</small>
            </div>
          </div>
          <div className="preview-footer">
            <span><i className="dot blue" /> Personal study material</span>
            <span><i className="dot green" /> Verified reference library</span>
            <span className="preview-foot-note">Product preview · Features in development</span>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <div className="eyebrow">THE PRODUCT DIRECTION</div>
          <h2>From a page to <span>real understanding.</span></h2>
          <p>A connected study workflow designed around how aspirants already learn.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span>{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <span>TNPSC AI Companion</span>
        <span>Learning with evidence, one page at a time.</span>
      </footer>
    </main>
  );
}

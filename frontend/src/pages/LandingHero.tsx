import React from 'react';
import { useNavigate } from 'react-router-dom';

const featureBars = [
  { type: 'soft', height: '20%' },
  { type: 'strong', height: '80%' },
  { type: 'soft', height: '40%' },
  { type: 'strong', height: '95%', callout: 'Excuse spike' },
  { type: 'soft', height: '30%' },
  { type: 'strong', height: '60%' },
];

const LandingHero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <button className="landing-logo" onClick={() => navigate('/')}>
            Realistic Coach
          </button>

          <nav className="landing-nav">
            <a href="#product">Product</a>
            <a href="#routines">Routines</a>
            <a href="#pricing">Pricing</a>
          </nav>

          <div className="landing-actions">
            <button className="landing-primary-button" onClick={() => navigate('/onboarding')}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero-section">
          <div className="landing-hero-copy">
            <h1>
              Discipline with <span>Understanding.</span>
            </h1>
            <p>
              The only productivity system that respects your biology. Track tasks, build
              routines, and adjust for real life without the endless excuses.
            </p>

            <div className="landing-hero-actions">
              <button className="landing-primary-button large" onClick={() => navigate('/onboarding')}>
                Start Your 14-Day Streak
              </button>
              <button className="landing-secondary-button" onClick={() => navigate('/dashboard')}>
                Watch Demo
              </button>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-image-glow" />
            <div className="landing-dashboard-card">
              <img
                alt="Realistic Coach dashboard preview"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADr1vqs2OSxwoAWYmIdbKBpPePC4Gsg3Z7X4Lu0jiZNEm1MLXrHQwzOwAytl6taRa4HP8bqEClnvLIdxbg6sGzd9OsD14HLhLM1KUQ2HWGpJ3K2vXra0lZqe1XY7m0LIKAU9AQd29sgIKAcRU0gpfeTwK7BC-4awdyfWrQ51Pe4BdQeJ76h7lMA0_ADDFZNi3-oNmmxL4Zmfz7zph1SW9OopDzNSh_pyZf2MqdFGPt8sRfuP8LY6xM6jOiB-Zr6XOYO98sCZYM1vE"
              />
            </div>
          </div>

          <div className="landing-orb orb-right" />
          <div className="landing-orb orb-left" />
        </section>

        <section id="product" className="landing-philosophy-section">
          <div className="landing-section-heading">
            <h2>Planner + Strict Friend + Realistic Coach</h2>
            <div className="landing-heading-line" />
          </div>

          <div className="landing-philosophy-grid">
            <article className="landing-feature-card">
              <span className="landing-feature-icon">edit_calendar</span>
              <h3>Tasks for Flexibility</h3>
              <p>
                Move tasks up to three times. Life happens, we just track it. If it moves a
                fourth time, we have a talk.
              </p>
            </article>

            <article id="routines" className="landing-feature-card">
              <span className="landing-feature-icon">bolt</span>
              <h3>Routines for Discipline</h3>
              <p>
                Non-negotiables that stay fixed. Mark as Done, Skipped, or Missed. Integrity
                is built in the non-negotiables.
              </p>
            </article>

            <article className="landing-feature-card">
              <span className="landing-feature-icon">psychology</span>
              <h3>Cycle Intelligence</h3>
              <p>
                Automatically adjusts your load based on energy, mood, and your biological
                cycle. Performance is not linear.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-bento-section">
          <div className="landing-bento-grid">
            <article className="landing-bento-card large">
              <div>
                <h3>The Excuse Meter</h3>
                <p>
                  See the honest patterns behind your delays. We track why you postpone so
                  the friction points stop staying invisible.
                </p>
              </div>

              <div className="landing-bar-chart">
                {featureBars.map((bar, index) => (
                  <div key={`${bar.type}-${index}`} className={`landing-bar ${bar.type}`}>
                    <span style={{ height: bar.height }} />
                    {bar.callout && <em>{bar.callout}</em>}
                  </div>
                ))}
              </div>
            </article>

            <article className="landing-bento-card side">
              <div className="landing-badge-circle">flare</div>
              <div>
                <h3>Energy Horizon</h3>
                <p>Forecast your focus based on your biological clock and sleep quality.</p>
              </div>
              <div className="landing-meter-card">
                <div className="landing-meter-row">
                  <span>Peak focus</span>
                  <strong>10:00 AM</strong>
                </div>
                <div className="landing-meter-track">
                  <div className="landing-meter-fill" />
                </div>
              </div>
            </article>

            <article className="landing-bento-card full">
              <div>
                <h3>Hard Day Mode</h3>
                <p>
                  One-tap adjustment when life gets messy. We automatically triage your list,
                  keeping only the absolute essentials while deferring the rest without guilt.
                </p>
              </div>
              <button className="landing-warning-button" onClick={() => navigate('/dashboard')}>
                <span>warning</span>
                ACTIVATE HARD MODE
              </button>
            </article>
          </div>
        </section>

        <section id="pricing" className="landing-cta-section">
          <div className="landing-cta-content">
            <h2>Ready to stay on track?</h2>
            <p>
              Join high-performers who stopped fighting their biology and started
              working with it.
            </p>
            <button className="landing-primary-button xl" onClick={() => navigate('/onboarding')}>
              Get Started for Free
            </button>
            <small>No credit card required. 14-day streak challenge starts today.</small>
          </div>

          <div className="landing-cta-glow glow-left" />
          <div className="landing-cta-glow glow-right" />
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <div className="landing-footer-brand">Realistic Coach</div>
            <p>© 2024 The Realistic Coach. Precision Productivity.</p>
          </div>
          <div className="landing-footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#support">Support</a>
            <a href="#twitter">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingHero;

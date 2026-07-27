import { Link } from "react-router-dom";
import heroPng from "../assets/hero.png";

function Home() {
  return (
    <div className="home-container">
      {/* Navigation Header */}
      <header className="home-header">
        <div className="header-inner">
          <div className="home-brand">
            <span className="brand-logo" aria-hidden="true">
              ❖
            </span>
            <span className="brand-name">Ecommerce</span>
          </div>

          <nav className="header-nav" aria-label="Authentication navigation">
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="home-main">
        <section className="hero-section">
          <div className="hero-grid">
            {/* Left Hero Content */}
            <div className="hero-text-content">
              <span className="hero-badge">Fast • Secure • Simple</span>

              <h1 className="hero-heading">
                Buy smarter. Sell faster.
                <span className="heading-gradient"> Everything in one place.</span>
              </h1>

              <p className="hero-subtext">
                A modern storefront experience for buyers and an intuitive dashboard for
                sellers. Start today—log in or create your account in minutes.
              </p>

              <div className="hero-cta-group">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Create free account
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  I already have an account
                </Link>
              </div>

              {/* Feature Highlights Grid */}
              <div className="feature-cards-grid">
                <div className="feature-card">
                  <div className="feature-icon-wrapper" aria-hidden="true">⚡</div>
                  <div className="feature-details">
                    <h3 className="feature-title">Quick Onboarding</h3>
                    <p className="feature-desc">OTP verification protects your profile</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper" aria-hidden="true">🛡️</div>
                  <div className="feature-details">
                    <h3 className="feature-title">Role-Based Dashboards</h3>
                    <p className="feature-desc">Dedicated tools for buyers & sellers</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper" aria-hidden="true">💳</div>
                  <div className="feature-details">
                    <h3 className="feature-title">Smooth Experience</h3>
                    <p className="feature-desc">Fast, modern, and responsive UI</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="hero-visual-wrapper">
              <div className="visual-card">
                <img
                  src={heroPng}
                  alt="Ecommerce platform preview showcase"
                  className="hero-image"
                  draggable={false}
                />
              </div>
              <div className="visual-glow-effect" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Audience Split Section */}
        <section className="audience-section">
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-badge">For Buyers</div>
              <h2 className="audience-title">Find items you love</h2>
              <p className="audience-desc">
                Browse available products, add items to your cart, and enjoy a seamless, high-speed checkout flow.
              </p>
              <div className="tag-group">
                <span className="tag">Discover products</span>
                <span className="tag">Add to cart</span>
                <span className="tag">Instant tracking</span>
              </div>
            </div>

            <div className="audience-card audience-card-highlight">
              <div className="audience-badge audience-badge-alt">For Sellers</div>
              <h2 className="audience-title">Scale your store</h2>
              <p className="audience-desc">
                Manage your product catalog from a dedicated seller dashboard and keep listings fresh in real time.
              </p>
              <div className="tag-group">
                <span className="tag">Add products</span>
                <span className="tag">Manage inventory</span>
                <span className="tag">Analytics view</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-logo" aria-hidden="true">❖</span>
            <span className="brand-name">Ecommerce</span>
          </div>
          <p className="footer-text">
            Log in or sign up to experience a modern marketplace designed for clarity and speed.
          </p>
          <p className="footer-copy">© {new Date().getFullYear()} Ecommerce Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
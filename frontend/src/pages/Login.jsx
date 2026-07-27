import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginMutation } from "../services/authApi";

function Login() {
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle Login
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(formData).unwrap();

      // Save user session details
      localStorage.setItem("name", res.name);
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);

      // Redirect based on role
      if (res.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/buyer/dashboard");
      }
    } catch (error) {
      // Handles RTK Query error responses reliably
      alert(error?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Side: Login Form */}
        <main className="auth-form-wrapper">
          <header className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Enter your credentials to access your account.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="auth-input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label className="auth-label" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="auth-link-subtle">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <p className="auth-footer">
              Don't have an account?{" "}
              <Link to="/signup" className="auth-link">
                Create Account
              </Link>
            </p>
          </form>
        </main>

        {/* Right Side: Hero Visual Panel */}
        <aside className="auth-hero">
          <div className="hero-content">
            <span className="hero-badge">Shop • Sell • Track</span>
            <h2 className="hero-title">
              Your marketplace, powered by seamless access.
            </h2>
            <p className="hero-desc">
              Sign in to manage product listings, process active orders, and track your business performance from a single hub.
            </p>
            <div className="hero-highlights">
              <div className="highlight-item">⚡ Fast & Secure Checkout</div>
              <div className="highlight-item">🛍️ Dedicated Seller & Buyer Dashboards</div>
              <div className="highlight-item">📦 Real-time Order Tracking</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Login;
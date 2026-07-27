import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignupMutation } from "../services/authApi";

function Signup() {
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    city: "",
    country: "",
    role: "buyer",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({
        ...formData,
        age: Number(formData.age), // Format age correctly for the backend
      }).unwrap();

      navigate("/otp-verification", {
        state: { email: formData.email },
      });
    } catch (error) {
      alert(error?.data?.message || "Signup Failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left Side: Form Section */}
        <main className="auth-form-wrapper">
          <header className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Join us in a minute. Verify OTP to get started.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Account Details Group */}
            <fieldset className="auth-section">
              <legend className="auth-section-title">Account Details</legend>
              <div className="auth-grid auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="auth-input"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="auth-input"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="auth-grid auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="auth-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="auth-input"
                    placeholder="+1 234 567 890"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Profile Information Group */}
            <fieldset className="auth-section">
              <legend className="auth-section-title">Personal Info</legend>
              <div className="auth-grid auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    className="auth-input"
                    placeholder="25"
                    min="18"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    className="auth-select"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label" htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="auth-input"
                  placeholder="Street Address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="auth-grid auth-grid-2">
                <div className="auth-field">
                  <label className="auth-label" htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className="auth-input"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    className="auth-input"
                    placeholder="United States"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </fieldset>

            {/* Role Switcher */}
            <div className="auth-field">
              <label className="auth-label">Account Type</label>
              <div className="role-selector">
                <label className={`role-card ${formData.role === "buyer" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="buyer"
                    checked={formData.role === "buyer"}
                    onChange={handleChange}
                  />
                  <span>🛍️ Buyer</span>
                </label>

                <label className={`role-card ${formData.role === "seller" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={formData.role === "seller"}
                    onChange={handleChange}
                  />
                  <span>🏪 Seller</span>
                </label>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register Account"}
            </button>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Log in</Link>
            </p>
          </form>
        </main>

        {/* Right Side: Hero Visual Panel */}
        <aside className="auth-hero">
          <div className="hero-content">
            <span className="hero-badge">Welcome Aboard</span>
            <h2 className="hero-title">Experience effortless buying & selling.</h2>
            <p className="hero-desc">
              Get access to direct seller dashboards, smooth ordering workflows, and real-time shipment updates.
            </p>
            <div className="hero-highlights">
              <div className="highlight-item">🛡️ Secure OTP Verification</div>
              <div className="highlight-item">⚡ Fast & Responsive Experience</div>
              <div className="highlight-item">📦 Comprehensive Order Tracking</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Signup;
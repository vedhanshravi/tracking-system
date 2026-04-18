import { useState } from "react";
import { useNavigate } from "react-router-dom";
import carLogo from "../trackpro-car.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setError("Login failed. Please verify your credentials.");
      }
    } catch (err) {
      setError("Unable to connect to the backend. Please make sure the API is running and the URL is correct.");
      console.error(err);
    }
  };

  return (
    <div className="page-container login-page">
      <div className="login-split">
        <section className="login-panel">
          <div className="brand-badge">
            <div className="brand-logo">
              <img src={carLogo} alt="TrackPro logo" className="brand-logo-img" />
            </div>
            <div className="brand-name">TrackPro</div>
          </div>

          <div className="hero-copy">
            <h2>Manage your vehicles with confidence.</h2>
            <p>Secure, paperless vehicle tracking, built for modern owners and fleets.</p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l6 3v5c0 4.66-3.11 8.95-6 9-2.89-.05-6-4.34-6-9V6l6-3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="feature-text">Bank-grade security</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="6" y="11" width="12" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <div className="feature-text">Encrypted credentials</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.5 15.5h1.75l1.45-3h8.6l1.5 3H19.5a1 1 0 0 0 1-1v-1.5a1 1 0 0 0-.3-.7l-2.35-2.35a1 1 0 0 0-.7-.3H14.5l-1.3-2.4A1 1 0 0 0 12.4 7H8.5a1 1 0 0 0-1 1V11H5.5a1 1 0 0 0-1 1v1.5a1 1 0 0 0 1 1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="17" r="1.5" fill="currentColor" />
                  <circle cx="16" cy="17" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className="feature-text">Real-time status tracking</div>
            </div>
          </div>

          <div className="panel-footer">© {new Date().getFullYear()} TrackPro. All rights reserved.</div>
        </section>

        <section className="auth-panel">
          <div className="auth-card">
            <h1>Welcome back</h1>
            <p className="page-subtitle">Sign in to your account to continue</p>

            <form className="form-grid" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              {error && <div className="alert-banner" style={{ marginTop: 0 }}>{error}</div>}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="input-field"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="link-row">
                <button className="link-btn" type="button" onClick={() => navigate("/reset")}>Forgot Password?</button>
                <button className="link-btn" type="button" onClick={() => navigate("/scanner")}>Vehicle Scanner</button>
              </div>

              <div className="form-actions">
                <button className="primary-btn" type="submit">Sign In</button>
                <button className="secondary-btn" type="button" onClick={() => navigate("/register")}>Register</button>
              </div>

              <button className="outline-btn" type="button" onClick={() => navigate("/admin-login")}>Executive Login</button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
 
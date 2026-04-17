import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
            <div className="brand-logo">🚗</div>
            <div className="brand-name">TrackPro</div>
          </div>

          <div className="hero-copy">
            <h2>Manage your vehicles with confidence.</h2>
            <p>Secure, paperless vehicle registration and tracking — built for modern owners and fleets.</p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🛡️</div>
              <div className="feature-text">Bank-grade security</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">Encrypted credentials</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚘</div>
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
 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import carLogo from "../trackpro-car.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

            <form autoComplete="off" className="form-grid" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              {error && <div className="alert-banner" style={{ marginTop: 0 }}>{error}</div>}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  autoComplete="off"
                  className="input-field"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="password-input-container">
                  <input
                    name="password"
                    autoComplete="off"
                    className="input-field"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="eye-icon">
                        <path d="M2.99902 3.00002L21 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 12 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 12 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.999 5C16.4784 5 20.2687 7.94291 21.5429 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="eye-icon">
                        <path d="M2.45703 12C3.73128 7.94291 7.52159 5 12 5C16.4784 5 20.2687 7.94291 21.5429 12C20.2687 16.0571 16.4784 19 12 19C7.52159 19 3.73128 16.0571 2.45703 12Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
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
 
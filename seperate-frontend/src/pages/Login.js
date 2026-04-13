import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="page-container">
      <div className="page-card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="page-hero">
          <div>
            <h2 className="page-title">Sign In</h2>
            <p className="page-subtitle">Access your vehicle tracker dashboard and manage scans, support requests, and vehicle details with ease.</p>
          </div>
        </div>

        <div className="form-grid">
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

          <div className="button-row">
            <button className="primary-btn" onClick={handleLogin}>Login</button>
            <button className="secondary-btn" onClick={() => navigate("/register")}>Register</button>
          </div>

          <div className="button-row" style={{ justifyContent: "space-between" }}>
            <button className="link-btn" type="button" onClick={() => navigate("/reset")}>Forgot Password?</button>
            <button className="link-btn" type="button" onClick={() => navigate("/scanner")}>Vehicle Scanner</button>
          </div>

          <button className="outline-btn" type="button" onClick={() => navigate("/admin-login")}>Executive Login</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
 
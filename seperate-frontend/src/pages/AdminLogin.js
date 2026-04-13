import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
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

    if (!data.token) {
      alert("Admin login failed");
      return;
    }

    localStorage.setItem("token", data.token);

    const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.token}`,
      },
    });
    const userData = await userResponse.json();

    if (userResponse.ok && userData.role === "admin") {
      navigate("/admin");
    } else {
      localStorage.removeItem("token");
      alert("Admin access denied");
    }
  };

  return (
    <div className="page-container">
      <div className="page-card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="page-hero">
          <div>
            <h2 className="page-title">Executive Login</h2>
            <p className="page-subtitle">Enter your account credentials to manage vehicle verification and support requests.</p>
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

          <button className="primary-btn" onClick={handleLogin}>Login as Executive</button>
          <div className="button-row">
            <button className="link-btn" type="button" onClick={() => navigate("/reset")}>Forgot Password?</button>
            <button className="link-btn" type="button" onClick={() => navigate("/")}>Back to User Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

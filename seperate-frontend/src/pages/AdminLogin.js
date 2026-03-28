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
    <div style={{ padding: "50px" }}>
      <h2>Executive Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <br />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <button onClick={handleLogin}>Login as Executive</button>
      <p style={{ marginTop: 12 }}>
        <button onClick={() => navigate("/")}>Back to User Login</button>
      </p>
    </div>
  );
}

export default AdminLogin;

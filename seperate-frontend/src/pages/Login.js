import { useState } from "react";
import { useNavigate } from "react-router-dom";
 
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    const response = await fetch("http://localhost:5000/users/login", {
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
    <div style={{ padding: "50px" }}>
      <h2>Login</h2>
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
      <button onClick={handleLogin}>Login</button>
      <p style={{ marginTop: 12 }}>
        Don’t have an account?{" "}
        <button onClick={() => navigate("/register")}>Register</button>
      </p>      <p style={{ marginTop: 12 }}>
        <button onClick={() => navigate("/scan")}>Vehicle Scanner</button>
      </p>    </div>
  );
}

export default Login;
 
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!email || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Failed to reset password.");
        return;
      }
      setMessage("Password reset successful. Please login with your new password.");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Password Reset</h2>
      <label style={{ display: "block", margin: "10px 0 5px" }}>Email:</label>
      <input
        placeholder="Enter your registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label style={{ display: "block", margin: "10px 0 5px" }}>New Password:</label>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <label style={{ display: "block", margin: "10px 0 5px" }}>Confirm Password:</label>
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button style={{ marginTop: 20 }} onClick={handleReset}>
        Reset Password
      </button>
      {message && <p style={{ marginTop: 20 }}>{message}</p>}
      <p style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/")}>Back to Login</button>
      </p>
    </div>
  );
}

export default ResetPassword;

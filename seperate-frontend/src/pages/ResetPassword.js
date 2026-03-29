import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone) {
      alert("Please enter your registered mobile number.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/request-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Unable to send OTP.");
        setLoading(false);
        return;
      }
      setOtpSent(true);
      setMessage("OTP sent to your registered mobile number. Check your SMS.");
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!phone || !otp || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Failed to reset password.");
        return;
      }
      setMessage("Password reset successful. Please login with your new password.");
      setPhone("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setOtpSent(false);
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Password Reset</h2>

      <label style={{ display: "block", margin: "10px 0 5px" }}>Mobile Number:</label>
      <input
        placeholder="Enter your registered mobile number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {!otpSent ? (
        <>
          <button style={{ marginTop: 20 }} onClick={handleSendOtp} disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <label style={{ display: "block", margin: "10px 0 5px" }}>OTP:</label>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
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
          <button style={{ marginTop: 20 }} onClick={handleReset} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </>
      )}

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
      <p style={{ marginTop: 20 }}>
        <button onClick={() => navigate("/")}>Back to Login</button>
      </p>
    </div>
  );
}

export default ResetPassword;

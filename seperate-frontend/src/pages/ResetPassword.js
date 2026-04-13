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
    <div className="page-container">
      <div className="page-card" style={{ maxWidth: 560, margin: "0 auto" }}>
        <div className="page-hero">
          <div>
            <h2 className="page-title">Reset Your Password</h2>
            <p className="page-subtitle">Securely reset your account using the OTP sent to your registered mobile number.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input
              className="input-field"
              placeholder="Enter your registered mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {!otpSent ? (
            <button className="primary-btn" onClick={handleSendOtp} disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">OTP</label>
                <input
                  className="input-field"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button className="primary-btn" onClick={handleReset} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}

          {message && <p style={{ marginTop: 8, color: "var(--muted)" }}>{message}</p>}

          <button className="link-btn" type="button" onClick={() => navigate("/")}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

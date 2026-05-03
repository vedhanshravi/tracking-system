import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            <div className="phone-input-wrapper">
              <span className="phone-prefix">+91</span>
              <input
                className="input-field"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit registered number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
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
                <div className="password-input-container">
                  <input
                    className="input-field"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
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
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="password-input-container">
                  <input
                    className="input-field"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
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

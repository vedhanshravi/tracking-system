import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";

function Call() {
  const { vehicleNumber } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const callType = query.get("type") === "emergency" ? "emergency" : "owner";

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vehicleNumber,
          callType,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message || "Unable to connect the call. Please try again.");
        setStatus("");
      } else {
        setStatus("Call request submitted. The selected contact will receive a call from our Exotel service shortly.");
      }
    } catch (err) {
      console.error("Error connecting call:", err);
      setError("Unable to connect call. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card" style={{ maxWidth: 620, margin: "0 auto" }}>
        <div className="page-hero">
          <div>
            <h2 className="page-title">Connect Call</h2>
            <p className="page-subtitle">
              Connect to the {callType === "emergency" ? "emergency contact" : "vehicle owner"} for vehicle <strong>{vehicleNumber}</strong>.
            </p>
          </div>
        </div>

        <div className="section-title">Call with Exotel</div>
        <div className="help-card">
          <p>
            This will place a call from our Exotel service to the selected contact for vehicle <strong>{vehicleNumber}</strong>.
          </p>
        </div>

        <div className="button-row" style={{ marginTop: 16, justifyContent: "flex-start" }}>
          <button className="primary-btn" type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Connecting..." : "Place Call"}
          </button>
        </div>

        {status && <p className="success-banner" style={{ marginTop: 16 }}>{status}</p>}
        {error && <p className="alert-banner" style={{ marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  );
}

export default Call;

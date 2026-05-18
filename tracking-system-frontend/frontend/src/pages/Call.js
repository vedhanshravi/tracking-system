import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

function Call() {
  const { vehicleNumber } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const callType = query.get("type") || "owner";
  const [showWarning, setShowWarning] = useState(callType === "emergency");
  const [callInitiated, setCallInitiated] = useState(false);

  const initiateCall = useCallback(async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/vehicles/set-twiml`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ vehicleNumber, callType }),
      });

      setCallInitiated(true);
      const exotelNumber = process.env.REACT_APP_EXOTEL_PHONE_NUMBER || "08040265507";
      window.location.href = `tel:${exotelNumber}`;
    } catch (error) {
      console.error("Error initiating call:", error);
    }
  }, [vehicleNumber, callType]);

  useEffect(() => {
    // Only initiate call if not emergency or if warning was acknowledged
    if (callType !== "emergency" && !callInitiated) {
      initiateCall();
    }
  }, [callType, callInitiated, initiateCall]);

  const handleEmergencyConfirm = () => {
    setShowWarning(false);
    initiateCall();
  };

  const handleEmergencyCancel = () => {
    // Redirect back or close
    window.history.back();
  };

  return (
    <>
      {showWarning && (
        <div
          className="scan-modal-overlay"
          role="dialog"
          aria-modal="true"
        >
          <div className="scan-modal-content">
            <div 
              className="scan-modal-icon" 
              style={{ 
                background: 'linear-gradient(135deg, #ff8a9b, #ff6b7a)',
                color: '#fff'
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 20h20L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="scan-modal-title">Emergency Warning</h3>
            <p className="scan-modal-message">
              Genuine emergencies only. Misuse may cause panic and lead to legal consequences.
            </p>
            <div className="form-actions" style={{ gap: 12, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={handleEmergencyCancel}
                style={{ minWidth: 120 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-btn"
                onClick={handleEmergencyConfirm}
                style={{ minWidth: 160 }}
              >
                Call Emergency Contact
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="page-container">
        <div className="page-card" style={{ maxWidth: 620, margin: "0 auto" }}>
          <div className="page-hero">
            <div>
              <h2 className="page-title">Starting Call</h2>
              <p className="page-subtitle">Connecting your call for vehicle <strong>{vehicleNumber}</strong>. Please allow your dial pad to open and complete the call.</p>
            </div>
          </div>

          <div className="section-title">Call Status</div>
          <div className="help-card">
            <p>Calling the {callType === "emergency" ? "emergency contact" : "owner"} now. If the dial pad does not open automatically, please try again or check your device settings.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Call;

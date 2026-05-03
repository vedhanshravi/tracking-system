import { useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";

function Call() {
  const { vehicleNumber } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const callType = query.get("type") || "owner";

  useEffect(() => {
    const initiateCall = async () => {
      try {
        await fetch(`${process.env.REACT_APP_API_URL}/vehicles/set-twiml`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vehicleNumber, callType }),
        });

        const twilioNumber = process.env.REACT_APP_TWILIO_PHONE_NUMBER || "+13502206189";
        window.location.href = `tel:${twilioNumber}`;
      } catch (error) {
        console.error("Error initiating call:", error);
      }
    };

    initiateCall();
  }, [vehicleNumber, callType]);

  return (
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
          <p>Calling the {callType} now. If the dial pad does not open automatically, please try again or check your device settings.</p>
        </div>
      </div>
    </div>
  );
}

export default Call;

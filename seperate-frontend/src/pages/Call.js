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
    <div style={{ padding: "50px" }}>
      <h2>Initiating Call for Vehicle: {vehicleNumber}</h2>
      <p>Your dial pad should open shortly. Please make the call to connect with the owner.</p>
    </div>
  );
}

export default Call;
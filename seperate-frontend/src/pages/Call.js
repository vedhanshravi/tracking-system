import { useParams } from "react-router-dom";
import { useEffect } from "react";

function Call() {
  const { vehicleNumber } = useParams();

  useEffect(() => {
    const initiateCall = async () => {
      try {
        // Set the TwiML URL for the Twilio number
        await fetch(`${process.env.REACT_APP_API_URL}/vehicles/set-twiml`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vehicleNumber }),
        });

        // Open the dial pad
        window.location.href = `tel:+13502206189`; // Replace with your Twilio number

      } catch (error) {
        console.error("Error initiating call:", error);
      }
    };

    initiateCall();
  }, [vehicleNumber]);

  return (
    <div style={{ padding: "50px" }}>
      <h2>Initiating Call for Vehicle: {vehicleNumber}</h2>
      <p>Your dial pad should open shortly. Please make the call to connect with the owner.</p>
    </div>
  );
}

export default Call;
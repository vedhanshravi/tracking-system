import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function Scan() {
  const { vehicleNumber } = useParams();
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/vehicles/scan`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ vehicleNumber }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Vehicle not found");
          return;
        }

        setOwner(data);

      } catch (err) {
        setError("Server error");
      }
    };

    fetchVehicle();
  }, [vehicleNumber]);

  const startCall = async () => {
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

  return (
    <div style={{ padding: "50px" }}>
      <h2>Vehicle Information</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {owner && (
        <div>
          <p><strong>Name:</strong> {owner.ownerName}</p>
          <p><strong>Contact:</strong> {owner.phone}</p>

          <button
            onClick={startCall}
            style={{ marginTop: "10px" }}
          >
          📞 Call Owner
          </button>
        </div>
      )}
    </div>
  );
}

export default Scan;
 
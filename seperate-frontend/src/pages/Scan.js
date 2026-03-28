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

  const startCall = (phoneNumber) => {
    if (!phoneNumber) {
      return;
    }

    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Vehicle Information</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {owner && (
        <div>
          <p><strong>Name:</strong> {owner.ownerName}</p>
          <p><strong>Owner Contact:</strong> {owner.phone}</p>

          <button
            onClick={() => startCall(owner.ownerPhone)}
            style={{ marginTop: "10px", display: "block", marginBottom: "10px" }}
          >
            📞 Parking issues - Call Owner
          </button>

          <button
            onClick={() => startCall(owner.emergencyContact)}
            disabled={!owner.emergencyContact}
            style={{ marginBottom: "10px" }}
          >
            🚑 Medical Emergency - Call Emergency Contact
          </button>

          {owner.emergencyContact && (
            <p><strong>Emergency Contact:</strong> {owner.emergencyContact}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Scan;
 
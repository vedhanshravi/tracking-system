import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Scan() {
  const { vehicleNumber } = useParams();
  const navigate = useNavigate();
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

  const startCall = (callType) => {
    if (!vehicleNumber) return;
    navigate(`/call/${vehicleNumber}?type=${callType}`);
  };

  const maskPhone = (phone) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    const visible = digits.slice(-3);
    return digits.length > 3 ? `XXXXXXX${visible}` : phone;
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
            onClick={() => startCall("owner")}
            style={{ marginTop: "10px", display: "block", marginBottom: "10px" }}
          >
            📞 Parking issues - Call Owner
          </button>

          <button
            onClick={() => startCall("emergency")}
            disabled={!owner.emergencyContact}
            style={{ marginBottom: "10px" }}
          >
            🚑 Medical Emergency - Call Emergency Contact
          </button>

          {owner.emergencyContact && (
            <p><strong>Emergency Contact:</strong> {maskPhone(owner.emergencyContact)}</p>
          )}

          {owner.latitude && owner.longitude && (
            <div style={{ marginTop: "10px" }}>
              <p>
                <strong>Location:</strong> {owner.latitude}, {owner.longitude}
              </p>
              <a
                href={owner.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open route in Maps
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Scan;
 
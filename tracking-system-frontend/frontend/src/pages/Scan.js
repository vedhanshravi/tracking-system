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
        const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vehicleNumber }),
        });

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
    <div className="page-container">
      <div className="page-card" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="page-hero">
          <div>
            <h2 className="page-title">Vehicle Information</h2>
            <p className="page-subtitle">Check owner contact details, emergency contacts, and route information quickly from the scan results.</p>
          </div>
        </div>

        {error && <p className="alert-banner">{error}</p>}

        {owner ? (
          <div className="form-grid">
            <div className="help-card">
              <p><strong>Name:</strong> {owner.ownerName}</p>
              <p><strong>Owner Contact:</strong> {owner.phone}</p>
              {owner.emergencyContact && <p><strong>Emergency Contact:</strong> {maskPhone(owner.emergencyContact)}</p>}
              {owner.doNotDisturb && (
                <p style={{ color: '#f59e0b', fontWeight: 700, marginTop: 12 }}>
                  User is in do not disturb Mode.
                </p>
              )}
              {owner.latitude && owner.longitude && (
                <div style={{ marginTop: 12 }}>
                  <p><strong>Location:</strong> {owner.latitude}, {owner.longitude}</p>
                  <a href={owner.mapUrl} target="_blank" rel="noopener noreferrer" className="outline-btn" style={{ display: "inline-flex", textDecoration: "none", marginTop: 8 }}>
                    Open route in Maps
                  </a>
                </div>
              )}
            </div>

            <div className="button-row" style={{ flexDirection: "column", alignItems: "stretch", marginTop: 8 }}>
              <button className="primary-btn" onClick={() => startCall("owner")} disabled={owner.doNotDisturb}>📞 Parking issues - Call Owner</button>
              <button className="secondary-btn" onClick={() => startCall("emergency")} disabled={owner.doNotDisturb || !owner.emergencyContact}>🚑 Medical Emergency - Call Emergency Contact</button>
            </div>
          </div>
        ) : (
          !error && <p className="page-subtitle">Loading vehicle information...</p>
        )}
      </div>
    </div>
  );
}

export default Scan;
 
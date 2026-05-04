import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Scan() {
  const { vehicleNumber } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState("");
  const [scanLocation, setScanLocation] = useState(null);
  const [scanLocationError, setScanLocationError] = useState("");
  const [isFetchingScanLocation, setIsFetchingScanLocation] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchVehicle = async (coords) => {
      try {
        const payload = { vehicleNumber };
        if (coords?.latitude != null && coords?.longitude != null) {
          payload.scanLatitude = coords.latitude;
          payload.scanLongitude = coords.longitude;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!isMounted) return;

        if (!response.ok) {
          setError(data?.message || "Vehicle not found");
          return;
        }

        setOwner(data);
      } catch (err) {
        if (!isMounted) return;
        setError("Server error");
      }
    };

    const fetchWithLocation = () => {
      if (!navigator.geolocation) {
        setScanLocationError("Location is not available in this browser.");
        setIsFetchingScanLocation(false);
        fetchVehicle(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setScanLocation(coords);
          setIsFetchingScanLocation(false);
          fetchVehicle(coords);
        },
        (_) => {
          if (!isMounted) return;
          setScanLocationError("Unable to get current location. Please allow location access.");
          setIsFetchingScanLocation(false);
          fetchVehicle(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    fetchWithLocation();

    return () => {
      isMounted = false;
    };
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

              {isFetchingScanLocation && (
                <p className="page-subtitle">Detecting scan location...</p>
              )}

              {scanLocationError && (
                <p style={{ color: '#f59e0b', fontWeight: 700, marginTop: 12 }}>{scanLocationError}</p>
              )}

              {scanLocation && (
                <div style={{ marginTop: 12 }}>
                  <p><strong>Scanned at:</strong> {scanLocation.latitude.toFixed(6)}, {scanLocation.longitude.toFixed(6)}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${scanLocation.latitude},${scanLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="outline-btn"
                    style={{ display: "inline-flex", textDecoration: "none", marginTop: 8 }}
                  >
                    Open scanned location in Maps
                  </a>
                </div>
              )}

              {owner.latitude && owner.longitude && (
                <div style={{ marginTop: 12 }}>
                  <p><strong>Owner location:</strong> {owner.latitude}, {owner.longitude}</p>
                  <a href={owner.mapUrl} target="_blank" rel="noopener noreferrer" className="outline-btn" style={{ display: "inline-flex", textDecoration: "none", marginTop: 8 }}>
                    Open owner route in Maps
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
 
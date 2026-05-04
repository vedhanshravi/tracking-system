import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import carLogo from "../trackpro-car.svg";

function Scan() {
  const { vehicleNumber } = useParams();
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState("");
  const [scanLocation, setScanLocation] = useState(null);
  const [serverScanLocation, setServerScanLocation] = useState(null);
  const [scanAccuracy, setScanAccuracy] = useState(null);
  const [scanLocationError, setScanLocationError] = useState("");
  const [isFetchingScanLocation, setIsFetchingScanLocation] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let watchId = null;
    let fetchTriggered = false;

    const fetchVehicle = async (coords) => {
      try {
        const payload = { vehicleNumber };
        if (coords?.latitude != null && coords?.longitude != null) {
          payload.scanLatitude = coords.latitude;
          payload.scanLongitude = coords.longitude;
          if (coords.accuracy != null) payload.scanAccuracy = coords.accuracy;
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
        if (data?.scanLatitude != null && data?.scanLongitude != null) {
          setServerScanLocation({
            latitude: data.scanLatitude,
            longitude: data.scanLongitude,
          });
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Scan error:", err);
        setError("Server error");
      }
    };

    const handlePosition = (position) => {
      if (!isMounted) return;
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };
      setScanLocation(coords);
      setScanAccuracy(coords.accuracy);
      setScanLocationError("");
      setIsFetchingScanLocation(false);
      if (!fetchTriggered) {
        fetchTriggered = true;
        fetchVehicle(coords);
      }
    };

    const handleLocationError = (error) => {
      if (!isMounted) return;
      let errorMsg = "Unable to get current location.";
      if (error.code === 1) {
        errorMsg = "Location permission denied. Please allow location access in browser settings.";
      } else if (error.code === 2) {
        errorMsg = "Location temporarily unavailable. Please try again.";
      } else if (error.code === 3) {
        errorMsg = "Location request timed out. Please try again.";
      }
      setScanLocationError(errorMsg);
      setIsFetchingScanLocation(false);
      if (!fetchTriggered) {
        fetchTriggered = true;
        fetchVehicle(null);
      }
    };

    if (!navigator.geolocation) {
      setScanLocationError("Location is not available in this browser.");
      setIsFetchingScanLocation(false);
      fetchVehicle(null);
    } else {
      watchId = navigator.geolocation.watchPosition(handlePosition, handleLocationError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    }

    return () => {
      isMounted = false;
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
      }
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
        <div className="page-hero" style={{ alignItems: 'center', gap: 16 }}>
          <img src={carLogo} alt="TrackPro logo" style={{ width: 48, height: 48 }} />
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

              {(scanLocation || serverScanLocation) && (
                <div style={{ marginTop: 12 }}>
                  <p><strong>Scanned at:</strong> {(scanLocation || serverScanLocation).latitude.toFixed(6)}, {(scanLocation || serverScanLocation).longitude.toFixed(6)}</p>
                  {scanAccuracy != null && scanLocation && (
                    <p style={{ margin: 2, color: '#64748b' }}>Accuracy: {scanAccuracy} meters</p>
                  )}
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
 
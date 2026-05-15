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
  const [scanId, setScanId] = useState(null);
  const [photoUploadStatus, setPhotoUploadStatus] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmLabel, setModalConfirmLabel] = useState("OK");
  const [modalCancelLabel, setModalCancelLabel] = useState("");
  const [modalAction, setModalAction] = useState(null);

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
        setScanId(data?.scanId || null);
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

  const handlePhotoCapture = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !scanId) return;

    setPhotoUploadStatus("Uploading photo...");

    try {
      const formData = new FormData();
      formData.append("scanId", scanId);
      formData.append("scanPhoto", file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/scan/photo`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setPhotoUploadStatus(data?.message || "Photo upload failed");
        setPhotoUploaded(false);
        return;
      }

      setPhotoPreviewUrl(data.scanImageUrl || URL.createObjectURL(file));
      setPhotoUploadStatus("Photo uploaded successfully");
      setPhotoUploaded(true);
    } catch (uploadError) {
      console.error("Photo upload error:", uploadError);
      setPhotoUploadStatus("Photo upload failed");
      setPhotoUploaded(false);
    }
  };

  const openModal = ({ title, message, confirmLabel = "OK", cancelLabel = "", action = null }) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalConfirmLabel(confirmLabel);
    setModalCancelLabel(cancelLabel);
    setModalAction(action);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
  };

  const handleOwnerCall = () => {
    if (!photoUploaded) {
      openModal({
        title: "Upload Required",
        message: "Please capture and upload a photo before calling the owner.",
        confirmLabel: "OK",
      });
      return;
    }
    startCall("owner");
  };

  const handleEmergencyCall = () => {
    openModal({
      title: "Emergency Warning",
      message: "Genuine emergencies only. Misuse may cause panic and lead to legal consequences.",
      confirmLabel: "Call Emergency Contact",
      cancelLabel: "Cancel",
      action: () => startCall("emergency"),
    });
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
            </div>

            <div className="button-row" style={{ flexDirection: "column", alignItems: "stretch", marginTop: 8 }}>
              <input
                id="scan-photo-input"
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={handlePhotoCapture}
              />
              <button
                className="secondary-btn"
                type="button"
                onClick={() => document.getElementById("scan-photo-input")?.click()}
              >
                📸 {photoUploaded ? "Retake Vehicle Photo" : "Capture Vehicle Photo"}
              </button>
              {photoUploadStatus && (
                <p style={{ marginTop: 10, color: photoUploadStatus.includes("failed") ? '#f87171' : '#34d399' }}>
                  {photoUploadStatus}
                </p>
              )}
              {photoPreviewUrl && (
                <img
                  src={photoPreviewUrl}
                  alt="Scan preview"
                  style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, marginTop: 12 }}
                />
              )}
              <button
                className="primary-btn"
                onClick={handleOwnerCall}
                disabled={owner.doNotDisturb}
              >
                📞 Parking issues - Call Owner
              </button>
              <button
                className="secondary-btn"
                onClick={handleEmergencyCall}
                disabled={owner.doNotDisturb || !owner.emergencyContact}
              >
                🚑 Medical Emergency - Call Emergency Contact
              </button>
            </div>
          </div>
        ) : (
          !error && <p className="page-subtitle">Loading vehicle information...</p>
        )}
      </div>
      {modalOpen && (
        <div className="register-modal-overlay">
          <div className="register-modal-content">
            <div className="register-modal-icon" style={{ background: modalTitle === "Emergency Warning" ? 'linear-gradient(135deg, #ff8a9b, #ff6b7a)' : 'linear-gradient(135deg, #38e0b2, #5effd1)', color: modalTitle === "Emergency Warning" ? '#fff' : '#022016' }}>
              {modalTitle === "Emergency Warning" ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 20h20L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4.5V12L16.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.5 12C4.5 7.30558 7.30558 4.5 12 4.5C16.6944 4.5 19.5 7.30558 19.5 12C19.5 16.6944 16.6944 19.5 12 19.5C7.30558 19.5 4.5 16.6944 4.5 12Z" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              )}
            </div>
            <h3 className="register-modal-title">{modalTitle}</h3>
            <p className="register-modal-message">{modalMessage}</p>
            <div className="form-actions" style={{ gap: modalCancelLabel ? 12 : 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {modalCancelLabel && (
                <button type="button" className="secondary-btn" onClick={closeModal} style={{ minWidth: 120 }}>
                  {modalCancelLabel}
                </button>
              )}
              <button
                type="button"
                className="primary-btn"
                onClick={() => {
                  if (modalAction) modalAction();
                  closeModal();
                }}
                style={{ minWidth: 160 }}
              >
                {modalConfirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scan;
 
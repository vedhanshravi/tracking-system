import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchPendingVehicles();
  }, [navigate, token]);

  const fetchPendingVehicles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to load pending vehicles");
        return;
      }
      const data = await response.json();
      setPendingVehicles(data);
    } catch (err) {
      setError("Server error while loading pending vehicles");
    }
  };

  const handleVerify = async (vehicleId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/verify/${vehicleId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Verification failed");
        return;
      }
      alert("Vehicle verified successfully");
      fetchPendingVehicles();
    } catch (err) {
      console.error(err);
      alert("Server error during verification");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Admin Page</h2>
      <button onClick={handleLogout}>Logout</button>
      <hr />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {pendingVehicles.length === 0 ? (
        <p>No vehicles pending verification.</p>
      ) : (
        pendingVehicles.map((vehicle) => (
          <div key={vehicle.id} style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "16px" }}>
            <p><strong>Vehicle Number:</strong> {vehicle.vehicle_number}</p>
            <p><strong>Owner Name:</strong> {vehicle.owner_name}</p>
            <p><strong>Owner Phone:</strong> {vehicle.owner_phone}</p>
            <p><strong>Emergency Contact:</strong> {vehicle.emergency_contact || "N/A"}</p>
            <p><strong>Uploaded RC:</strong> {vehicle.rc_document_name || vehicle.rc_document}</p>
            <p><strong>Uploaded Aadhar:</strong> {vehicle.adhar_document_name || vehicle.adhar_document}</p>

            {vehicle.rc_url && (
              <p>
                RC: <a href={vehicle.rc_url} target="_blank" rel="noopener noreferrer">View</a>
              </p>
            )}
            {vehicle.adhar_url && (
              <p>
                Aadhar: <a href={vehicle.adhar_url} target="_blank" rel="noopener noreferrer">View</a>
              </p>
            )}

            <button onClick={() => handleVerify(vehicle.id)}>Mark as Verified</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;

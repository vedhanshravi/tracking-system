import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [pendingVehicles, setPendingVehicles] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vehicleNumberSearch, setVehicleNumberSearch] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchPendingVehicles = useCallback(async (pageNumber = 1, searchText = "") => {
    try {
      const query = searchText
        ? `vehicleNumber=${encodeURIComponent(searchText)}`
        : `page=${pageNumber}`;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/pending?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to load pending vehicles");
        setPendingVehicles([]);
        return;
      }
      const result = await response.json();
      setPendingVehicles(result.data || []);
      setPage(result.page || 1);
      setTotalPages(result.totalPages || 1);
      setError("");
    } catch (err) {
      setError("Server error while loading pending vehicles");
      setPendingVehicles([]);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/admin-login");
      return;
    }
    fetchPendingVehicles();
  }, [navigate, token, fetchPendingVehicles]);

  const handleSearch = async () => {
    if (!vehicleNumberSearch.trim()) {
      setIsSearchActive(false);
      fetchPendingVehicles(1, "");
      return;
    }
    setIsSearchActive(true);
    fetchPendingVehicles(1, vehicleNumberSearch.trim());
  };

  const clearSearch = () => {
    setVehicleNumberSearch("");
    setIsSearchActive(false);
    fetchPendingVehicles(1, "");
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
      fetchPendingVehicles(page);
    } catch (err) {
      console.error(err);
      alert("Server error during verification");
    }
  };

  const viewDocument = async (vehicleId, type) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/document/${vehicleId}/${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Unable to load document");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      alert("Unable to load document");
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

      <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by vehicle number"
          value={vehicleNumberSearch}
          onChange={(e) => setVehicleNumberSearch(e.target.value)}
          style={{ padding: "8px", minWidth: "240px" }}
        />
        <button type="button" onClick={handleSearch} style={{ padding: "8px 16px" }}>
          Search
        </button>
        <button type="button" onClick={clearSearch} style={{ padding: "8px 16px" }}>
          Clear
        </button>
      </div>

      {!isSearchActive && (
        <div style={{ marginBottom: "12px" }}>
          <button
            type="button"
            onClick={() => fetchPendingVehicles(Math.max(page - 1, 1), "")}
            disabled={page <= 1}
            style={{ marginRight: "8px" }}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => fetchPendingVehicles(Math.min(page + 1, totalPages), "")}
            disabled={page >= totalPages}
          >
            Next
          </button>
          <span style={{ marginLeft: "16px" }}>
            Page {page} of {totalPages}
          </span>
        </div>
      )}

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
            <p><strong>Verification Status:</strong> {vehicle.verification_status || (vehicle.is_verified ? "approved" : "pending")}</p>
            <p><strong>Verified By:</strong> {vehicle.verified_by || "N/A"}</p>
            <p><strong>Verified At:</strong> {vehicle.verified_at ? new Date(vehicle.verified_at).toLocaleString() : "N/A"}</p>

            <p>
              RC: <button type="button" onClick={() => viewDocument(vehicle.id, "rc")}>View</button>
            </p>
            <p>
              Aadhar: <button type="button" onClick={() => viewDocument(vehicle.id, "adhar")}>View</button>
            </p>

            {!vehicle.is_verified && (
              <button onClick={() => handleVerify(vehicle.id)}>Mark as Verified</button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;

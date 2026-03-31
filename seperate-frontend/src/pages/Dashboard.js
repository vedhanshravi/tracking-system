import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");

  const getUserFullName = user
    ? `${user.first_name || ""}${user.middle_name ? ` ${user.middle_name}` : ""}${user.last_name ? ` ${user.last_name}` : ""}`.trim()
    : "";
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState([]);
  const [rcFile, setRcFile] = useState(null);
  const [adharFile, setAdharFile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    // Fetch user info from backend
    fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          navigate("/");
        }
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error(err);
        navigate("/");
      });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchVehicles();
      fetchStats();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleScan = () => {
    navigate("/scanner");
  };

  const handleAddVehicle = async () => {
    const token = localStorage.getItem("token");
    if (!vehicleNumber || !ownerName || !ownerPhone || !emergencyContact || !rcFile || !adharFile) {
      alert("Please fill all fields, including emergency contact, and upload both RC and Aadhar documents.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if (rcFile.size > maxFileSize || adharFile.size > maxFileSize) {
      alert("RC and Aadhar documents must be 5MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("vehicleNumber", vehicleNumber);
    formData.append("ownerName", ownerName);
    formData.append("ownerPhone", ownerPhone);
    formData.append("emergencyContact", emergencyContact);
    formData.append("rc", rcFile);
    formData.append("adhar", adharFile);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) {
      setVehicleNumber("");
      setOwnerName("");
      setOwnerPhone("");
      setEmergencyContact("");
      setRcFile(null);
      setAdharFile(null);
      fetchVehicles();
      fetchStats();
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("Delete this vehicle? This will hide it from your dashboard.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/vehicles/delete/${vehicleId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      alert(data.message || "Vehicle deleted");
      if (response.ok) {
        fetchVehicles();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete vehicle. Try again.");
    }
  };

  if (!user) return <p>Loading...</p>;

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "scan", label: "Scan Vehicle" },
    { id: "add", label: "Add Vehicle" },
    { id: "myvehicles", label: "My Vehicles" },
    { id: "analytics", label: "Scan Analytics" },
  ];

  const tabButtonStyle = (tabId) => ({
    padding: "10px 16px",
    border: "1px solid #ccc",
    background: activeTab === tabId ? "#007bff" : "white",
    color: activeTab === tabId ? "white" : "black",
    cursor: "pointer",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 16,
  });

  return (
    <div style={{ padding: "50px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Welcome, {getUserFullName || "User"}!</h2>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            padding: "10px 16px",
            background: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
      <div style={{ margin: "20px 0" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={tabButtonStyle(tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "profile" && (
        <>
          <div style={{ marginBottom: 20 }}>
        <p><strong>First Name:</strong> {user.first_name || "-"}</p>
        <p><strong>Middle Name:</strong> {user.middle_name || "-"}</p>
        <p><strong>Last Name:</strong> {user.last_name || "-"}</p>
        <p><strong>Email:</strong> {user.email || "-"}</p>
        <p><strong>Subscription Type:</strong> {user.subscription_name || "-"}</p>
        <p><strong>Max Vehicles:</strong> {user.max_vehicles || "-"}</p>
        <p><strong>Phone:</strong> {user.phone || "-"}</p>
        <p><strong>Alternate Phone:</strong> {user.alternate_phone || "-"}</p>
        <p><strong>Address Line 1:</strong> {user.address_line1 || "-"}</p>
        <p><strong>Address Line 2:</strong> {user.address_line2 || "-"}</p>
        <p><strong>City:</strong> {user.city || "-"}</p>
        <p><strong>State:</strong> {user.state || "-"}</p>
        <p><strong>Country:</strong> {user.country || "-"}</p>
        <p><strong>Postal Code:</strong> {user.postal_code || "-"}</p>
        </div>
      </>
      )}

      {activeTab === "scan" && (
        <div>
          <h3>Scan Vehicle</h3>
      <button onClick={handleScan}>Open QR Scanner</button>
        </div>
      )}

      {activeTab === "add" && (
        <div>
          <h3>Add Vehicle</h3>
          <input
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
      <input
        placeholder="Owner Name"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
      />
      <input
        placeholder="Owner Phone"
        value={ownerPhone}
        onChange={(e) => setOwnerPhone(e.target.value)}
      />
      <input
        placeholder="Emergency Contact Number"
        value={emergencyContact}
        onChange={(e) => setEmergencyContact(e.target.value)}
      />
      <div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>
            RC Document:
            <span
              style={{ marginLeft: 8, cursor: "help", fontSize: "0.85rem", opacity: 0.7 }}
              title="Supported formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB."
            >
              ℹ️
            </span>
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setRcFile(e.target.files[0])}
          />
        </label>
      </div>
      <div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>
            Aadhar Document:
            <span
              style={{ marginLeft: 8, cursor: "help", fontSize: "0.85rem", opacity: 0.7 }}
              title="Supported formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB."
            >
              ℹ️
            </span>
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setAdharFile(e.target.files[0])}
          />
        </label>
      </div>
      <button onClick={handleAddVehicle}>Add Vehicle</button>
        </div>
      )}

      {activeTab === "myvehicles" && (
        <div>
          <h3>My Vehicles</h3>
      {vehicles.length === 0 && <p>No vehicles added yet.</p>}
      {vehicles.map((v) => (
        <div key={v.id} style={{ marginBottom: "20px" }}>
          <p>
            <strong>Number:</strong> {v.vehicle_number}
          </p>
          <p>
            <strong>Verified:</strong> {v.is_verified ? "Yes" : "No (pending admin approval)"}
          </p>
          {v.rc_url && (
            <p>
              RC: <a href={v.rc_url} target="_blank" rel="noopener noreferrer">View</a>
            </p>
          )}
          {v.adhar_url && (
            <p>
              Aadhar: <a href={v.adhar_url} target="_blank" rel="noopener noreferrer">View</a>
            </p>
          )}
          {v.qr && (
            <div>
              <img src={v.qr} alt="QR" width={200} />
              <div style={{ marginTop: 8 }}>
                <a href={v.qr} download={`QR-${v.vehicle_number}.png`}>
                  <button>Download QR</button>
                </a>
              </div>
            </div>
          )}
          <button
            style={{ marginTop: 12, background: "#d9534f", color: "white", border: "none", padding: "8px 12px", cursor: "pointer" }}
            onClick={() => handleDeleteVehicle(v.id)}
          >
            Delete Vehicle
          </button>
        </div>
      ))}
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          <h3>Scan Analytics</h3>
      {stats.length === 0 && <p>No scan data yet.</p>}
      {stats.map((item) => (
        <div key={item.id} style={{ marginBottom: "15px" }}>
          <p><strong>Vehicle:</strong> {item.vehicle_number}</p>
          <p>Total Scans: {item.total_scans}</p>
          <p>
            Last Scanned: {item.last_scanned ? new Date(item.last_scanned).toLocaleString() : "Never"}
          </p>
        </div>
      ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
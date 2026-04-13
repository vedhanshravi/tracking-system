import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");

  const getUserFullName = user
    ? `${user.first_name || ""}${user.middle_name ? ` ${user.middle_name}` : ""}${user.last_name ? ` ${user.last_name}` : ""}`.trim()
    : "";
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toISOString().split("T")[0];
  };
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpDetailDescription, setHelpDetailDescription] = useState("");
  const [helpRequests, setHelpRequests] = useState([]);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpTab, setHelpTab] = useState("All");

  const helpCounts = {
    All: helpRequests.length,
    Open: helpRequests.filter((issue) => issue.status === "Open").length,
    "In progress": helpRequests.filter((issue) => issue.status === "In progress").length,
    Resolved: helpRequests.filter((issue) => issue.status === "Resolved").length,
    Cancelled: helpRequests.filter((issue) => issue.status === "Cancelled").length,
  };

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

  const fetchHelpRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHelpLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/help/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHelpRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHelpLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVehicles();
      fetchStats();
      setContactEmail(user.email || "");
      setContactPhone(user.phone || "");
      fetchHelpRequests();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleScan = () => {
    navigate("/scanner");
  };

  const handleRaiseHelpIssue = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!helpDescription.trim() || (!contactEmail.trim() && !contactPhone.trim())) {
      alert("Please provide a description and at least an email or phone number.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/help/raise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contact_email: contactEmail.trim() || null,
          contact_phone: contactPhone.trim() || null,
          description: helpDescription.trim(),
          detail_description: helpDetailDescription.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to submit help request");
        return;
      }

      alert("Help request submitted successfully.");
      setHelpDescription("");
      setHelpDetailDescription("");
      fetchHelpRequests();
      setActiveTab("help");
    } catch (err) {
      console.error(err);
      alert("Failed to submit help request");
    }
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

  const isSubscriptionExpired = (user) => {
    if (!user) return false;
    if (user.subscription_active === false) return true;
    if (user.subscription_end) {
      const expiryDate = new Date(user.subscription_end);
      return !Number.isNaN(expiryDate.getTime()) && expiryDate < new Date();
    }
    return false;
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
    { id: "help", label: "Help" },
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
        <p><strong>Subscription Start:</strong> {user.subscription_start ? formatDate(user.subscription_start) : "Not set"}</p>
        <p><strong>Subscription End:</strong> {user.subscription_end ? formatDate(user.subscription_end) : "Not set"}</p>
        <p><strong>Subscription Status:</strong> {user.subscription_active === false ? "Expired" : user.subscription_active === true ? "Active" : "Unknown"}</p>
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

      {activeTab === "help" && (
        <div>
          <h3>Help & Support</h3>
          <div style={{ marginBottom: 16, maxWidth: 600 }}>
            <label>
              Email:
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
              />
            </label>
            <label>
              Mobile Number:
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
              />
            </label>
            <label>
              Short Description:
              <input
                type="text"
                value={helpDescription}
                onChange={(e) => setHelpDescription(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
              />
            </label>
            <label>
              Detail Description:
              <textarea
                value={helpDetailDescription}
                onChange={(e) => setHelpDetailDescription(e.target.value)}
                rows={6}
                style={{ width: "100%", padding: 8, marginTop: 4, marginBottom: 12 }}
              />
            </label>
            <button onClick={handleRaiseHelpIssue} style={{ padding: "10px 16px" }}>
              Submit Help Request
            </button>
          </div>

          <div style={{ maxWidth: 800 }}>
            <h4>Your Raised Issues</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {['All', 'Open', 'In progress', 'Resolved', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setHelpTab(status)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 4,
                    border: helpTab === status ? "1px solid #007bff" : "1px solid #ccc",
                    background: helpTab === status ? "#007bff" : "#f8f9fa",
                    color: helpTab === status ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  {status} ({helpCounts[status]})
                </button>
              ))}
            </div>
            {helpLoading ? (
              <p>Loading your help requests...</p>
            ) : helpRequests.length === 0 ? (
              <p>No help requests submitted yet.</p>
            ) : (
              helpRequests
                .filter((issue) => helpTab === 'All' || issue.status === helpTab)
                .map((issue) => {
                  const badgeColor = issue.status === "Open"
                    ? "#ffeb3b"
                    : issue.status === "In progress"
                    ? "#90caf9"
                    : issue.status === "Resolved"
                    ? "#a5d6a7"
                    : issue.status === "Cancelled"
                    ? "#ef9a9a"
                    : "#e0e0e0";

                  return (
                    <div key={issue.id} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 12, borderRadius: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <p><strong>Issue #{issue.id}</strong></p>
                        <span
                          style={{
                            background: badgeColor,
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontWeight: 600,
                          }}
                        >
                          {issue.status}
                        </span>
                      </div>
                      <p><strong>Description:</strong> {issue.description}</p>
                      <p><strong>Details:</strong> {issue.detail_description || "-"}</p>
                      <p><strong>Contact Email:</strong> {issue.contact_email || "-"}</p>
                      <p><strong>Contact Phone:</strong> {issue.contact_phone || "-"}</p>
                      <p><strong>Submitted At:</strong> {issue.created_at ? new Date(issue.created_at).toLocaleString() : "-"}</p>
                      <p><strong>Last Updated:</strong> {issue.updated_at ? new Date(issue.updated_at).toLocaleString() : "-"}</p>
                    </div>
                  );
                })
            )}
          </div>
        </div>
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

      {isSubscriptionExpired(user) && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#ffdddd",
            color: "#b71c1c",
            padding: "12px 20px",
            textAlign: "center",
            borderTop: "1px solid #f44336",
            zIndex: 1000,
          }}
        >
          Your subscription has expired. You can still login and view your details, but owner/emergency contact features are disabled until renewal.
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
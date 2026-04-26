import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleDisplayName, setVehicleDisplayName] = useState("");
  const [showProfile, setShowProfile] = useState(false);

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
  const [activeTab, setActiveTab] = useState("myvehicles");
  const [editingVehicle, setEditingVehicle] = useState(null);
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

  const handleEditVehicle = (v) => {
    setEditingVehicle(v);
    setVehicleNumber(v.vehicle_number || "");
    setVehicleDisplayName(v.vehicle_display_name || "");
    setOwnerName(v.owner_name || "");
    setOwnerPhone(v.owner_phone || "");
    setEmergencyContact(v.emergency_contact || "");
    setRcFile(null);
    setAdharFile(null);
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
    setVehicleNumber("");
    setVehicleDisplayName("");
    setOwnerName("");
    setOwnerPhone("");
    setEmergencyContact("");
    setRcFile(null);
    setAdharFile(null);
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

  const handleUpdateVehicle = async () => {
    const token = localStorage.getItem("token");
    if (!ownerName || !ownerPhone || !emergencyContact) {
      alert("Please fill required fields: owner name, phone, and emergency contact.");
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if ((rcFile && rcFile.size > maxFileSize) || (adharFile && adharFile.size > maxFileSize)) {
      alert("RC and Aadhar documents must be 5MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("vehicleNumber", vehicleNumber);
    formData.append("vehicleDisplayName", vehicleDisplayName);
    formData.append("ownerName", ownerName);
    formData.append("ownerPhone", ownerPhone);
    formData.append("emergencyContact", emergencyContact);
    if (rcFile) formData.append("rc", rcFile);
    if (adharFile) formData.append("adhar", adharFile);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/update/${editingVehicle.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) {
      handleCancelEdit();
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
    { id: "myvehicles", label: "My Vehicles" },
    { id: "add", label: "Add Vehicle" },
    { id: "analytics", label: "Scan Analytics" },
    { id: "scan", label: "Scan Vehicle" },
    { id: "help", label: "Help" },
  ];

  const pageTitle = activeTab === "profile" ? "Profile" : tabs.find((tab) => tab.id === activeTab)?.label;
  const nameParts = [user?.first_name, user?.middle_name, user?.last_name].map((value) => value?.trim()).filter(Boolean);
  const profileFullName = nameParts.length === 0 ? "User" : nameParts.join(" ");
  const totalScans = stats.reduce((sum, item) => sum + (Number(item.total_scans) || 0), 0);
  const totalVehicles = vehicles.length;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">TP</div>
          <div>
            <div className="dashboard-brand-title">TrackPro</div>
            <div className="dashboard-brand-subtitle">Vehicle tracking</div>
          </div>
        </div>

        <nav className="dashboard-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`dashboard-nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="dashboard-search">
            <span className="dashboard-search-icon">🔍</span>
            <input className="input-field" placeholder="Search dashboard..." />
          </div>

          <div className="dashboard-actions">
            <button className="outline-btn" type="button">Notifications</button>
            <button
              type="button"
              className="dashboard-avatar-button"
              onClick={() => {
                setShowProfile((open) => !open);
              }}
            >
              <div className="dashboard-avatar">{getUserFullName ? getUserFullName.split(" ").map((n) => n[0]).slice(0,2).join("") : "JD"}</div>
            </button>
            <div className={`dashboard-profile-dropdown ${showProfile ? "open" : ""}`}>
              <p className="badge">Account</p>
              <p style={{ margin: "14px 0 4px", fontWeight: 700 }}>{getUserFullName || "User"}</p>
              <p style={{ margin: "0 0 12px", color: "#94a3b8" }}>{user.email || "No email"}</p>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                  setShowProfile(false);
                }}
              >
                Profile
              </button>
              <button className="danger-btn" type="button" onClick={handleLogout}>Sign out</button>
            </div>
          </div>
        </div>

        <section className="dashboard-welcome-card">
          <div>
            <p className="badge">Welcome back</p>
            <h1 className="page-title">Hello {profileFullName}</h1>
            <p className="page-subtitle">Manage your vehicle scans, support requests, and profile details from one central dashboard.</p>
          </div>
        </section>

        <section className="dashboard-overview-grid">
          <div className="dashboard-overview-card">
            <p>Vehicles tracked</p>
            <div className="stat-value">{totalVehicles}</div>
            <p className="stat-label">Active vehicles registered</p>
          </div>
          <div className="dashboard-overview-card">
            <p>Total scans</p>
            <div className="stat-value">{totalScans}</div>
            <p className="stat-label">Scans performed this month</p>
          </div>
          <div className="dashboard-overview-card">
            <p>Open requests</p>
            <div className="stat-value">{helpCounts.Open}</div>
            <p className="stat-label">Pending support issues</p>
          </div>
        </section>

        <div className="page-card">
          <div className="page-hero" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 className="page-title">{pageTitle}</h2>
              <p className="page-subtitle">Quick actions and details for the selected dashboard section.</p>
            </div>
          </div>

          {activeTab === "profile" && (
            <section className="profile-section">
              <div className="profile-summary-card">
                <p className="badge">Profile overview</p>
                <h3 className="profile-name">{getUserFullName || "Anonymous User"}</h3>
                <p className="profile-email">{user.email || "No email available"}</p>
                <div className="profile-meta">
                  <span className={`pill ${user.subscription_active === false ? "pill-danger" : "pill-success"}`}>
                    {user.subscription_active === false ? "Expired" : "Active"}
                  </span>
                  <span className="pill">{user.subscription_name || "Standard"}</span>
                </div>
              </div>

              <div className="profile-grid">
                <div className="profile-item">
                  <span className="profile-key">First Name</span>
                  <span className="profile-value">{user.first_name || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Middle Name</span>
                  <span className="profile-value">{user.middle_name || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Last Name</span>
                  <span className="profile-value">{user.last_name || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Subscription Start</span>
                  <span className="profile-value">{user.subscription_start ? formatDate(user.subscription_start) : "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Subscription End</span>
                  <span className="profile-value">{user.subscription_end ? formatDate(user.subscription_end) : "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Max Vehicles</span>
                  <span className="profile-value">{user.max_vehicles || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Phone</span>
                  <span className="profile-value">{user.phone || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Alternate Phone</span>
                  <span className="profile-value">{user.alternate_phone || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Address Line 1</span>
                  <span className="profile-value">{user.address_line1 || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Address Line 2</span>
                  <span className="profile-value">{user.address_line2 || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">City</span>
                  <span className="profile-value">{user.city || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">State</span>
                  <span className="profile-value">{user.state || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Country</span>
                  <span className="profile-value">{user.country || "-"}</span>
                </div>
                <div className="profile-item">
                  <span className="profile-key">Postal Code</span>
                  <span className="profile-value">{user.postal_code || "-"}</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === "help" && (
            <div style={{ display: "grid", gap: 24 }}>
              <div style={{ display: "grid", gap: 14, maxWidth: 760 }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="input-field" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input className="input-field" type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input className="input-field" type="text" value={helpDescription} onChange={(e) => setHelpDescription(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Detail Description</label>
                  <textarea className="textarea-field" value={helpDetailDescription} onChange={(e) => setHelpDetailDescription(e.target.value)} rows={6} />
                </div>
                <button className="primary-btn" onClick={handleRaiseHelpIssue}>Submit Help Request</button>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {['All', 'Open', 'In progress', 'Resolved', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`tab-btn ${helpTab === status ? 'active' : ''}`}
                      onClick={() => setHelpTab(status)}
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
                      const badgeColor = issue.status === 'Open'
                        ? '#ffeb3b'
                        : issue.status === 'In progress'
                          ? '#90caf9'
                          : issue.status === 'Resolved'
                            ? '#a5d6a7'
                            : issue.status === 'Cancelled'
                              ? '#ef9a9a'
                              : '#e0e0e0';

                      return (
                        <div key={issue.id} style={{ border: '1px solid rgba(148, 163, 184, 0.16)', padding: 16, borderRadius: 16, background: '#0f172a' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <p><strong>Issue #{issue.id}</strong></p>
                            <span style={{ background: badgeColor, padding: '6px 12px', borderRadius: 999, fontWeight: 600 }}>{issue.status}</span>
                          </div>
                          <p><strong>Description:</strong> {issue.description}</p>
                          <p><strong>Details:</strong> {issue.detail_description || '-'}</p>
                          <p><strong>Contact Email:</strong> {issue.contact_email || '-'}</p>
                          <p><strong>Contact Phone:</strong> {issue.contact_phone || '-'}</p>
                          <p><strong>Submitted At:</strong> {issue.created_at ? new Date(issue.created_at).toLocaleString() : '-'}</p>
                          <p><strong>Last Updated:</strong> {issue.updated_at ? new Date(issue.updated_at).toLocaleString() : '-'}</p>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {activeTab === "scan" && (
            <div style={{ display: 'grid', gap: 16 }}>
              <h3>Scan Vehicle</h3>
              <button className="primary-btn" onClick={handleScan}>Open QR Scanner</button>
            </div>
          )}

          {activeTab === "add" && (
            <div style={{ display: 'grid', gap: 16 }}>
              <h3>Add Vehicle</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input className="input-field" placeholder="Vehicle Number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Name</label>
                  <input className="input-field" placeholder="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Phone</label>
                  <input className="input-field" placeholder="Owner Phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Number</label>
                  <input className="input-field" placeholder="Emergency Contact Number" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">RC Document</label>
                  <input className="input-field" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setRcFile(e.target.files[0])} />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhar Document</label>
                  <input className="input-field" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAdharFile(e.target.files[0])} />
                </div>
              </div>
              <button className="primary-btn" onClick={handleAddVehicle}>Add Vehicle</button>
            </div>
          )}

          {activeTab === "myvehicles" && (
            <div style={{ display: 'grid', gap: 18 }}>
              <h3>My Vehicles</h3>
              {editingVehicle ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  <h4>Edit Vehicle</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Vehicle Display Name *</label>
                      <input className="input-field" placeholder="Car Name and Car Number" value={vehicleDisplayName} onChange={(e) => setVehicleDisplayName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Vehicle Number</label>
                      <input className="input-field" placeholder="Enter vehicle number" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Owner Phone *</label>
                        <input className="input-field" placeholder="Owner phone" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Emergency Contact *</label>
                        <input className="input-field" placeholder="Emergency contact" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">RC Document</label>
                      <input className="input-field" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setRcFile(e.target.files[0])} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Aadhar Document</label>
                      <input className="input-field" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAdharFile(e.target.files[0])} />
                    </div>
                    <p className="help-text">Supported formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB. Leave blank to keep existing documents.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="primary-btn" onClick={handleUpdateVehicle}>Update Vehicle</button>
                    <button className="secondary-btn" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : vehicles.length === 0 ? (
                <p>No vehicles added yet.</p>
              ) : (
                vehicles.map((v) => (
                  <div key={v.id} className="vehicle-card">
                    <div className="vehicle-card-header">
                      <div>
                        <p className="vehicle-card-title">{v.vehicle_display_name || v.vehicle_number || 'Untitled Vehicle'}</p>
                        <p className="vehicle-card-subtitle">Vehicle information and documents</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span className={`pill ${v.is_verified ? 'pill-success' : 'pill-warning'}`}>
                          {v.is_verified ? 'Verified' : 'Pending approval'}
                        </span>
                        <button className="secondary-btn" onClick={() => handleEditVehicle(v)}>Edit</button>
                      </div>
                    </div>

                    <div className="vehicle-card-grid">
                      <div className="vehicle-card-row">
                        <span className="vehicle-card-key">Number</span>
                        <span className="vehicle-card-value">{v.vehicle_number || '-'}</span>
                      </div>
                      <div className="vehicle-card-row">
                        <span className="vehicle-card-key">Verified</span>
                        <span className="vehicle-card-value">{v.is_verified ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="vehicle-card-row">
                        <span className="vehicle-card-key">RC</span>
                        <span className="vehicle-card-value">
                          {v.rc_url ? (
                            <a className="link-btn" href={v.rc_url} target="_blank" rel="noopener noreferrer">View</a>
                          ) : (
                            'Not uploaded'
                          )}
                        </span>
                      </div>
                      <div className="vehicle-card-row">
                        <span className="vehicle-card-key">Aadhar</span>
                        <span className="vehicle-card-value">
                          {v.adhar_url ? (
                            <a className="link-btn" href={v.adhar_url} target="_blank" rel="noopener noreferrer">View</a>
                          ) : (
                            'Not uploaded'
                          )}
                        </span>
                      </div>
                    </div>

                    {v.qr && (
                      <div className="vehicle-card-qr">
                        <img src={v.qr} alt="QR" width={180} />
                        <a href={v.qr} download={`QR-${v.vehicle_display_name || v.vehicle_number}.png`}>
                          <button className="secondary-btn" type="button">Download QR</button>
                        </a>
                      </div>
                    )}

                    <button className="danger-btn vehicle-card-delete" type="button" onClick={() => handleDeleteVehicle(v.id)}>
                      Delete Vehicle
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {isSubscriptionExpired(user) && (
            <div className="alert-banner">
              Your subscription has expired. You can still login and view your details, but owner/emergency contact features are disabled until renewal.
            </div>
          )}

          {activeTab === "analytics" && (
            <div style={{ display: 'grid', gap: 16 }}>
              <h3>Scan Analytics</h3>
              {stats.length === 0 ? <p>No scan data yet.</p> : stats.map((item) => (
                <div key={item.id} style={{ border: '1px solid rgba(148, 163, 184, 0.16)', padding: 18, borderRadius: 16, background: '#0f172a' }}>
                  <p><strong>Vehicle:</strong> {item.vehicle_number}</p>
                  <p>Total Scans: {item.total_scans}</p>
                  <p>Last Scanned: {item.last_scanned ? new Date(item.last_scanned).toLocaleString() : 'Never'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;



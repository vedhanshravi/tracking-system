import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import carLogo from "../trackpro-car.svg";
import "./Register.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleDisplayName, setVehicleDisplayName] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    ownerPhoneError: "",
    emergencyContactError: "",
    vehicleNumberError: "",
  });
  const [showProfile, setShowProfile] = useState(false);
  const [showVehicleUpdateSuccessModal, setShowVehicleUpdateSuccessModal] = useState(false);
  const [vehicleUpdateSuccessMessage, setVehicleUpdateSuccessMessage] = useState("");
  const [showAddVehicleSuccessModal, setShowAddVehicleSuccessModal] = useState(false);
  const [showAddVehicleErrorModal, setShowAddVehicleErrorModal] = useState(false);
  const [addVehicleErrorMessage, setAddVehicleErrorMessage] = useState("");

  const [actionModal, setActionModal] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "OK",
    cancelText: "",
    isError: false,
    onConfirm: null,
    onCancel: null,
  });

  const getUserFullName = user
    ? `${user.first_name || ""}${user.middle_name ? ` ${user.middle_name}` : ""}${user.last_name ? ` ${user.last_name}` : ""}`.trim()
    : "";
  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toISOString().split("T")[0];
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return "Required";
    if (phone.length !== 10) return "Must be 10 digits";
    if (!/^\d{10}$/.test(phone)) return "Invalid phone number";
    return "";
  };

  const normalizeVehicleNumber = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const validateVehicleNumber = (value) => {
    const normalized = normalizeVehicleNumber(value);
    if (!normalized) return false;

    const civilianPattern = /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/;
    const militaryPattern = /^[A-Z]{2}\d{2}[A-Z]\d{1,4}$/;

    return civilianPattern.test(normalized) || militaryPattern.test(normalized);
  };

  const handleOwnerPhoneChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    setOwnerPhone(cleaned);
    setValidationErrors(prev => ({
      ...prev,
      ownerPhoneError: validatePhoneNumber(cleaned)
    }));
  };

  const handleEmergencyContactChange = (value) => {
    const cleaned = value.replace(/\D/g, '');
    setEmergencyContact(cleaned);
    setValidationErrors(prev => ({
      ...prev,
      emergencyContactError: validatePhoneNumber(cleaned)
    }));
  };

  const handleAddVehicleSuccessOk = () => {
    setShowAddVehicleSuccessModal(false);
    setActiveTab("myvehicles");
  };

  const handleAddVehicleErrorOk = () => {
    setShowAddVehicleErrorModal(false);
  };

  const openActionModal = ({ title, message, confirmText = "OK", cancelText = "", isError = false, onConfirm = null, onCancel = null }) => {
    setActionModal({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      isError,
      onConfirm,
      onCancel,
    });
  };

  const closeActionModal = () => {
    setActionModal((prev) => ({
      ...prev,
      visible: false,
      onConfirm: null,
      onCancel: null,
    }));
  };

  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [helpDescription, setHelpDescription] = useState("");
  const [helpDetailDescription, setHelpDetailDescription] = useState("");
  const [helpRequests, setHelpRequests] = useState([]);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpTab, setHelpTab] = useState("All");
  
  // Validation error states
  const [validationErrors, setValidationErrors] = useState({
    ownerPhoneError: "",
    emergencyContactError: "",
    vehicleNumberError: "",
  });

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
    const normalizedDnd = v.do_not_disturb === undefined || v.do_not_disturb === null
      ? false
      : (typeof v.do_not_disturb === "string"
          ? v.do_not_disturb.toLowerCase() === "true"
          : Boolean(v.do_not_disturb));
    setDoNotDisturb(normalizedDnd);
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
    setDoNotDisturb(false);
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
    // Mobile → open native camera directly via hidden file-input with capture=environment.
    // Desktop → keep existing behaviour (navigate to the scanner landing page).
    const isMobile =
      typeof navigator !== "undefined" &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia && window.matchMedia("(pointer: coarse)").matches && window.innerWidth <= 900));

    if (isMobile) {
      const input = document.getElementById("scan-camera-input");
      if (input) input.click();
      return;
    }
    navigate("/scanner");
  };

  const handleCameraCapture = (e) => {
    // On mobile after the user captures an image via the camera, fall back to the
    // scanner page so they can use Google Lens / QR lookup to parse the image.
    // This preserves the existing functionality path without adding a decoder.
    if (e.target.files && e.target.files[0]) {
      navigate("/scanner");
    }
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
    
    // Validate all fields
    const ownerPhoneErr = validatePhoneNumber(ownerPhone);
    const emergencyContactErr = validatePhoneNumber(emergencyContact);
    const vehicleNumberErr = vehicleNumber && !validateVehicleNumber(vehicleNumber)
      ? "Invalid vehicle number"
      : "";
    
    setValidationErrors({
      ownerPhoneError: ownerPhoneErr,
      emergencyContactError: emergencyContactErr,
      vehicleNumberError: vehicleNumberErr,
    });

    if (!vehicleDisplayName || ownerPhoneErr || emergencyContactErr || vehicleNumberErr) {
      openActionModal({
        title: "Incomplete vehicle details",
        message: "Please fill all required fields with valid values.",
        confirmText: "OK",
        isError: true,
        onConfirm: closeActionModal,
      });
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if ((rcFile && rcFile.size > maxFileSize) || (adharFile && adharFile.size > maxFileSize)) {
      setAddVehicleErrorMessage("RC and Aadhar documents must be 5MB or smaller.");
      setShowAddVehicleErrorModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("vehicleNumber", vehicleNumber);
    formData.append("vehicleDisplayName", vehicleDisplayName);
    formData.append("ownerName", getUserFullName);
    formData.append("ownerPhone", ownerPhone);
    formData.append("emergencyContact", emergencyContact);
    if (rcFile) formData.append("rc", rcFile);
    if (adharFile) formData.append("adhar", adharFile);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/add`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      setVehicleDisplayName("");
      setVehicleNumber("");
      setOwnerPhone("");
      setEmergencyContact("");
      setRcFile(null);
      setAdharFile(null);
      setValidationErrors({ ownerPhoneError: "", emergencyContactError: "", vehicleNumberError: "" });
      setShowAddVehicleSuccessModal(true);
      fetchVehicles();
      fetchStats();
    } else {
      setAddVehicleErrorMessage(data.message || "Failed to add vehicle. Please try again.");
      setShowAddVehicleErrorModal(true);
    }
  };

  const handleUpdateVehicle = async () => {
    const token = localStorage.getItem("token");
    
    // Validate all fields
    const ownerPhoneErr = validatePhoneNumber(ownerPhone);
    const emergencyContactErr = validatePhoneNumber(emergencyContact);
    const vehicleNumberErr = vehicleNumber && !validateVehicleNumber(vehicleNumber)
      ? "Invalid vehicle number"
      : "";
    
    setValidationErrors({
      ownerPhoneError: ownerPhoneErr,
      emergencyContactError: emergencyContactErr,
      vehicleNumberError: vehicleNumberErr,
    });

    if (!ownerName || ownerPhoneErr || emergencyContactErr || vehicleNumberErr) {
      openActionModal({
        title: "Incomplete vehicle details",
        message: "Please fill all required fields with valid values.",
        confirmText: "OK",
        isError: true,
        onConfirm: closeActionModal,
      });
      return;
    }

    const maxFileSize = 5 * 1024 * 1024; // 5MB
    if ((rcFile && rcFile.size > maxFileSize) || (adharFile && adharFile.size > maxFileSize)) {
      openActionModal({
        title: "Upload limit exceeded",
        message: "RC and Aadhar documents must be 5MB or smaller.",
        confirmText: "OK",
        isError: true,
        onConfirm: closeActionModal,
      });
      return;
    }

    const formData = new FormData();
    formData.append("vehicleNumber", vehicleNumber);
    formData.append("vehicleDisplayName", vehicleDisplayName);
    formData.append("ownerName", ownerName);
    formData.append("ownerPhone", ownerPhone);
    formData.append("emergencyContact", emergencyContact);
    formData.append("doNotDisturb", String(doNotDisturb));
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
    if (response.ok) {
      setVehicleUpdateSuccessMessage(data.message || "Vehicle updated successfully.");
      setShowVehicleUpdateSuccessModal(true);
      handleCancelEdit();
      setValidationErrors({ ownerPhoneError: "", emergencyContactError: "", vehicleNumberError: "" });
      fetchVehicles();
      fetchStats();
    } else {
      openActionModal({
        title: "Update failed",
        message: data.message || "Failed to update vehicle.",
        confirmText: "OK",
        isError: true,
        onConfirm: closeActionModal,
      });
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

  const performDeleteVehicle = async (vehicleId) => {
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
      if (response.ok) {
        openActionModal({
          title: "Vehicle deleted successfully",
          message: data.message || "The vehicle has been removed from your dashboard.",
          confirmText: "OK",
          onConfirm: () => {
            closeActionModal();
            fetchVehicles();
            fetchStats();
          },
        });
      } else {
        openActionModal({
          title: "Delete failed",
          message: data.message || "Failed to delete vehicle. Try again.",
          confirmText: "OK",
          isError: true,
          onConfirm: closeActionModal,
        });
      }
    } catch (err) {
      console.error(err);
      openActionModal({
        title: "Delete failed",
        message: "Failed to delete vehicle. Try again.",
        confirmText: "OK",
        isError: true,
        onConfirm: closeActionModal,
      });
    }
  };

  const confirmDeleteVehicle = (vehicleId) => {
    openActionModal({
      title: "Delete this vehicle?",
      message: "Delete this vehicle? This will hide it from your dashboard.",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => {
        closeActionModal();
        performDeleteVehicle(vehicleId);
      },
      onCancel: closeActionModal,
    });
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
          <div className="dashboard-brand-icon">
            <img src={carLogo} alt="TrackPro" />
          </div>
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
              <div className="dashboard-avatar">{getUserFullName ? getUserFullName.split(" ").map((n) => n[0].toUpperCase()).slice(0,2).join("") : "JD"}</div>
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
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      className="input-field"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
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
              <p className="page-subtitle" style={{ margin: 0 }}>
                On mobile, tap below to open your camera directly. On desktop, you'll be taken to the scanner tools.
              </p>
              <input
                id="scan-camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleCameraCapture}
                data-testid="scan-camera-input"
              />
              <button className="primary-btn" onClick={handleScan} data-testid="open-qr-scanner-btn">
                Open QR Scanner
              </button>
            </div>
          )}

          {activeTab === "add" && (
            <div style={{ display: 'grid', gap: 16 }}>
              <h3>Add Vehicle</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Display Name *</label>
                  <input className="input-field" placeholder="Car Name and Car Number" value={vehicleDisplayName} onChange={(e) => setVehicleDisplayName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Number</label>
                  <input
                    className={`input-field ${validationErrors.vehicleNumberError ? 'invalid-field' : ''}`}
                    placeholder="Enter vehicle number"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  />
                  {validationErrors.vehicleNumberError && <span style={{ color: '#ffbfc6', fontSize: '0.82rem', marginTop: '4px' }}>{validationErrors.vehicleNumberError}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Phone *</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input 
                      className={`input-field ${validationErrors.ownerPhoneError ? 'invalid-field' : ''}`} 
                      type="tel" 
                      inputMode="numeric" 
                      maxLength={10} 
                      placeholder="10-digit number" 
                      value={ownerPhone} 
                      onChange={(e) => handleOwnerPhoneChange(e.target.value)} 
                    />
                  </div>
                  {validationErrors.ownerPhoneError && <span style={{ color: '#ffbfc6', fontSize: '0.82rem', marginTop: '4px' }}>{validationErrors.ownerPhoneError}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Number *</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input 
                      className={`input-field ${validationErrors.emergencyContactError ? 'invalid-field' : ''}`} 
                      type="tel" 
                      inputMode="numeric" 
                      maxLength={10} 
                      placeholder="10-digit number" 
                      value={emergencyContact} 
                      onChange={(e) => handleEmergencyContactChange(e.target.value)} 
                    />
                  </div>
                  {validationErrors.emergencyContactError && <span style={{ color: '#ffbfc6', fontSize: '0.82rem', marginTop: '4px' }}>{validationErrors.emergencyContactError}</span>}
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
                      <input
                        className={`input-field ${validationErrors.vehicleNumberError ? 'invalid-field' : ''}`}
                        placeholder="Enter vehicle number"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      />
                      {validationErrors.vehicleNumberError && (
                        <span style={{ color: '#ffbfc6', fontSize: '0.82rem', marginTop: '4px' }}>
                          {validationErrors.vehicleNumberError}
                        </span>
                      )}
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Owner Phone *</label>
                        <div className="phone-input-wrapper">
                          <span className="phone-prefix">+91</span>
                          <input 
                            className={`input-field ${validationErrors.ownerPhoneError ? 'invalid-field' : ''}`} 
                            type="tel" 
                            inputMode="numeric" 
                            maxLength={10} 
                            placeholder="10-digit number" 
                            value={ownerPhone} 
                            onChange={(e) => handleOwnerPhoneChange(e.target.value)} 
                          />
                        </div>
                        {validationErrors.ownerPhoneError && <span style={{ color: '#ffbfc6', fontSize: '0.82rem', marginTop: '4px' }}>{validationErrors.ownerPhoneError}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Emergency Contact *</label>
                        <div className="phone-input-wrapper">
                          <span className="phone-prefix">+91</span>
                          <input 
                            className={`input-field ${validationErrors.emergencyContactError ? 'invalid-field' : ''}`} 
                            type="tel" 
                            inputMode="numeric" 
                            maxLength={10} 
                            placeholder="10-digit number" 
                            value={emergencyContact} 
                            onChange={(e) => handleEmergencyContactChange(e.target.value)} 
                          />
                        </div>
                        {validationErrors.emergencyContactError && <span style={{ color: '#ffbfc6', fontSize: '0.82rem', marginTop: '4px' }}>{validationErrors.emergencyContactError}</span>}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Do Not Disturb</label>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="radio"
                            name="doNotDisturb"
                            value="true"
                            checked={doNotDisturb === true}
                            onChange={() => setDoNotDisturb(true)}
                          />
                          On
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="radio"
                            name="doNotDisturb"
                            value="false"
                            checked={doNotDisturb === false}
                            onChange={() => setDoNotDisturb(false)}
                          />
                          Off
                        </label>
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
                        {(() => {
                          const dndValue = v.do_not_disturb === undefined || v.do_not_disturb === null
                            ? false
                            : (typeof v.do_not_disturb === "string"
                                ? v.do_not_disturb.toLowerCase() === "true"
                                : Boolean(v.do_not_disturb));
                          return dndValue ? (
                            <span className="pill pill-danger" style={{ marginTop: 8, display: 'inline-flex' }}>
                              DND ON
                            </span>
                          ) : null;
                        })()}
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
                      <div className="vehicle-card-row">
                        <span className="vehicle-card-key">Do Not Disturb</span>
                        <span className="vehicle-card-value">
                          {(() => {
                            const value = v.do_not_disturb === undefined || v.do_not_disturb === null
                              ? null
                              : (typeof v.do_not_disturb === "string"
                                  ? v.do_not_disturb.toLowerCase() === "true"
                                  : Boolean(v.do_not_disturb));

                            if (value === null) return 'Not Set';
                            return value ? 'Enabled' : 'Disabled';
                          })()}
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

                    <button className="danger-btn vehicle-card-delete" type="button" onClick={() => confirmDeleteVehicle(v.id)}>
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

          {showVehicleUpdateSuccessModal && (
            <div className="register-modal-overlay">
              <div className="register-modal-content">
                <div className="register-modal-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="register-modal-title">Vehicle updated successfully</h3>
                <p className="register-modal-message">{vehicleUpdateSuccessMessage}</p>
                <button
                  className="register-primary-btn"
                  onClick={() => setShowVehicleUpdateSuccessModal(false)}
                  style={{ minWidth: 160, justifyContent: 'center' }}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {showAddVehicleSuccessModal && (
            <div className="register-modal-overlay">
              <div className="register-modal-content">
                <div className="register-modal-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="register-modal-title">Vehicle added successfully</h3>
                <p className="register-modal-message">Your vehicle has been added. Waiting for admin verification — you can view it in your vehicles list.</p>
                <button
                  className="register-primary-btn"
                  onClick={handleAddVehicleSuccessOk}
                  style={{ minWidth: 160, justifyContent: 'center' }}
                >
                  View Vehicles
                </button>
              </div>
            </div>
          )}

          {showAddVehicleErrorModal && (
            <div className="register-modal-overlay">
              <div className="register-modal-content">
                <div className="register-modal-icon" style={{ background: 'linear-gradient(135deg, #ff8a9b, #ff6b7a)', color: '#fff' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="register-modal-title">Error adding vehicle</h3>
                <p className="register-modal-message">{addVehicleErrorMessage}</p>
                <button
                  className="register-primary-btn"
                  onClick={handleAddVehicleErrorOk}
                  style={{ minWidth: 160, justifyContent: 'center' }}
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {actionModal.visible && (
            <div className="register-modal-overlay">
              <div className="register-modal-content">
                <div className="register-modal-icon" style={{ background: actionModal.isError ? 'linear-gradient(135deg, #ff8a9b, #ff6b7a)' : 'linear-gradient(135deg, var(--accent), var(--primary))', color: actionModal.isError ? '#fff' : '#022016' }}>
                  {actionModal.isError ? (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  ) : (
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <h3 className="register-modal-title">{actionModal.title}</h3>
                <p className="register-modal-message">{actionModal.message}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {actionModal.cancelText ? (
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        if (actionModal.onCancel) actionModal.onCancel();
                        closeActionModal();
                      }}
                      style={{ minWidth: 120, justifyContent: 'center' }}
                    >
                      {actionModal.cancelText}
                    </button>
                  ) : null}
                  <button
                    className="register-primary-btn"
                    onClick={() => {
                      if (actionModal.onConfirm) actionModal.onConfirm();
                      else closeActionModal();
                    }}
                    style={{ minWidth: 160, justifyContent: 'center' }}
                  >
                    {actionModal.confirmText}
                  </button>
                </div>
              </div>
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



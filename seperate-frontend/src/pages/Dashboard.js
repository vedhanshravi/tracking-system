import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [stats, setStats] = useState([]);
  const [rcFile, setRcFile] = useState(null);
  const [adharFile, setAdharFile] = useState(null);
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

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "50px" }}>
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>

      <button onClick={handleLogout}>Logout</button>
      <hr />

      <h3>Scan Vehicle</h3>

      <button onClick={handleScan}>Scan</button>

      <hr />

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
              style={{ marginLeft: 8, cursor: "help", fontSize: "1rem" }}
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
        <p style={{ fontSize: "0.9rem", color: "#555", marginTop: 4 }}>
          Supported: PDF, JPG, JPEG, PNG. Max file size: 5MB.
        </p>
      </div>
      <div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span>
            Aadhar Document:
            <span
              style={{ marginLeft: 8, cursor: "help", fontSize: "1rem" }}
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
        <p style={{ fontSize: "0.9rem", color: "#555", marginTop: 4 }}>
          Supported: PDF, JPG, JPEG, PNG. Max file size: 5MB.
        </p>
      </div>
      <button onClick={handleAddVehicle}>Add Vehicle</button>

      <hr />

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
        </div>
      ))}

      <hr />

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
  );
}

export default Dashboard;
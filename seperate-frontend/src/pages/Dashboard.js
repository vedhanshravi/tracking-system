import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
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

  const handleScan = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vehicleNumber }),
    });

    const data = await response.json();

    if (response.ok) {
      setVehicleData(data);
    } else {
      alert(data.message);
    }
  };

  const handleAddVehicle = async () => {
    const token = localStorage.getItem("token");
    if (!vehicleNumber || !ownerName || !ownerPhone || !emergencyContact || !rcFile || !adharFile) {
      alert("Please fill all fields, including emergency contact, and upload both RC and Aadhar documents.");
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

      <input
        placeholder="Enter Vehicle Number"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />

      <button onClick={handleScan}>Scan</button>

      {vehicleData && (
        <div>
          <p>
            <strong>Owner:</strong> {vehicleData.ownerName}
          </p>
          <p>
            <strong>Phone:</strong> {vehicleData.phone}
          </p>
        </div>
      )}

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
        <label>
          RC Document:
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setRcFile(e.target.files[0])}
          />
        </label>
      </div>
      <div>
        <label>
          Aadhar Document:
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setAdharFile(e.target.files[0])}
          />
        </label>
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
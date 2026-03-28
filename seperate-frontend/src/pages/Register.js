import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [rcFile, setRcFile] = useState(null);
  const [adharFile, setAdharFile] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password || !vehicleNumber || !ownerPhone || !emergencyContact || !rcFile || !adharFile) {
      alert("Please fill all required fields, including vehicle, emergency contact, and documents.");
      return;
    }

    try {
      const registerResp = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const registerData = await registerResp.json();

      if (registerResp.status !== 201) {
        alert(registerData.message || "Registration failed");
        return;
      }

      const loginResp = await fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResp.json();
      if (!loginResp.ok || !loginData.token) {
        alert("User registered, but login failed. Please login manually.");
        navigate("/");
        return;
      }

      const token = loginData.token;
      localStorage.setItem("token", token);

      const formData = new FormData();
      formData.append("vehicleNumber", vehicleNumber);
      formData.append("ownerName", name);
      formData.append("ownerPhone", ownerPhone);
      formData.append("emergencyContact", emergencyContact);
      formData.append("rc", rcFile);
      formData.append("adhar", adharFile);

      const vehicleResp = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const vehicleData = await vehicleResp.json();
      if (!vehicleResp.ok) {
        alert("User registered, but vehicle upload failed: " + (vehicleData.message || "unknown"));
        navigate("/");
        return;
      }

      alert("Registration complete and vehicle uploaded. Waiting for admin verification.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Register</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Vehicle Number"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
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
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
      <button onClick={handleRegister}>Register</button>
      <p>
        Already have an account?{' '}
        <button onClick={() => navigate("/")}>Login</button>
      </p>
    </div>
  );
}

export default Register;

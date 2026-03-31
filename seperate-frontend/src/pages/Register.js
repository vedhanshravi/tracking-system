import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [rcFile, setRcFile] = useState(null);
  const [adharFile, setAdharFile] = useState(null);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      return (
        firstName &&
        lastName &&
        phone &&
        city &&
        state &&
        country &&
        postalCode &&
        addressLine1 &&
        email &&
        password
      );
    }
    if (currentStep === 2) {
      return vehicleNumber && ownerPhone && emergencyContact && rcFile && adharFile;
    }
    if (currentStep === 3) {
      return !!subscriptionId;
    }
    return false;
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      alert("Please complete all required fields for this step.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/subscriptions`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setSubscriptions(data);
        if (data.length > 0) {
          setSubscriptionId((prev) => prev || data[0].id.toString());
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubscriptions();
  }, []);

  const handleRegister = async () => {
    if (
      !firstName ||
      !lastName ||
      !phone ||
      !city ||
      !state ||
      !country ||
      !postalCode ||
      !addressLine1 ||
      !subscriptionId ||
      !email ||
      !password ||
      !vehicleNumber ||
      !ownerPhone ||
      !emergencyContact ||
      !rcFile ||
      !adharFile
    ) {
      alert("Please fill all required fields, including registration and vehicle details.");
      return;
    }

    try {
      const registerResp = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          middleName,
          lastName,
          phone,
          alternatePhone,
          city,
          state,
          country,
          postalCode,
          addressLine1,
          addressLine2,
          email,
          password,
          subscriptionId,
        }),
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
      const fullName = `${firstName}${middleName ? ` ${middleName}` : ""} ${lastName}`.trim();
      formData.append("vehicleNumber", vehicleNumber);
      formData.append("ownerName", fullName);
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
      <div style={{ marginBottom: 24 }}>
        <strong>Step {step} of 3</strong>
      </div>

      {step === 1 && (
        <>
          <label style={{ display: "block", margin: "10px 0 5px" }}>First Name:</label>
          <input
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Middle Name:</label>
          <input
            placeholder="Enter middle name (optional)"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Last Name:</label>
          <input
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Phone:</label>
          <input
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Alternate Phone:</label>
          <input
            placeholder="Enter alternate phone (optional)"
            value={alternatePhone}
            onChange={(e) => setAlternatePhone(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>City:</label>
          <input
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>State:</label>
          <input
            placeholder="Enter state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Country:</label>
          <input
            placeholder="Enter country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Postal Code:</label>
          <input
            placeholder="Enter postal code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Address Line 1:</label>
          <input
            placeholder="Enter address line 1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Address Line 2:</label>
          <input
            placeholder="Enter address line 2 (optional)"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Email:</label>
          <input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Password:</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </>
      )}

      {step === 2 && (
        <>
          <h3 style={{ marginTop: 24 }}>Vehicle Details</h3>
          <label style={{ display: "block", margin: "10px 0 5px" }}>Vehicle Number:</label>
          <input
            placeholder="Enter vehicle number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Owner Phone:</label>
          <input
            placeholder="Enter owner phone number"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
          />
          <label style={{ display: "block", margin: "10px 0 5px" }}>Emergency Contact:</label>
          <input
            placeholder="Enter emergency contact number"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              RC Document:
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setRcFile(e.target.files[0])}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Aadhar Document:
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setAdharFile(e.target.files[0])}
            />
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <label style={{ display: "block", margin: "10px 0 5px" }}>Subscription Type:</label>
          <select
            value={subscriptionId}
            onChange={(e) => setSubscriptionId(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          >
            <option value="" disabled>
              Select subscription
            </option>
            {subscriptions.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </>
      )}

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        {step > 1 && (
          <button type="button" onClick={handleBack}>
            Back
          </button>
        )}
        {step < 3 && (
          <button type="button" onClick={handleNext}>
            Next
          </button>
        )}
        {step === 3 && (
          <button type="button" onClick={handleRegister}>
            Submit Registration
          </button>
        )}
      </div>

      <p style={{ marginTop: 24 }}>
        Already have an account?{' '}
        <button onClick={() => navigate("/")}>Login</button>
      </p>
    </div>
  );
}

export default Register;

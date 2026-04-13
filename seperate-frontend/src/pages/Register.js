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
    <div className="page-container">
      <div className="page-card">
        <div className="page-hero">
          <div>
            <h2 className="page-title">Register Your Vehicle</h2>
            <p className="page-subtitle">Complete the secure onboarding flow to create your tracking account and submit vehicle details in three easy steps.</p>
          </div>
          <div className="badge">Step {step} of 3</div>
        </div>

        {step === 1 && (
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="input-field" placeholder="Enter first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input className="input-field" placeholder="Enter middle name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="input-field" placeholder="Enter last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="input-field" placeholder="Primary phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Alternate Phone</label>
                <input className="input-field" placeholder="Alternate phone" value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="input-field" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input className="input-field" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input className="input-field" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code *</label>
                <input className="input-field" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 1 *</label>
              <input className="input-field" placeholder="Address line 1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Address Line 2</label>
              <input className="input-field" placeholder="Address line 2" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="input-field" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="input-field" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Vehicle Number *</label>
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
              <label className="form-label">RC Document *</label>
              <input className="input-field" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setRcFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="form-label">Aadhar Document *</label>
              <input className="input-field" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setAdharFile(e.target.files[0])} />
            </div>
            <p className="help-text">Supported formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB.</p>
          </div>
        )}

        {step === 3 && (
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Choose Subscription Plan *</label>
              <select className="select-field" value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)}>
                {subscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} - {sub.price ? `₹${sub.price}` : "Free"}
                  </option>
                ))}
              </select>
            </div>
            <div className="help-card">
              <p><strong>Plan details</strong></p>
              <p>Pick the plan that fits your usage. Your subscription will determine verification and vehicle support access.</p>
            </div>
          </div>
        )}

        <div className="button-row" style={{ justifyContent: "space-between" }}>
          <button className="secondary-btn" type="button" onClick={handleBack} disabled={step === 1}>Back</button>
          {step < 3 ? (
            <button className="primary-btn" type="button" onClick={handleNext}>Continue</button>
          ) : (
            <button className="primary-btn" type="button" onClick={handleRegister}>Complete Registration</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;

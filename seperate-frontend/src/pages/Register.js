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
  const [showPassword, setShowPassword] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleDisplayName, setVehicleDisplayName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [rcFile, setRcFile] = useState(null);
  const [adharFile, setAdharFile] = useState(null);
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

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
      return vehicleDisplayName && ownerPhone && emergencyContact;
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
      !vehicleDisplayName ||
      !ownerPhone ||
      !emergencyContact
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
      formData.append("vehicleDisplayName", vehicleDisplayName);
      formData.append("ownerName", fullName);
      formData.append("ownerPhone", ownerPhone);
      formData.append("emergencyContact", emergencyContact);
      if (rcFile) formData.append("rc", rcFile);
      if (adharFile) formData.append("adhar", adharFile);

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

      setShowSuccessModal(true);
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
                <div className="password-input-container">
                  <input className="input-field" type={showPassword ? "text" : "password"} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="eye-icon">
                        <path d="M2.99902 3.00002L21 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 12 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 12 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.999 5C16.4784 5 20.2687 7.94291 21.5429 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="eye-icon">
                        <path d="M2.45703 12C3.73128 7.94291 7.52159 5 12 5C16.4784 5 20.2687 7.94291 21.5429 12C20.2687 16.0571 16.4784 19 12 19C7.52159 19 3.73128 16.0571 2.45703 12Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
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
                    {sub.name}{sub.price ? ` - ₹${sub.price}` : ""}
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

      {showSuccessModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: '#0f172a',
            padding: '24px',
            borderRadius: '16px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h3 style={{ marginBottom: '12px', color: '#f8fafc' }}>Success!</h3>
            <p style={{ marginBottom: '24px', color: '#cbd5e1', lineHeight: 1.6 }}>
              Registration complete and vehicle uploaded. Waiting for admin verification.
            </p>
            <button
              className="primary-btn"
              onClick={handleSuccessOk}
              style={{
                padding: '12px 26px',
                backgroundColor: '#14b8a6',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;

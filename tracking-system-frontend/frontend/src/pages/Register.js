import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './Register.css';
import carLogo from "../trackpro-car.svg";

// Country and State-District data - Complete official Indian districts
const countriesData = {
  India: {
    states: {
      "Andhra Pradesh": ["Adilabad", "Anantapur", "Chittoor", "Cuddapah", "East Godavari", "Guntur", "Kadapa", "Krishna", "Kurnool", "Hyderabad", "Karimnagar", "Khammam", "Medak", "Nalgonda", "Nellore", "Nizamabad", "Ongole", "Prakasam", "Ranga Reddy", "Srikakulam", "Tenali", "Tirupati", "Vijayawada", "Visakhapatnam", "Vizianagaram", "Warangal", "West Godavari", "Yadadri Bhuvanagiri", "Yadgir"],
      "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kra Daadi", "Kurung Kumey", "Lohit", "Longding", "Lower Dibang Valley", "Lower Subansiri", "Namsai", "Papum Pare", "Siang", "Tawang", "Tirap", "Upper Dibang Valley", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
      "Assam": ["Baksa", "Barpeta", "Bongaigaon", "Cachar", "Chirang", "Darrang", "Dhemaji", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "Tinsukia", "Udalguri", "West Karbi Anglong"],
      "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Chhapra", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhubani", "Madhepura", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Siwan", "Supaul", "Vaishali", "West Champaran"],
      "Chhattisgarh": ["Balod", "Balodabazaar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Manendragarh", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
      "Goa": ["North Goa", "South Goa"],
      "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhumi Dwarka", "Diam", "Gandhinagar", "Gir Somnath", "Godhra", "Junagadh", "Jamnagar", "Jyotiba Phoole Nagar", "Kheda", "Mahisagar", "Mantavyapur", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Salumber", "Sanand", "Surendranagar", "Surat", "Surendra Nagar", "Tapi", "Vadodara", "Valsad", "Vijapur"],
      "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurgaon", "Hisar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
      "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul Spiti", "Mandi", "Shimla", "Sirmour", "Solan", "Una"],
      "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
      "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
      "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
      "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
      "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
      "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
      "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
      "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
      "Nagaland": ["Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"],
      "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
      "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Sri Muktsar Sahib", "Tarn Taran"],
      "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
      "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
      "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
      "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal–Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"],
      "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unokti", "West Tripura"],
      "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
      "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
      "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
    }
  }
};

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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [alternatePhoneError, setAlternatePhoneError] = useState("");
  const [ownerPhoneError, setOwnerPhoneError] = useState("");
  const [emergencyContactError, setEmergencyContactError] = useState("");
  const [postalCodeError, setPostalCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber.replace(/\D/g, ''));
  };

  const showError = (title, message) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorTitle("");
    setErrorMessage("");
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      // Check name fields
      if (!firstName) {
        showError("First Name Required", "Please enter your first name.");
        return false;
      }
      if (!lastName) {
        showError("Last Name Required", "Please enter your last name.");
        return false;
      }
      
      // Check email
      if (!email) {
        showError("Email field is required", "Please enter your email address.");
        return false;
      }
      if (!validateEmail(email)) {
        showError("Invalid email format", "Please enter a valid email address (e.g., name@example.com).");
        return false;
      }

      // Check phone
      if (!phone) {
        showError("Phone Number field is required", "Please enter your phone number.");
        return false;
      }
      if (!validatePhone(phone)) {
        showError("Invalid phone format", "Please enter a valid 10-digit phone number.");
        return false;
      }

      // Check password
      if (!password) {
        showError("Password field is required", "Please enter a password.");
        return false;
      }
      if (!validatePassword(password)) {
        showError("Password format is invalid", "Password must be at least 8 characters with a letter, number, and special character (!@#$%^&*).");
        return false;
      }

      // Check confirm password
      if (!confirmPassword) {
        showError("Confirm Password field is required", "Please confirm your password.");
        return false;
      }
      if (password !== confirmPassword) {
        showError("Passwords do not match", "Your passwords do not match. Please re-enter.");
        return false;
      }

      // Check address fields
      if (!addressLine1) {
        showError("Address Required", "Please enter your street address.");
        return false;
      }
      if (!city) {
        showError("City Required", "Please enter your city.");
        return false;
      }
      if (!state) {
        showError("State Required", "Please select your state.");
        return false;
      }
      if (!country) {
        showError("Country Required", "Please select your country.");
        return false;
      }
      if (!postalCode) {
        showError("Postal Code Required", "Please enter your postal code.");
        return false;
      }
      if (!/^\d+$/.test(postalCode)) {
        showError("Invalid Postal Code", "Postal code must contain only numbers.");
        return false;
      }
      if (postalCode.length < 5) {
        showError("Invalid Postal Code", "Postal code must be at least 5 digits.");
        return false;
      }

      return true;
    }
    
    if (currentStep === 2) {
      if (!vehicleDisplayName) {
        showError("Vehicle Name Required", "Please enter a display name for your vehicle.");
        return false;
      }
      if (!ownerPhone) {
        showError("Owner Phone Required", "Please enter the vehicle owner's phone number.");
        return false;
      }
      if (!validatePhone(ownerPhone)) {
        showError("Invalid Owner Phone", "Please enter a valid 10-digit phone number.");
        return false;
      }
      if (!emergencyContact) {
        showError("Emergency Contact Required", "Please enter an emergency contact number.");
        return false;
      }
      if (!validatePhone(emergencyContact)) {
        showError("Invalid Emergency Contact", "Please enter a valid 10-digit phone number.");
        return false;
      }
      return true;
    }
    
    if (currentStep === 3) {
      if (!subscriptionId) {
        showError("Plan Selection Required", "Please select a subscription plan.");
        return false;
      }
      return true;
    }
    
    return false;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Unable to load Razorpay checkout script."));
      document.body.appendChild(script);
    });
  };

  const registerUser = async (paymentData) => {
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
          ...paymentData,
        }),
      });

      const registerData = await registerResp.json();

      if (registerResp.status !== 201) {
        const errorMessage = registerData.message || "Registration failed";
        if (errorMessage.toLowerCase().includes("email is already registered")) {
          showError("Email Already Registered", "This email is already registered. Please login or use a different email.");
        } else if (errorMessage.toLowerCase().includes("phone number is already registered")) {
          showError("Phone Already Registered", "This phone number is already registered. Please login or use a different phone number.");
        } else if (errorMessage.toLowerCase().includes("invalid subscription") || errorMessage.toLowerCase().includes("select a subscription")) {
          showError("Subscription Required", "Please select a valid subscription plan before continuing.");
        } else if (errorMessage.toLowerCase().includes("payment")) {
          showError("Payment Failed", errorMessage);
        } else {
          showError("Registration Failed", errorMessage);
        }
        return null;
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
        showError("Login Failed", "User registered, but login failed. Please login manually.");
        navigate("/");
        return null;
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
        showError("Vehicle Upload Failed", "User registered, but vehicle upload failed: " + (vehicleData.message || "unknown"));
        navigate("/");
        return null;
      }

      setShowSuccessModal(true);
      return registerData;
    } catch (err) {
      console.error(err);
      showError("Server Error", "An error occurred while processing your registration. Please try again.");
      return null;
    }
  };

  const handlePay = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }
    setPaymentError("");
    setPaymentProcessing(true);

    try {
      const orderResp = await fetch(`${process.env.REACT_APP_API_URL}/users/create-payment-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionId }),
      });
      const orderData = await orderResp.json();
      if (!orderResp.ok) {
        throw new Error(orderData.message || "Unable to create payment order.");
      }

      await loadRazorpayScript();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "TrackPro",
        description: `Subscription payment for ${orderData.subscriptionName}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
            setPaymentProcessing(false);
            showError("Payment Error", "Payment response is incomplete. Please try again.");
            return;
          }

          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };

          const userResult = await registerUser(paymentData);
          setPaymentProcessing(false);
          if (userResult) {
            setStep(3);
          }
        },
        prefill: {
          name: `${firstName}${middleName ? ` ${middleName}` : ""} ${lastName}`.trim(),
          email,
          contact: phone,
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      setPaymentProcessing(false);
      const message = err.message || "Payment initialization failed.";
      setPaymentError(message);
      showError("Payment Error", message);
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) {
      showError("Incomplete Form", "Please complete all required fields for this step.");
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/");
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
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
      showError("Incomplete Registration", "Please fill all required fields, including registration and vehicle details.");
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
        const errorMessage = registerData.message || "Registration failed";
        if (errorMessage.toLowerCase().includes("email is already registered")) {
          showError("Email Already Registered", "This email is already registered. Please login or use a different email.");
        } else if (errorMessage.toLowerCase().includes("phone number is already registered")) {
          showError("Phone Already Registered", "This phone number is already registered. Please login or use a different phone number.");
        } else if (errorMessage.toLowerCase().includes("invalid subscription") || errorMessage.toLowerCase().includes("select a subscription")) {
          showError("Subscription Required", "Please select a valid subscription plan before continuing.");
        } else {
          showError("Registration Failed", errorMessage);
        }
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
        showError("Login Failed", "User registered, but login failed. Please login manually.");
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
        showError("Vehicle Upload Failed", "User registered, but vehicle upload failed: " + (vehicleData.message || "unknown"));
        navigate("/");
        return;
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      showError("Server Error", "An error occurred while processing your registration. Please try again.");
    }
  };

  return (
    <div className="register-shell" data-testid="register-shell">
      <aside className="register-rail" data-testid="register-rail">
        <div className="register-rail-brand">
          <div className="register-rail-logo">
            <img src={carLogo} alt="TrackPro" />
          </div>
          <div>
            <div className="register-rail-brandname">TrackPro</div>
            <div className="register-rail-tag">Vehicle · Onboarding</div>
          </div>
        </div>

        <div>
          <h1 className="register-rail-heading">
            Register your<br />
            <span className="accent">vehicle securely.</span>
          </h1>
          <p className="register-rail-sub">
            A guided three-step flow to create your account, add your vehicle, and pick a plan — paperless, encrypted, and fast.
          </p>
        </div>

        <ol className="stepper" data-testid="register-stepper">
          {[
            { n: 1, title: "Your details", desc: "Name, contact & address" },
            { n: 2, title: "Vehicle info", desc: "Details & documents" },
            { n: 3, title: "Subscription", desc: "Pick your plan" },
          ].map((s) => {
            const state = step === s.n ? "active" : step > s.n ? "done" : "";
            return (
              <li
                key={s.n}
                className={`stepper-item ${state}`}
                data-testid={`stepper-item-${s.n}`}
              >
                <div className="stepper-bullet">
                  {step > s.n ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    s.n
                  )}
                </div>
                <div className="stepper-label">
                  <div className="stepper-title">{s.title}</div>
                  <div className="stepper-desc">{s.desc}</div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="register-rail-footer">
          © {new Date().getFullYear()} TRACKPRO · SECURE ONBOARDING
        </div>
      </aside>

      <main className="register-main">
      <div className="register-card" data-testid="register-card">
        <div className="register-progress-track" aria-hidden="true">
          <div
            className="register-progress-fill"
            style={{ width: `${(step / 3) * 100}%` }}
            data-testid="register-progress-fill"
          />
        </div>
        <div className="register-header">
          <div>
            <h2 className="register-title">
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "Add your vehicle"}
              {step === 3 && "Choose your plan"}
            </h2>
            <p className="register-subtitle">
              {step === 1 && "Basic personal, contact & address information to create your secure account."}
              {step === 2 && "Vehicle identifiers and ownership documents for verification."}
              {step === 3 && "Select a subscription plan that matches your usage."}
            </p>
          </div>
          <div className="register-step-badge" data-testid="register-step-badge">Step {step} / 3</div>
        </div>

        {step === 1 && (
          <>
            {/* Personal Information Section */}
            <div className="register-section">
              <h3 className="register-section-title">Personal Information</h3>
              <div className="register-form-grid">
                <div className="register-form-group">
                  <label className="register-form-label">First Name *</label>
                  <input
                    className="register-input-field"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="register-form-group">
                  <label className="register-form-label">Middle Name</label>
                  <input
                    className="register-input-field"
                    placeholder="Enter middle name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
                <div className="register-form-group">
                  <label className="register-form-label">Last Name *</label>
                  <input
                    className="register-input-field"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="register-section">
              <h3 className="register-section-title">Contact Information</h3>
              <div className="register-form-grid">
                <div className="register-form-group">
                  <label className="register-form-label">Phone *</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      className="register-input-field"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit number"
                      value={phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setPhone(numericValue);
                        if (numericValue && !validatePhone(numericValue)) {
                          setPhoneError("Please enter a valid 10-digit phone number.");
                        } else {
                          setPhoneError("");
                        }
                      }}
                    />
                  </div>
                  {phoneError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{phoneError}</p>}
                </div>
                <div className="register-form-group">
                  <label className="register-form-label">Alternate Phone</label>
                  <div className="phone-input-wrapper">
                    <span className="phone-prefix">+91</span>
                    <input
                      className="register-input-field"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Alternate number"
                      value={alternatePhone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setAlternatePhone(numericValue);
                        if (numericValue && !validatePhone(numericValue)) {
                          setAlternatePhoneError("Please enter a valid 10-digit phone number.");
                        } else {
                          setAlternatePhoneError("");
                        }
                      }}
                    />
                  </div>
                  {alternatePhoneError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{alternatePhoneError}</p>}
                </div>
              </div>
            </div>

            {/* Location & Address Section */}
            <div className="register-section">
              <h3 className="register-section-title">Location & Address</h3>
              <div className="register-form-grid">
                <div className="register-form-group">
                  <label className="register-form-label">Country *</label>
                  <select
                    className="register-select-field"
                    value={country}
                    onChange={(e) => { setCountry(e.target.value); setState(""); setCity(""); }}
                  >
                    <option value="">Select Country</option>
                    {Object.keys(countriesData).map((countryName) => (
                      <option key={countryName} value={countryName}>{countryName}</option>
                    ))}
                  </select>
                </div>
                <div className="register-form-group">
                  <label className="register-form-label">State *</label>
                  <select
                    className="register-select-field"
                    value={state}
                    onChange={(e) => { setState(e.target.value); setCity(""); }}
                    disabled={!country}
                  >
                    <option value="">Select State</option>
                    {country && countriesData[country] && Object.keys(countriesData[country].states).map((stateName) => (
                      <option key={stateName} value={stateName}>{stateName}</option>
                    ))}
                  </select>
                </div>
                <div className="register-form-group">
                  <label className="register-form-label">City *</label>
                  <select
                    className="register-select-field"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!state}
                  >
                    <option value="">Select City</option>
                    {state && countriesData[country] && countriesData[country].states[state] && countriesData[country].states[state].map((districtName) => (
                      <option key={districtName} value={districtName}>{districtName}</option>
                    ))}
                  </select>
                </div>
                <div className="register-form-group">
                  <label className="register-form-label">Postal Code *</label>
                  <input
                    className="register-input-field"
                    placeholder="Postal Code"
                    value={postalCode}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '');
                      setPostalCode(numericValue);
                      if (numericValue && numericValue.length < 5) {
                        setPostalCodeError("Postal code must be at least 5 digits.");
                      } else {
                        setPostalCodeError("");
                      }
                    }}
                  />
                  {postalCodeError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{postalCodeError}</p>}
                </div>
                <div className="register-form-group full-width">
                  <label className="register-form-label">Address Line 1 *</label>
                  <input
                    className="register-input-field"
                    placeholder="Address line 1"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>
                <div className="register-form-group full-width">
                  <label className="register-form-label">Address Line 2</label>
                  <input
                    className="register-input-field"
                    placeholder="Address line 2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
              </div>
            </div>

          <div className="register-section register-section-divider">
            <h3 className="register-section-title">Account Credentials</h3>
            <div className="register-form-grid">
              <div className="register-form-group full-width">
                <label className="register-form-label">Email ID *</label>
                <input
                  className="register-input-field"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value && !validateEmail(e.target.value)) {
                      setEmailError("Please enter a valid email format (e.g., name@example.com).");
                    } else {
                      setEmailError("");
                    }
                  }}
                />
                {emailError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{emailError}</p>}
              </div>
              <div className="register-form-group">
                <label className="register-form-label">New Password *</label>
                <div className="register-password-container">
                  <input
                    className="register-input-field"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value && !validatePassword(e.target.value)) {
                        setPasswordError("Password must be at least 8 characters with a letter, number, and special character (!@#$%^&*).");
                      } else {
                        setPasswordError("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" className="register-eye-icon">
                        <path d="M2.99902 3.00002L21 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 12 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 12 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.999 5C16.4784 5 20.2687 7.94291 21.5429 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="register-eye-icon">
                        <path d="M2.45703 12C3.73128 7.94291 7.52159 5 12 5C16.4784 5 20.2687 7.94291 21.5429 12C20.2687 16.0571 16.4784 19 12 19C7.52159 19 3.73128 16.0571 2.45703 12Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{passwordError}</p>}
              </div>
              <div className="register-form-group">
                <label className="register-form-label">Confirm New Password *</label>
                <div className="register-password-container">
                  <input
                    className="register-input-field"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (e.target.value && e.target.value !== password) {
                        setPasswordError("Passwords do not match.");
                      } else if (e.target.value && password && e.target.value === password) {
                        setPasswordError("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" className="register-eye-icon">
                        <path d="M2.99902 3.00002L21 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 12 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 12 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.999 5C16.4784 5 20.2687 7.94291 21.5429 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="register-eye-icon">
                        <path d="M2.45703 12C3.73128 7.94291 7.52159 5 12 5C16.4784 5 20.2687 7.94291 21.5429 12C20.2687 16.0571 16.4784 19 12 19C7.52159 19 3.73128 16.0571 2.45703 12Z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && password && password !== confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
          </>
        )}

        {step === 2 && (
          <div className="register-form-grid">
            <div className="register-form-group full-width">
              <label className="register-form-label">Vehicle Display Name *</label>
              <input
                className="register-input-field"
                placeholder="Car Name and Car Number"
                value={vehicleDisplayName}
                onChange={(e) => setVehicleDisplayName(e.target.value)}
              />
            </div>
            <div className="register-form-group full-width">
              <label className="register-form-label">Vehicle Number</label>
              <input
                className="register-input-field"
                placeholder="Enter vehicle number"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>
            <div className="register-form-group">
              <label className="register-form-label">Owner Phone *</label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix">+91</span>
                <input
                  className="register-input-field"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={ownerPhone}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setOwnerPhone(numericValue);
                    if (numericValue && !validatePhone(numericValue)) {
                      setOwnerPhoneError("Please enter a valid 10-digit phone number.");
                    } else {
                      setOwnerPhoneError("");
                    }
                  }}
                />
              </div>
              {ownerPhoneError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{ownerPhoneError}</p>}
            </div>
            <div className="register-form-group">
              <label className="register-form-label">Emergency Contact *</label>
              <div className="phone-input-wrapper">
                <span className="phone-prefix">+91</span>
                <input
                  className="register-input-field"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Emergency number"
                  value={emergencyContact}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setEmergencyContact(numericValue);
                    if (numericValue && !validatePhone(numericValue)) {
                      setEmergencyContactError("Please enter a valid 10-digit phone number.");
                    } else {
                      setEmergencyContactError("");
                    }
                  }}
                />
              </div>
              {emergencyContactError && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '4px' }}>{emergencyContactError}</p>}
            </div>
            <div className="register-form-group">
              <label className="register-form-label">RC Document</label>
              <input
                className="register-input-field"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setRcFile(e.target.files[0])}
              />
            </div>
            <div className="register-form-group">
              <label className="register-form-label">Aadhar Document</label>
              <input
                className="register-input-field"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setAdharFile(e.target.files[0])}
              />
            </div>
            <p className="register-help-text">Supported formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB.</p>
          </div>
        )}

        {step === 3 && (
          <div className="register-form-grid">
            <div className="register-form-group full-width">
              <label className="register-form-label">Choose Subscription Plan *</label>
              <select
                className="register-select-field"
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
              >
                <option value="">Select plan</option>
                {subscriptions.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}{sub.price ? ` - ₹${sub.price}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="register-help-card">
              <p><strong>Plan details</strong></p>
              <p>Pick the plan that fits your usage. Your subscription will determine verification and vehicle support access.</p>
            </div>
            <div className="register-plan-summary">
              <div className="register-plan-item">Gold - ₹199</div>
              <div className="register-plan-item">Platinum - ₹299</div>
              <div className="register-plan-item">Diamond - ₹499</div>
            </div>
            {paymentError && (
              <div className="register-error-banner">
                <p>{paymentError}</p>
              </div>
            )}
          </div>
        )}

        <div className="register-button-row">
          <button
            className="register-secondary-btn"
            type="button"
            onClick={handleBack}
            data-testid="register-back-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          {step < 3 ? (
            <button
              className="register-primary-btn"
              type="button"
              onClick={handleNext}
              disabled={step === 1 && password && confirmPassword && password !== confirmPassword}
              data-testid="register-continue-btn"
            >
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            <button
              className="register-primary-btn"
              type="button"
              onClick={handlePay}
              disabled={paymentProcessing}
              data-testid="register-pay-btn"
            >
              {paymentProcessing ? "Processing Payment..." : "Pay"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="register-modal-overlay" data-testid="register-success-modal">
          <div className="register-modal-content">
            <div className="register-modal-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="register-modal-title">You're all set!</h3>
            <p className="register-modal-message">
              Registration complete and vehicle submitted. Waiting for admin verification — you can continue to your dashboard.
            </p>
            <button
              className="register-primary-btn"
              onClick={handleSuccessOk}
              data-testid="register-success-ok"
              style={{ minWidth: 160, justifyContent: 'center' }}
            >
              Go to dashboard
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="register-modal-overlay">
          <div className="register-modal-content">
            <div className="register-modal-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="register-modal-title">{errorTitle || 'Error'}</h3>
            <p className="register-modal-message">{errorMessage || 'An error occurred. Please try again.'}</p>
            <button
              className="register-primary-btn"
              onClick={closeErrorModal}
              style={{ minWidth: 120, justifyContent: 'center' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default Register;

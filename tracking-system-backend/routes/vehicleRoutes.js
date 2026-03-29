const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendSmsMessage, client } = require("../utils/twilioCall");

// Ensure upload dir exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, name);
  },
});

const upload = multer({ storage, limits: { fileSize: MAX_FILE_SIZE } });
const uploadFields = upload.fields([{ name: "rc", maxCount: 1 }, { name: "adhar", maxCount: 1 }]);

// Global variable to store the current vehicle number for incoming calls
global.currentVehicleCall = null;

router.post("/scan", async (req, res) => {
  const { vehicleNumber } = req.body;

  try {
    const result = await pool.query(
      `
      SELECT v.*, u.email 
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
      WHERE UPPER(v.vehicle_number) = UPPER($1)
      `,
      [vehicleNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const vehicle = result.rows[0];

    // 🌍 Get IP address of requester
    const forwarded = req.headers["x-forwarded-for"];
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress;
    const probeIp = (clientIp === "::1" || clientIp.startsWith("127.")) ? "8.8.8.8" : clientIp;

    // 🌍 Get location
    const geoResponse = await fetch(
      `http://ip-api.com/json/${probeIp}?fields=status,country,city,query,lat,lon`
    );
    const geoData = await geoResponse.json();

    const city = geoData.city || "Unknown city";
    const country = geoData.country || "Unknown country";
    const latitude = geoData.lat != null ? geoData.lat : null;
    const longitude = geoData.lon != null ? geoData.lon : null;
    const ip = geoData.query || probeIp;
    const mapUrl = latitude !== null && longitude !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
      : null;

    // 🔥 Insert scan with location
    await pool.query(
      `
      INSERT INTO scans (
        vehicle_id,
        ip_address,
        city,
        country,
        latitude,
        longitude,
        map_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [vehicle.id, ip, city, country, latitude, longitude, mapUrl]
    );

    const maskedPhone =
      "XXXXXXX" + vehicle.owner_phone.slice(-3);

    // Send response immediately
    res.json({
      ownerName: vehicle.owner_name,
      phone: maskedPhone,
      ownerPhone: vehicle.owner_phone,
      emergencyContact: vehicle.emergency_contact,
      latitude,
      longitude,
      mapUrl,
    });

    const locationText = mapUrl ? ` Location: ${mapUrl}` : "";
    // 🔔 Send SMS via Twilio asynchronously (doesn't block the response)
    sendSmsMessage(
      vehicle.owner_phone,
      `Your vehicle ${vehicle.vehicle_number} was scanned at ${new Date().toLocaleString()} in ${city}, ${country}.${locationText}`
    ).catch(err => console.error('SMS send failed:', err));

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Admin-only middleware
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.post("/add", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userResult = await pool.query(
      "SELECT subscription_tier FROM users WHERE id = $1",
      [userId]
    );
    const subscriptionTier = userResult.rows[0]?.subscription_tier || 1;
    const vehicleLimit = subscriptionTier === 2 ? 5 : 2;

    const countResult = await pool.query(
      "SELECT COUNT(*) AS total FROM vehicles WHERE user_id = $1",
      [userId]
    );
    const existingVehicles = parseInt(countResult.rows[0].total, 10);

    if (existingVehicles >= vehicleLimit) {
      return res.status(400).json({ message: "You reached maximum number of vehicles limit, Please contact customer Support" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}, (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "RC and Aadhar documents must be 5MB or smaller" });
      }
      return res.status(400).json({ message: err.message || "File upload failed" });
    }
    next();
  });
}, async (req, res) => {
  const { vehicleNumber, ownerName, ownerPhone, emergencyContact } = req.body;
  const rcFile = req.files?.rc?.[0];
  const adharFile = req.files?.adhar?.[0];

  if (!vehicleNumber || !ownerName || !ownerPhone || !emergencyContact || !rcFile || !adharFile) {
    return res.status(400).json({ message: "All vehicle fields, emergency contact, RC and Aadhar are required" });
  }

  if (rcFile.size > MAX_FILE_SIZE || adharFile.size > MAX_FILE_SIZE) {
    return res.status(400).json({ message: "RC and Aadhar documents must be 5MB or smaller" });
  }

  try {
    console.log("/vehicles/add requested by user:", req.user);

    const rcFileBuffer = fs.readFileSync(rcFile.path);
    const adharFileBuffer = fs.readFileSync(adharFile.path);

    await pool.query(
      `INSERT INTO vehicles (
          user_id,
          vehicle_number,
          owner_name,
          owner_phone,
          emergency_contact,
          rc_document,
          adhar_document,
          rc_document_name,
          adhar_document_name,
          rc_document_data,
          adhar_document_data,
          is_verified
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        req.user.userId || req.user.id,
        vehicleNumber.toUpperCase(),
        ownerName,
        ownerPhone,
        emergencyContact,
        rcFile.filename,
        adharFile.filename,
        rcFile.originalname,
        adharFile.originalname,
        rcFileBuffer,
        adharFileBuffer,
        false,
      ]
    );

    res.json({ message: "Vehicle added successfully; pending admin approval" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const QRCode = require("qrcode");

// Get logged-in user's vehicles
router.get("/my", verifyToken, async (req, res) => {
  try {
    console.log("/vehicles/my requested by user:", req.user);
    const result = await pool.query(
      "SELECT * FROM vehicles WHERE user_id = $1",
      [req.user.userId || req.user.id]
    );

    const vehicles = await Promise.all(
      result.rows.map(async (vehicle) => {
        let qrImage = null;
        if (vehicle.is_verified) {
          const qrData = `https://tracking-system-liart.vercel.app/scan/${vehicle.vehicle_number}`;
          qrImage = await QRCode.toDataURL(qrData);
        }

        return {
          ...vehicle,
          qr: qrImage,
          rc_url: vehicle.rc_document ? `${req.protocol}://${req.get("host")}/uploads/${vehicle.rc_document}` : null,
          adhar_url: vehicle.adhar_document ? `${req.protocol}://${req.get("host")}/uploads/${vehicle.adhar_document}` : null,
        };
      })
    );

    res.json(vehicles);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: list vehicles awaiting verification with pagination
router.get("/pending", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = 5;
    const offset = (page - 1) * pageSize;

    const countResult = await pool.query(
      "SELECT COUNT(*) AS total FROM vehicles WHERE is_verified = false"
    );
    const total = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(total / pageSize);

    const result = await pool.query(
      "SELECT * FROM vehicles WHERE is_verified = false ORDER BY id ASC LIMIT $1 OFFSET $2",
      [pageSize, offset]
    );

    res.json({
      data: result.rows,
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: serve vehicle document by ID and type
router.get("/document/:vehicleId/:type", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { vehicleId, type } = req.params;
    if (!["rc", "adhar"].includes(type)) {
      return res.status(400).json({ message: "Invalid document type" });
    }

    const filenameField = type === "rc" ? "rc_document" : "adhar_document";
    const originalNameField = type === "rc" ? "rc_document_name" : "adhar_document_name";
    const dataField = type === "rc" ? "rc_document_data" : "adhar_document_data";

    const result = await pool.query(
      `SELECT ${filenameField}, ${originalNameField}, ${dataField} FROM vehicles WHERE id = $1`,
      [vehicleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const vehicle = result.rows[0];
    const filename = vehicle[filenameField];
    const originalName = vehicle[originalNameField];
    const fileData = vehicle[dataField];

    if (filename) {
      const filePath = path.join(__dirname, "..", "uploads", filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    if (fileData) {
      const safeName = originalName || `${type}_document`;
      const ext = path.extname(safeName).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".pdf") contentType = "application/pdf";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";

      res.setHeader("Content-Disposition", `inline; filename="${safeName}"`);
      res.setHeader("Content-Type", contentType);
      return res.send(fileData);
    }

    return res.status(404).json({ message: "Document not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", verifyToken, async (req, res) => {
  try {
    console.log("/vehicles/stats requested by user:", req.user);
    const result = await pool.query(
      `
      SELECT 
        v.id,
        v.vehicle_number,
        COUNT(s.id) AS total_scans,
        MAX(s.scanned_at) AS last_scanned
      FROM vehicles v
      LEFT JOIN scans s ON v.id = s.vehicle_id
      WHERE v.user_id = $1
      GROUP BY v.id
      `,
      [req.user.userId || req.user.id]
    );

    console.log("/vehicles/stats rows:", result.rows.length);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: verify vehicle documents
router.post("/verify/:vehicleId", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const verifierName = req.user.name || null;
    await pool.query(
      "UPDATE vehicles SET is_verified = true, verified_by = $2, verified_at = NOW(), verification_status = 'approved' WHERE id = $1",
      [vehicleId, verifierName]
    );
    res.json({ message: "Vehicle verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
 


// GET /call/:vehicleNumber - returns TwiML to dial owner
router.get("/call/:vehicleNumber", async (req, res) => {
  const { vehicleNumber } = req.params;

  try {
    const result = await pool.query(
      "SELECT owner_phone FROM vehicles WHERE vehicle_number = $1",
      [vehicleNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Vehicle not found");
    }

    const ownerPhone = result.rows[0].owner_phone;

    // Return TwiML to dial the owner
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}">
    ${ownerPhone}
  </Dial>
</Response>`;

    res.type('text/xml');
    res.send(twiml);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// POST /connect - connect scanner to owner
router.post("/connect", async (req, res) => {
  const { scannerPhone, vehicleNumber } = req.body;

  try {
    const result = await pool.query(
      "SELECT owner_phone FROM vehicles WHERE vehicle_number = $1",
      [vehicleNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const ownerPhone = result.rows[0].owner_phone;

    const callSid = await connectScannerToOwner(scannerPhone, ownerPhone);

    res.json({
      message: "Connecting...",
      callSid,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Connection failed" });
  }
});

// POST /set-twiml - store vehicle number and call type for incoming call
router.post("/set-twiml", async (req, res) => {
  const { vehicleNumber, callType } = req.body;
  const type = callType === "emergency" ? "emergency" : "owner";

  try {
    // Store the current call context globally
    global.currentVehicleCall = { vehicleNumber, callType: type };

    console.log(`Set current vehicle call to: ${vehicleNumber} (${type})`);
    res.json({ message: "Vehicle call set", vehicleNumber, callType: type });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to set vehicle call" });
  }
});

// GET /incoming-call - Twilio webhook for incoming calls
router.get("/incoming-call", async (req, res) => {
  try {
    const callContext = global.currentVehicleCall;
    const vehicleNumber = callContext?.vehicleNumber;
    const callType = callContext?.callType || "owner";

    if (!vehicleNumber) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>No vehicle selected for call</Say>
</Response>`;
      res.type('text/xml');
      return res.send(twiml);
    }

    const result = await pool.query(
      "SELECT owner_phone, emergency_contact FROM vehicles WHERE vehicle_number = $1",
      [vehicleNumber]
    );

    if (result.rows.length === 0) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Vehicle not found</Say>
</Response>`;
      res.type('text/xml');
      return res.send(twiml);
    }

    const row = result.rows[0];
    const targetPhone = callType === "emergency" ? row.emergency_contact : row.owner_phone;

    if (!targetPhone) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Phone number not found for this contact</Say>
</Response>`;
      res.type('text/xml');
      return res.send(twiml);
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${process.env.TWILIO_PHONE_NUMBER}">
    ${targetPhone}
  </Dial>
</Response>`;

    res.type('text/xml');
    res.send(twiml);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
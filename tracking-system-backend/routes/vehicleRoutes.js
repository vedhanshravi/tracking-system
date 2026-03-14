const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

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
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // 🌍 Get location
    const geoResponse = await fetch(
      `http://ip-api.com/json/${ip}`
    );
    const geoData = await geoResponse.json();

    const city = geoData.city || "Unknown";
    const country = geoData.country || "Unknown";

    // 🔥 Insert scan with location
    await pool.query(
      `
      INSERT INTO scans (vehicle_id, ip_address, city, country)
      VALUES ($1, $2, $3, $4)
      `,
      [vehicle.id, ip, city, country]
    );

    // 🔔 Send Email
    await sendEmail(
      vehicle.email,
      "Vehicle Scanned Alert 🚗",
      `Your vehicle ${vehicle.vehicle_number} was scanned at ${new Date().toLocaleString()} in ${city}, ${country}.`
    );

    const maskedPhone =
      "XXXXXXX" + vehicle.owner_phone.slice(-3);

    res.json({
      ownerName: vehicle.owner_name,
      phone: maskedPhone,
    });

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

// Add vehicle
router.post("/add", verifyToken, async (req, res) => {
  const { vehicleNumber, ownerName, ownerPhone } = req.body;

  try {
    console.log("/vehicles/add requested by user:", req.user);
    await pool.query(
      `INSERT INTO vehicles (user_id, vehicle_number, owner_name, owner_phone)
       VALUES ($1, $2, $3, $4)`,
      [req.user.userId || req.user.id, vehicleNumber.toUpperCase(), ownerName, ownerPhone]
    );

    res.json({ message: "Vehicle added successfully" });

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
        const qrData = `https://tracking-system-liart.vercel.app/scan/${vehicle.vehicle_number}`;

        const qrImage = await QRCode.toDataURL(qrData);

        return {
          ...vehicle,
          qr: qrImage,
        };
      })
    );

    res.json(vehicles);

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
 

module.exports = router;
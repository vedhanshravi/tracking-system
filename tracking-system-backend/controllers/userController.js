const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { sendSmsMessage } = require("../utils/msg91");

let passwordResetOtpTableCreated = false;

async function ensurePasswordResetOtpTable() {
  if (passwordResetOtpTableCreated) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  passwordResetOtpTableCreated = true;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function clearPreviousOtps(userId) {
  await pool.query("DELETE FROM password_reset_otps WHERE user_id = $1", [userId]);
}

exports.createUser = async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phone ||
      !city ||
      !state ||
      !country ||
      !postalCode ||
      !addressLine1 ||
      !email ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required registration fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName}${middleName ? ` ${middleName}` : ""} ${lastName}`.trim();

    const result = await pool.query(
      `INSERT INTO users (
          name,
          first_name,
          middle_name,
          last_name,
          phone,
          alternate_phone,
          city,
          state,
          country,
          postal_code,
          address_line1,
          address_line2,
          email,
          password
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING id, email, first_name, middle_name, last_name`,
      [
        fullName,
        firstName,
        middleName || null,
        lastName,
        phone,
        alternatePhone || null,
        city,
        state,
        country,
        postalCode,
        addressLine1,
        addressLine2 || null,
        email,
        hashedPassword,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
};

const jwt = require("jsonwebtoken");
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        userId: user.id,
        firstName: user.first_name,
        middleName: user.middle_name || null,
        lastName: user.last_name,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
};

exports.requestPasswordResetOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    await ensurePasswordResetOtpTable();
    await clearPreviousOtps(user.id);

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "INSERT INTO password_reset_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
      [user.id, otp, expiresAt]
    );

    await sendSmsMessage(
      user.phone,
      `Your password reset OTP is ${otp}. It is valid for 10 minutes.`
    );

    res.json({ message: "OTP sent to registered mobile number" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Unable to send OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword, confirmPassword } = req.body;
    if (!phone || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const userResult = await pool.query(
      "SELECT id FROM users WHERE phone = $1",
      [phone]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await ensurePasswordResetOtpTable();

    const otpResult = await pool.query(
      `SELECT otp, expires_at FROM password_reset_otps WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userResult.rows[0].id]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "No OTP request found. Please request a new OTP." });
    }

    const savedOtp = otpResult.rows[0];
    if (savedOtp.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (new Date(savedOtp.expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP expired. Please request a new code." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );
    await pool.query("DELETE FROM password_reset_otps WHERE user_id = $1", [userResult.rows[0].id]);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
 
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
 
    const result = await pool.query(
      "SELECT id, email, first_name, middle_name, last_name, phone, alternate_phone, city, state, country, postal_code, address_line1, address_line2, created_at, role FROM users WHERE id = $1",
      [userId]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
 
    const user = result.rows[0];
    user.fullName = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch user");
  }
};
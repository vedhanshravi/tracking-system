const pool = require("../config/db");
const bcrypt = require("bcrypt");
 
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

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashedPassword, email]
    );

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
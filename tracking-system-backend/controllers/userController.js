const pool = require("../config/db");
const bcrypt = require("bcrypt");
const https = require("https");
const crypto = require("crypto");
const { sendSmsMessage } = require("../utils/msg91");

let passwordResetOtpTableCreated = false;
let subscriptionTableReady = false;
let userSubscriptionColumnReady = false;
let paymentsTableReady = false;
let usersTableReady = false;

async function ensureUsersTable() {
  if (usersTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  usersTableReady = true;
}

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

async function ensureSubscriptionTable() {
  if (subscriptionTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      tier INTEGER NOT NULL DEFAULT 1,
      max_vehicles INTEGER NOT NULL DEFAULT 2,
      price INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 0
  `);
  await pool.query(`
    INSERT INTO subscriptions (name, tier, max_vehicles, price)
    VALUES
      ('Gold', 1, 2, 199),
      ('Platinum', 2, 5, 299),
      ('Diamond', 3, 10, 999)
    ON CONFLICT (name) DO NOTHING
  `);
  subscriptionTableReady = true;
}

async function ensurePaymentsTable() {
  if (paymentsTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      subscription_id INTEGER REFERENCES subscriptions(id),
      razorpay_order_id VARCHAR(100),
      razorpay_payment_id VARCHAR(100),
      razorpay_signature VARCHAR(255),
      amount INTEGER NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'INR',
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  paymentsTableReady = true;
}

async function ensureUserSubscriptionColumn() {
  if (userSubscriptionColumnReady) return;
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(50)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(50)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(50)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id INTEGER REFERENCES subscriptions(id)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMP");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier INTEGER DEFAULT 1");
  } catch (err) {
    console.error("Failed to ensure user columns:", err);
  }
  userSubscriptionColumnReady = true;
}

function isSubscriptionExpired(user) {
  if (!user || !user.subscription_end) return true;
  return new Date(user.subscription_end) < new Date();
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function clearPreviousOtps(userId) {
  await pool.query("DELETE FROM password_reset_otps WHERE user_id = $1", [userId]);
}

function getRazorpayCredentials() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_Skqdqjg7q5tdZL",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "SwhZ9JlO1HseAeUxa6icxnPG",
  };
}

function createRazorpayOrder(amount, currency = "INR", receipt = "trackpro_receipt") {
  const { keyId, keySecret } = getRazorpayCredentials();
  const postData = JSON.stringify({ amount, currency, receipt, payment_capture: 1 });

  const options = {
    hostname: "api.razorpay.com",
    port: 443,
    path: "/v1/orders",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let responseData = "";
      response.on("data", (chunk) => {
        responseData += chunk;
      });
      response.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.description || responseData));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    request.on("error", (err) => reject(err));
    request.write(postData);
    request.end();
  });
}

exports.createPaymentOrder = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ message: "Subscription ID is required" });
    }

    await ensureSubscriptionTable();

    const subscriptionResult = await pool.query(
      "SELECT id, name, price FROM subscriptions WHERE id = $1",
      [subscriptionId]
    );
    if (subscriptionResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const subscription = subscriptionResult.rows[0];
    const amount = subscription.price * 100;
    const order = await createRazorpayOrder(amount, "INR", `trackpro_subscription_${subscription.id}_${Date.now()}`);
    const { keyId } = getRazorpayCredentials();

    res.json({
      key: keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      subscriptionName: subscription.name,
      subscriptionPrice: subscription.price,
    });
  } catch (err) {
    console.error("Payment order creation failed:", err);
    res.status(500).json({ message: "Could not create payment order", error: err.message });
  }
};

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
      subscriptionId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
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
      !password ||
      !subscriptionId
    ) {
      return res.status(400).json({ message: "Missing required registration fields" });
    }

    await ensureUsersTable();
    await ensureSubscriptionTable();
    await ensureUserSubscriptionColumn();
    await ensurePaymentsTable();

    const selectedSubscriptionId = parseInt(subscriptionId, 10);
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date(subscriptionStart);
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    const subscriptionResult = await pool.query(
      "SELECT id, price FROM subscriptions WHERE id = $1",
      [selectedSubscriptionId]
    );
    if (subscriptionResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid subscription selection" });
    }

    if (razorpay_order_id || razorpay_payment_id || razorpay_signature) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "Incomplete payment details" });
      }
      const { keySecret } = getRazorpayCredentials();
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
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
          password,
          subscription_id,
          subscription_start,
          subscription_end
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        RETURNING id, email, first_name, middle_name, last_name, subscription_id, subscription_start, subscription_end`,
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
        selectedSubscriptionId,
        subscriptionStart,
        subscriptionEnd,
      ]
    );

    const createdUser = result.rows[0];
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const selectedPrice = subscriptionResult.rows[0].price || 0;
      await pool.query(
        `INSERT INTO payments (
            user_id,
            subscription_id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
            currency,
            status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          createdUser.id,
          selectedSubscriptionId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          selectedPrice * 100,
          "INR",
          "paid",
        ]
      );
    }

    res.status(201).json(createdUser);
  } catch (err) {
    console.error(err);
    if (err.code === "23505" && err.constraint === "users_email_key") {
      return res.status(400).json({ message: "Email is already registered" });
    }
    res.status(500).send("Error creating user");
  }
};

const jwt = require("jsonwebtoken");
exports.loginUser = async (req, res) => {
  try {
    await ensureSubscriptionTable();
    await ensureUserSubscriptionColumn();

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

exports.getSubscriptions = async (req, res) => {
  try {
    await ensureSubscriptionTable();
    const result = await pool.query(
      "SELECT id, name, tier, max_vehicles, price FROM subscriptions ORDER BY tier ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load subscriptions" });
  }
};

exports.requestPasswordResetOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const userResult = await pool.query(
      "SELECT id, phone FROM users WHERE phone = $1",
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
    console.error("OTP send failed:", err);
    res.status(500).json({ message: "Unable to send OTP", error: err.message });
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
      "UPDATE users SET password = $1 WHERE phone = $2",
      [hashedPassword, phone]
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
 
    await ensureSubscriptionTable();
    await ensureUserSubscriptionColumn();
 
    const result = await pool.query(
      `SELECT u.id,
              u.email,
              u.first_name,
              u.middle_name,
              u.last_name,
              u.phone,
              u.alternate_phone,
              u.city,
              u.state,
              u.country,
              u.postal_code,
              u.address_line1,
              u.address_line2,
              u.created_at,
              u.role,
              u.subscription_start,
              u.subscription_end,
              s.id AS subscription_id,
              s.name AS subscription_name,
              s.tier AS subscription_tier,
              s.max_vehicles
       FROM users u
       LEFT JOIN subscriptions s ON u.subscription_id = s.id
       WHERE u.id = $1`,
      [userId]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
 
    const user = result.rows[0];
    user.subscription_active = !isSubscriptionExpired(user);
    user.fullName = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch user");
  }
};
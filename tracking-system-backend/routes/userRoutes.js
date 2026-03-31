const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  requestPasswordResetOtp,
  resetPassword,
  getCurrentUser,
  getSubscriptions,
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/request-reset-otp", requestPasswordResetOtp);
router.post("/reset-password", resetPassword);
router.get("/subscriptions", getSubscriptions);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
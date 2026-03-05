const express = require("express");
const router = express.Router();
const { createUser, loginUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { getCurrentUser } = require("../controllers/userController");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
 
router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
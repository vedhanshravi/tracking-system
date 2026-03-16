const pool = require("./config/db");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt")
require("dotenv").config({ path: '.env.local' });
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection failed");
  }
});
 
const userRoutes = require("./routes/userRoutes");
app.use("/users", userRoutes);

const vehicleRoutes = require("./routes/vehicleRoutes");
app.use("/vehicles", vehicleRoutes);
 

 
const PORT = process.env.PORT || 5000;
 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const authMiddleware = require("./middleware/authMiddleware");
 
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You accessed protected route",
    user: req.user,
  });
});

 
// const vehicleRoutes = require("./routes/vehicleRoutes");
// app.use("/vehicle", vehicleRoutes);
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  raiseIssue,
  getMyIssues,
  getAllIssues,
  updateIssueStatus,
} = require("../controllers/helpController");

const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.post("/raise", authMiddleware, raiseIssue);
router.get("/my", authMiddleware, getMyIssues);
router.get("/all", authMiddleware, verifyAdmin, getAllIssues);
router.patch("/status/:id", authMiddleware, verifyAdmin, updateIssueStatus);

module.exports = router;

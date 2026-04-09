const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../Database Models/userModels");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

router.post("/onboarding", async (req, res) => {
  console.log("=== /onboarding HIT ===");

  // 1. Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // 2. Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
    console.log("DECODED TOKEN:", decoded);
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // 3. Extract body
  const { denomination, bibleVersion, ageGroup, gender, notifications } = req.body;
  console.log("BODY:", req.body);

  // 4. Find user by ID from token and update
  try {
    const user = await User.findByIdAndUpdate(
      decoded.id,
      {
        $set: {
          "onboarding.denomination":  denomination  || "",
          "onboarding.bibleVersion":  bibleVersion  || "",
          "onboarding.ageGroup":      ageGroup      || "",
          "onboarding.gender":        gender        || "",
          "onboarding.notifications": notifications || [],
          "onboarding.completed":     true,
        },
      },
      { new: true }
    );

    console.log("USER FOUND:", user ? user._id : "NULL");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Onboarding saved", onboarding: user.onboarding });
  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
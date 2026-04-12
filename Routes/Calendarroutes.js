const express = require("express");
const router = express.Router();

// middleware (agar alag file me hai to import karo)
const jwt = require("jsonwebtoken");
const User = require("../Database Models/userModels"); // ← fix: was 'userModels'

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 1. Header missing
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // 2. Format check (must be Bearer token)
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // 4. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach userId
    req.userId = decoded.id;

    next();

  } catch (err) {
    console.log("JWT Error:", err.message);

    // 6. Better error messages
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/all", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("calendarEntries");
    if (!user) return res.status(404).json({ error: "User not found" });

    const result = {};
    user.calendarEntries.forEach(e => {
      result[e.dateKey] = e;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    const user = await User.findById(req.userId).select("calendarEntries");

    let entries = user.calendarEntries;

    if (year && month) {
      const prefix = `${year}-${String(month).padStart(2, "0")}-`;
      entries = entries.filter(e => e.dateKey.startsWith(prefix));
    }

    const result = {};
    entries.forEach(e => {
      result[e.dateKey] = e;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:dateKey", authMiddleware, async (req, res) => {
  try {
    const { dateKey } = req.params;
    const { time = 0, verses = 0, acts = [], notes = "" } = req.body;

    const user = await User.findById(req.userId);

    const existing = user.calendarEntries.find(e => e.dateKey === dateKey);

    if (existing) {
      Object.assign(existing, { time, verses, acts, notes });
    } else {
      user.calendarEntries.push({ dateKey, time, verses, acts, notes });
    }

    await user.save();
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:dateKey", authMiddleware, async (req, res) => {
  try {
    const { dateKey } = req.params;

    const user = await User.findById(req.userId);
    user.calendarEntries = user.calendarEntries.filter(e => e.dateKey !== dateKey);

    await user.save();
    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// Routes/progress.js
const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../Database Models/userModels");

function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch { res.status(401).json({ error: "Invalid token" }); }
}

// GET today's progress
router.get("/today", auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const user  = await User.findById(req.userId).select("calendarEntries streak lastStreakDate");
    if (!user) return res.status(404).json({ error: "User not found" });

    const entry = user.calendarEntries.find(e => e.dateKey === today);

    // ── Streak reset check ──────────────────────────────────────
    // If lastStreakDate is not yesterday or today, streak is broken
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);

    let streak         = user.streak        || 0;
    let lastStreakDate  = user.lastStreakDate || null;

    if (lastStreakDate && lastStreakDate !== today && lastStreakDate !== yKey) {
      // Missed a day — reset streak
      streak = 0;
      user.streak        = 0;
      user.lastStreakDate = null;
      await user.save();
    }

    res.json({
      versesReadToday: entry?.verses || 0,
      streak,
      lastStreakDate,
      todayEntry: entry || null,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — mark a verse as read (called every time user taps "Mark as Read")
router.post("/verse-read", auth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const REQUIRED = 5;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ── Update calendar entry ───────────────────────────────────
    let entry = user.calendarEntries.find(e => e.dateKey === today);
    if (entry) {
      entry.verses     = (entry.verses || 0) + 1;
      entry.updatedAt  = new Date();
    } else {
      user.calendarEntries.push({ dateKey: today, verses: 1, time: 0, acts: [], notes: "" });
      entry = user.calendarEntries[user.calendarEntries.length - 1];
    }

    const versesReadToday = entry.verses;

    // ── Streak logic ────────────────────────────────────────────
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().slice(0, 10);

    let streak        = user.streak        || 0;
    let lastStreakDate = user.lastStreakDate || null;

    if (versesReadToday >= REQUIRED) {
      // Goal hit today — update streak only once per day
      if (lastStreakDate !== today) {
        streak = (lastStreakDate === yKey) ? streak + 1 : 1;
        user.streak        = streak;
        user.lastStreakDate = today;
      }
    }

    await user.save();

    res.json({ versesReadToday, streak, goalReached: versesReadToday >= REQUIRED });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
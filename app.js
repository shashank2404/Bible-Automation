require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./configue/db");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const User = require("./Database Models/userModels");
const Verse = require("./Database Models/verseModels");
const onboardingRoutes = require("./Routes/onboarding");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ✅ ADD THIS HERE
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:5173"
  );
  next();
});


connectDB();
app.use("/", onboardingRoutes);
app.use("/api/bible", require("./Routes/bible"));
// ─── JWT SECRET ───────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// ─── HOME ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Bible AI Backend Running 🚀");
});


// ─── REGISTER ─────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("REGISTER BODY:", req.body);

    // Empty field check
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    // Duplicate user check
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // ✅ FIX: include name in User.create()
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
    });

    // ✅ FIX: generate token so frontend can auto-login after register
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "User created successfully", token });

  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Wrong password" });
    }

    // ✅ FIX: use shared JWT_SECRET constant
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});
// ─── BIBLE CHAPTER ────────────────────────────────────────────
app.get("/api/bible/chapter", async (req, res) => {
  try {
    const { book, chapter } = req.query;

    if (!book || !chapter) {
      return res.status(400).json({ error: "book and chapter are required" });
    }

    // Query your MongoDB Verse collection
    const verses = await Verse.find({
      book_name: book,
      chapter: Number(chapter),
    })
      .sort({ verse: 1 })          // sort by verse number ascending
      .select("verse text -_id");  // return only verse number + text

    if (!verses || verses.length === 0) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    res.json(verses); // returns: [{ verse: 1, text: "In the beginning..." }, ...]

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ─── RANDOM VERSE ─────────────────────────────────────────────
app.get("/random-verse", async (req, res) => {
  try {
    const verse = await Verse.aggregate([{ $sample: { size: 1 } }]);
    if (!verse || verse.length === 0) {
      return res.status(404).json({ error: "No verses found" });
    }
    res.json(verse[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LIST GEMINI MODELS ───────────────────────────────────────
app.get("/models", async (req, res) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}` // v1beta, not v1
  );
  const data = await response.json();
  res.json(data);
});

// ─── ASK (Bible AI) ───────────────────────────────────────────
app.get("/ask", async (req, res) => {
  try {
    const { question } = req.query;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 1. Clean + extract keywords
    const cleanQuery = question.toLowerCase().replace(/[^\w\s]/gi, "");
    const keywords = cleanQuery.split(" ").filter((word) => word.length > 3);

    // 2. Text search
    let verses = await Verse.find(
      { $text: { $search: keywords.join(" ") } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    // 3. Fallback → regex
    if (verses.length === 0) {
      verses = await Verse.find({
        text: { $regex: keywords.join("|"), $options: "i" },
      }).limit(5);
    }

    // 4. Final fallback → external API
    if (verses.length === 0) {
      const fallback = await fetch(
        `https://bible-api.com/${encodeURIComponent(question)}`
      );
      const data = await fallback.json();
      verses = [
        {
          reference: data.reference || "Unknown",
          text: data.text || "No verse found",
        },
      ];
    }

    // 5. Sort by length (context ranking)
    verses = verses.sort((a, b) => b.text.length - a.text.length);

    // 6. Build context
    const context = verses.map((v) => `${v.reference}: ${v.text}`).join("\n");

    // 7. Prompt
    const prompt = `
You are a highly intelligent Bible AI Agent.

Instructions:
- Understand the question deeply
- Answer ONLY using the Bible context
- Give short and clear answer
- ALWAYS include verse reference
- If answer not found, say: "Not found in Bible context"

Bible Context:
${context}

User Question:
${question}

Final Answer:
`;

    // 8. Gemini call
   const response = await fetch(
  // ✅ CORRECT — use v1beta
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  }
);

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No answer generated";

    const confidence = verses.length > 0 ? "High" : "Low";

    res.json({
      question,
      answer,
      references: verses.map((v) => v.reference),
      confidence,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SEARCH ───────────────────────────────────────────────────
app.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const results = await Verse.find({ $text: { $search: query } }).limit(5);
    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── VERSE ────────────────────────────────────────────────────
app.get("/verse", async (req, res) => {
  try {
    const { book_name, chapter, verse } = req.query;

    const result = await Verse.findOne({
      book_name,
      chapter: Number(chapter),
      verse: Number(verse),
    });

    if (!result) {
      return res.status(404).json({ message: "Verse not found" });
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SERVER ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
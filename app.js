const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./configue/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fetch = require("node-fetch");
const User = require("./Database Models/userModels");
const Verse = require("./Database Models/verseModels");

const app = express();

app.use(express.json());

connectDB();

// Home
app.get("/", (req, res) => {
  res.send("Bible AI Backend Running 🚀");
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed
    });

    res.json({ message: "User created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ LIST MODELS (FIXED)
app.get("/models", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/ask", async (req, res) => {
  try {
    const { question } = req.query;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 🧠 1. Clean + extract keywords
    const cleanQuery = question
      .toLowerCase()
      .replace(/[^\w\s]/gi, "");

    const keywords = cleanQuery
      .split(" ")
      .filter(word => word.length > 3);

    // 🔍 2. TEXT SEARCH
    let verses = await Verse.find(
      { $text: { $search: keywords.join(" ") } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    // 🔁 3. FALLBACK → REGEX
    if (verses.length === 0) {
      verses = await Verse.find({
        text: { $regex: keywords.join("|"), $options: "i" }
      }).limit(5);
    }

    // 🌐 4. FINAL FALLBACK → API
    if (verses.length === 0) {
      const fallback = await fetch(
        `https://bible-api.com/${encodeURIComponent(question)}`
      );
      const data = await fallback.json();

      verses = [
        {
          reference: data.reference || "Unknown",
          text: data.text || "No verse found"
        }
      ];
    }

    // 🧠 5. CONTEXT RANKING
    verses = verses.sort((a, b) => b.text.length - a.text.length);

    // 📚 6. CONTEXT BUILD
    const context = verses
      .map(v => `${v.reference}: ${v.text}`)
      .join("\n");

    // 🤖 7. SUPER PROMPT
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

    // 🚀 8. GEMINI CALL
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // 🧼 9. CLEAN ANSWER
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No answer generated";

    // 📊 10. CONFIDENCE
    const confidence = verses.length > 0 ? "High" : "Low";

    res.json({
      question,
      answer,
      references: verses.map(v => v.reference),
      confidence
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔍 SEARCH
app.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    const results = await Verse.find({
      $text: { $search: query }
    }).limit(5);

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📖 VERSE
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


// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./configue/db");
require("dotenv").config();
const fetch = require("node-fetch");

const Verse = require("./Database Models/verseModels");

const app = express();

app.use(express.json());

connectDB();

// Home
app.get("/", (req, res) => {
  res.send("Bible AI Backend Running 🚀");
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


// 🔥 ASK API (FIXED)
app.get("/ask", async (req, res) => {
  try {
    const { question } = req.query;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // 🔍 DB search
    let verses = await Verse.find({
      $text: { $search: question }
    }).limit(5);

    // 👉 fallback if DB empty
    if (verses.length === 0) {
      const fallback = await fetch("https://bible-api.com/genesis%201:27");
      const data = await fallback.json();
      verses = [{ text: data.text }];
    }

    const context = verses.map(v => v.text).join("\n");

    const prompt = `
You are a Bible expert AI.
Answer ONLY using the Bible context below.
If answer is not clearly present, say "Not found in Bible context".

Context:
${context}

Question:
${question}
    `;

    // ✅ CORRECT MODEL
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("Gemini Response:", data);

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer generated";

    res.json({
      question,
      answer,
      verses,
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
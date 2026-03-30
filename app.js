const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./configue/db");
const verse = require("./Database Models/verseModels");

const app = express();

// Middleware
app.use(express.json());

// 🔌 MongoDB Connection
connectDB();

// 🏠 Home Route
app.get("/", (req, res) => {
  res.send("Bible AI Backend Running 🚀");
});


// 🔍 SEARCH API (important)
app.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Query required" });
    }

    const verses = await Verse.find({
      text: { $regex: query, $options: "i" }
    }).limit(10);
    console.log(Verse);
    res.json({
      count: verses.length,
      data: verses
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/search", async (req, res) => {
  const { query } = req.query;

  const verses = await Verse.find({
    text: { $regex: query, $options: "i" }
  }).limit(10);

  res.json(verses);
});

// 📖 Get verse by reference (Genesis 1:1 type)
app.get("/verse", async (req, res) => {
  try {
    const { book, chapter, verse } = req.query;

    const result = await Verse.findOne({
      book,
      chapter: Number(chapter),
      verse: Number(verse)
    });

    if (!result) {
      return res.status(404).json({ message: "Verse not found" });
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🚀 Server start
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
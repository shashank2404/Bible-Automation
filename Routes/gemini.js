const express = require("express");
const router  = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TOTAL_VERSES   = 10;

router.post("/gemini/verses", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: "topic required" });

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not set on server" });
    }

    const prompt = `You are a Bible scholar. Give me exactly ${TOTAL_VERSES} Bible verses on the topic: "${topic}".

For each verse provide:
- ref: exact Bible reference (e.g. "John 3:16")
- text: full verse text in NIV translation
- reflection: 1-2 sentence personal reflection prompt for the reader

Reply ONLY with valid JSON — no markdown, no explanation, no backticks:
{"verses":[{"ref":"...","text":"...","reflection":"..."}]}`;

    const geminiRes = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents:         [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({
        error: errBody?.error?.message || `Gemini error ${geminiRes.status}`,
      });
    }

    const data   = await geminiRes.json();
    const raw    = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean  = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed.verses) || parsed.verses.length === 0) {
      return res.status(500).json({ error: "Gemini returned no verses" });
    }

    res.json({ verses: parsed.verses });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
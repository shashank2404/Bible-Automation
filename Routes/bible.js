const express = require("express");
const router  = express.Router();
const jwt     = require("jsonwebtoken");
const User    = require("../Database Models/userModels"); // ← fix: was 'userModels'

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// ── Auth middleware ──────────────────────────────────────
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ── Verse Bookmarks ──────────────────────────────────────

// GET all verse bookmarks  ← was missing entirely
router.get("/bookmarks/verses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("verseBookmarks");
    res.json(user.verseBookmarks || []); // ← fallback to empty array
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST toggle verse bookmark
router.post("/bookmarks/verses/toggle", auth, async (req, res) => {
  try {
    const { book, chapter, verse, verseText } = req.body;
    if (!book || !chapter || !verse)
      return res.status(400).json({ error: "book, chapter, verse required" });

    const user   = await User.findById(req.userId);
    const exists = user.verseBookmarks.find(
      b => b.book === book && b.chapter === chapter && b.verse === verse
    );

    if (exists) {
      await User.findByIdAndUpdate(req.userId, {
        $pull: { verseBookmarks: { book, chapter, verse } }
      });
      return res.json({ bookmarked: false }); // ← was missing bookmarked: false
    } else {
      await User.findByIdAndUpdate(req.userId, {
        $push: { verseBookmarks: { book, chapter, verse, verseText: verseText || "" } }
      });
      return res.json({ bookmarked: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Chapter Bookmarks ────────────────────────────────────
router.get("/bookmarks/chapters", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("chapterBookmarks");
    res.json(user.chapterBookmarks || []); // ← fallback to empty array
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/bookmarks/chapters/toggle", auth, async (req, res) => {
  try {
    const { book, chapter } = req.body;
    if (!book || !chapter)
      return res.status(400).json({ error: "book and chapter required" });

    const user   = await User.findById(req.userId);
    const exists = user.chapterBookmarks.find(
      b => b.book === book && b.chapter === chapter
    );

    if (exists) {
      await User.findByIdAndUpdate(req.userId, {
        $pull: { chapterBookmarks: { book, chapter } }
      });
      return res.json({ bookmarked: false });
    } else {
      await User.findByIdAndUpdate(req.userId, {
        $push: { chapterBookmarks: { book, chapter } }
      });
      return res.json({ bookmarked: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Notes ────────────────────────────────────────────────

router.get("/notes", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("notes");
    res.json(user.notes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/notes/:book/:chapter/:verse", auth, async (req, res) => {
  try {
    const { book, chapter, verse } = req.params;
    const user = await User.findById(req.userId).select("notes");
    const note = user.notes.find(
      n => n.book === book &&
           n.chapter === Number(chapter) &&
           n.verse   === Number(verse)
    );
    res.json(note || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post("/notes", auth, async (req, res) => {
  try {
    // ← fix: hlColorId and textStyleId were missing from destructure
    const { book, chapter, verse, verseText, noteText, hlColorId, textStyleId } = req.body;
    if (!book || !chapter || !verse || !noteText)
      return res.status(400).json({ error: "book, chapter, verse, noteText required" });

    const user = await User.findById(req.userId);
    const idx  = user.notes.findIndex(
      n => n.book === book && n.chapter === chapter && n.verse === verse
    );

    if (idx > -1) {
      user.notes[idx].noteText    = noteText;
      user.notes[idx].verseText   = verseText   || user.notes[idx].verseText;
      user.notes[idx].hlColorId   = hlColorId   || user.notes[idx].hlColorId;
      user.notes[idx].textStyleId = textStyleId || user.notes[idx].textStyleId;
      user.notes[idx].updatedAt   = new Date();
    } else {
      user.notes.push({
        book, chapter, verse,
        verseText:   verseText   || "",
        noteText,
        hlColorId:   hlColorId   || "gold",
        textStyleId: textStyleId || "normal",
      });
    }

    await user.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/notes/:book/:chapter/:verse", auth, async (req, res) => {
  try {
    const { book, chapter, verse } = req.params;
    await User.findByIdAndUpdate(req.userId, {
      $pull: { notes: { book, chapter: Number(chapter), verse: Number(verse) } }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
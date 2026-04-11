const mongoose = require("mongoose");

const verseBookmarkSchema = new mongoose.Schema({
  book:      { type: String, required: true },
  chapter:   { type: Number, required: true },
  verse:     { type: Number, required: true },
  verseText: { type: String, default: "" },
  addedAt:   { type: Date, default: Date.now },
}, { _id: true });

const chapterBookmarkSchema = new mongoose.Schema({
  book:    { type: String, required: true },
  chapter: { type: Number, required: true },
  addedAt: { type: Date, default: Date.now },
}, { _id: true });

const noteSchema = new mongoose.Schema({
  book:        { type: String, required: true },
  chapter:     { type: Number, required: true },
  verse:       { type: Number, required: true },
  verseText:   { type: String, default: "" },
  noteText:    { type: String, required: true },
  hlColorId:   { type: String, default: "gold" },   // ← add
  textStyleId: { type: String, default: "normal" },  // ← add
  updatedAt:   { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  onboarding: {
    denomination:  { type: String, default: "" },
    bibleVersion:  { type: String, default: "" },
    ageGroup:      { type: String, default: "" },
    gender:        { type: String, default: "" },
    notifications: { type: [String], default: [] },
    completed:     { type: Boolean, default: false },
  },

  verseBookmarks:   { type: [verseBookmarkSchema],   default: [] },
  chapterBookmarks: { type: [chapterBookmarkSchema], default: [] },
  notes:            { type: [noteSchema],            default: [] },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const verseSchema = new mongoose.Schema({
  verse_id: {
    type: Number, 
    required: true,
    unique: true
  },

  book_name: {
    type: String,
    required: true,
    index: true
  },

  book_number: {
    type: Number,
    required: true
  },

  chapter: {
    type: Number,
    required: true,
    index: true
  },

  verse: {
    type: Number,
    required: true
  },

  reference: {
    type: String,
    required: true
  },

  text: {
    type: String,
    required: true,
    index: "text" // 🔥 full-text search
  },

  tags: {
    type: [String],
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Verse", verseSchema);
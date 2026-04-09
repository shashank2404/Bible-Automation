// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Onboarding fields
  onboarding: {
    denomination:  { type: String, default: "" },
    bibleVersion:  { type: String, default: "" },
    ageGroup:      { type: String, default: "" },
    gender:        { type: String, default: "" },
    notifications: { type: [String], default: [] },
    completed:     { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
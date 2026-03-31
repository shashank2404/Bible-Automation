const mongoose = require("mongoose");
const fs = require("fs");
const Verse = require("../Database Models/verseModels");
const path = require("path");
// connect DB
mongoose.connect("mongodb://127.0.0.1:27017/bibleDB")
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

// load JSON

const data = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../Dataset/bible_flat.json"),
    "utf-8"
  )
);

async function importData() {
  try {
    console.log("Importing data...");

    await Verse.deleteMany(); // clear old
    await Verse.insertMany(data);

    console.log("🔥 Data Imported Successfully");
    process.exit();
  } catch (err) {
    console.log("❌ Error:", err);
    process.exit(1);
  }
}

importData();
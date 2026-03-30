const mongoose = require("mongoose");
const fs = require("fs");
const Verse = require("./models/verseModel");

// connect DB
mongoose.connect("mongodb://127.0.0.1:27017/bibleDB")
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));

// load JSON
const data = JSON.parse(fs.readFileSync("./data/bible.json", "utf-8"));

async function importData() {
  try {
    await Verse.deleteMany(); // optional (clean old)
    await Verse.insertMany(data);

    console.log("🔥 Data Imported Successfully");
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

importData();
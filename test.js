require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  const uri = process.env.MONGO_URI;

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    const Book = mongoose.model(
      "Book",
      new mongoose.Schema({}, { strict: false })
    );

    const booksAsc = await Book.find().sort({ price: 1 }).limit(6);
    console.log("\n--- price ASC ---");
    booksAsc.forEach((b) => console.log(`${b.title} - ${b.price}`));

    const booksDesc = await Book.find().sort({ price: -1 }).limit(6);
    console.log("\n--- price DESC ---");
    booksDesc.forEach((b) => console.log(`${b.title} - ${b.price}`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Error running sort test:", err);
    process.exit(1);
  }
})();

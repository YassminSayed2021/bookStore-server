// middleware/upload.js
const multer = require("multer");
const storage = multer.memoryStorage(); // store file in memory
module.exports = multer({ storage });

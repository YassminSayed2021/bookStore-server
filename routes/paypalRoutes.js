const express = require("express");
const router = express.Router();
const { createOrder , captureOrder} = require("../controllers/paypalController");
const { verifyToken } = require("../middlewares/verifyToken");

router.get ('/capture', captureOrder);  

router.post("/create", verifyToken,createOrder);

module.exports = router;

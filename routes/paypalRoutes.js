const express = require("express");
const router = express.Router();
const { createOrder } = require("../controllers/paypalController");
const { verifyToken } = require("../middlewares/verifyToken");


router.post("/create-paypal-order", verifyToken,createOrder);

module.exports = router;

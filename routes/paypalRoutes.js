const express = require("express");
const router = express.Router();
const { createPaypalOrder,capturePaypalOrder } = require("../controllers/paypalController");
const { verifyToken } = require("../middlewares/verifyToken");

router.post('/create', verifyToken, createPaypalOrder);   // POST /api/paypal/create
router.post('/capture', verifyToken, capturePaypalOrder); // POST /api/paypal/capture

//router.post("/create-paypal-order", verifyToken,createOrder);

module.exports = router;

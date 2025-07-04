// const express = require('express');
// const router = express.Router();
// const paymentController = require('../controllers/paymentStripeController');
// const authMiddleware = require('../middlewares/payValidation'); 

// router.post('/checkout/confirm' ,authMiddleware, paymentController.confirmPayment);

// module.exports = router;
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentStripeController");
const authMiddleware = require("../middlewares/payValidation");

router.post("/checkout", authMiddleware, paymentController.createCheckout);
router.post("/checkout/confirm", authMiddleware, paymentController.confirmPayment);

module.exports = router;
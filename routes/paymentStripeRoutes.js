

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentStripeController");
const authMiddleware = require("../middlewares/payValidation");
// "router.post('/cancel', authMiddleware, paymentController.cancelOrder);"
/**
 * @swagger
 * /api/v1/payment/checkout:
 *   post:
 *     summary: Create a Stripe checkout session
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post("/checkout", authMiddleware, paymentController.createCheckout);

/**
 * @swagger
 * /api/v1/payment/checkout/confirm:
 *   post:
 *     summary: Confirm Stripe payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
router.post(
  "/checkout/confirm",
  authMiddleware,
  paymentController.confirmPayment
);

// Uncomment when needed:
/**
 * @swagger
 * /api/v1/payment/cancel:
 *   post:
 *     summary: Cancel the order
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */
// router.post('/cancel', authMiddleware, paymentController.cancelOrder);

module.exports = router;

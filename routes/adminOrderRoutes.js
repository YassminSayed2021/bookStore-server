const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/verifyToken");
const { admin } = require("../middlewares/admin");

// Admin order routes - all protected by verifyToken and admin middleware
router.get("/", verifyToken, admin, orderController.getAllOrders);
router.get("/recent", verifyToken, admin, orderController.getRecentOrders);
router.get("/:id", verifyToken, admin, orderController.getOrderById);
router.patch("/:id", verifyToken, admin, orderController.updateOrderStatus);
router.delete("/:id", verifyToken, admin, orderController.deleteOrder);

module.exports = router;
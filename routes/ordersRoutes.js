const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middlewares/verifyToken");

router.post("/place-order", verifyToken,orderController.placeOrder);


module.exports = router;
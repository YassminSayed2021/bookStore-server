const {client} = require("../config/paypalClient");
const paypal = require('@paypal/checkout-server-sdk');


const Order = require("../models/ordersModel");

const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: "failure",
        message: "Order not found",
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: order.totalPrice.toFixed(2), 
          },
        },
      ],
    });

    const paypalClient = client();
    const response = await paypalClient.execute(request);

    res.status(200).json({
      id: response.result.id,
      approvalUrl: response.result.links.find(link => link.rel === "approve")?.href,
    });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "PayPal order creation failed",
      error: err.message,
    });
  }
};

module.exports = { createOrder };
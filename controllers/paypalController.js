// const {client} = require("../config/paypalClient");
// const paypal = require('@paypal/checkout-server-sdk');


// const Order = require("../models/ordersModel");

// const createOrder = async (req, res) => {
//   try {
//     const { orderId } = req.body;

//     const order = await Order.findById(orderId);
//     if (!order) {
//       return res.status(404).json({
//         status: "failure",
//         message: "Order not found",
//       });
//     }

//     const request = new paypal.orders.OrdersCreateRequest();
//     request.prefer("return=representation");
//     request.requestBody({
//       intent: "CAPTURE",
//       purchase_units: [
//         {
//           amount: {
//             currency_code: "USD",
//             value: order.totalPrice.toFixed(2), 
//           },
//         },
//       ],
//     });

//     const paypalClient = client();
//     const response = await paypalClient.execute(request);

//     res.status(200).json({
//       id: response.result.id,
//       approvalUrl: response.result.links.find(link => link.rel === "approve")?.href,
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "failure",
//       message: "PayPal order creation failed",
//       error: err.message,
//     });
//   }
// };

// module.exports = { createOrder };

// controllers/paypalController.js
const paypal = require('@paypal/checkout-server-sdk');
const { client } = require('../config/paypalClient');
const Order = require('../models/ordersModel');

exports.createPaypalOrder = async (req, res) => {
  try {
    const { orderId } = req.body;              
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ status: 'fail', message: 'Order not found' });
    if (order.status !== 'pending')
      return res.status(400).json({ status: 'fail', message: 'Order already processed' });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId.toString(),         
          amount: {
            currency_code: 'USD',
            value: order.totalPrice.toFixed(2),
          },
        },
      ],
    });

    const response = await client().execute(request);

    return res.status(200).json({
      status: 'success',
      paypalOrderId: response.result.id,
      approvalUrl: response.result.links.find((l) => l.rel === 'approve')?.href,
    });
  } catch (err) {
    console.error('PayPal create error:', err);
    res.status(500).json({ status: 'fail', message: 'PayPal create failed', error: err.message });
  }
};
exports.capturePaypalOrder = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;         

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const capture = await client().execute(request);

    const internalOrderId = capture.result.purchase_units[0].reference_id;

    const updated = await Order.findByIdAndUpdate(
      internalOrderId,
      { status: 'delivered' },                    
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ status: 'fail', message: 'Internal order not found' });

    // await PaymentConfirmationEmail(updated.user.email, ...);

    res.status(200).json({
      status: 'success',
      message: 'Payment captured',
      data: updated,
    });
  } catch (err) {
    console.error('PayPal capture error:', err);
    res.status(500).json({ status: 'fail', message: 'Capture failed', error: err.message });
  }
};

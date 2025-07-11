const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mailSender = require('../utils/mailSender');


const orderSchema = mongoose.Schema({
      user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

books: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      language: {
        type: String,
        required: true, 
        enum: ['ar', 'en', 'fr'], 
        default: 'ar'
      }
    }
  ],

    totalPrice: {
    type: Number,
    required: true,
    min: 0
  },


    status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    required: false 
  },
statusHistory: [
    {
      status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      refundStatus: {
        type: String,
        enum: ['none', 'pending', 'completed'],
        default: 'none'
      }
    }
  ]
}, { timestamps: true });

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;
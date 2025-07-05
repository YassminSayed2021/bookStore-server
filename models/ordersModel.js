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
      price: {
  type: Number,
  required: true
},
language: {
  type: String,
  enum: ['en', 'ar', 'fr'],
  required: true
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
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }


},{timestamps:true});

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;
const cart = require("../models/cartModel");

exports.viewCart = (req, res) => {
  res.status(200).json({
    status: "success",
    results: cart.length,
    data: { cart },
  });
};

//===========================================

exports.addToCart = (req, res) => {
  const quantity = req.body.quantity || 1;
  const itemId = req.body.id;
  const existingItem = cart.find((item) => item.id === itemId);

  if (existingItem) {
    const newTotalQuantity = existingItem.quantity + quantity;

    const isAvailable = checkStockAvailability(existingItem, newTotalQuantity);
    if (!isAvailable) {
      return res.status(400).json({
        status: "fail",
        message: `Only ${existingItem.stock} items in stock.`,
      });
    }

    existingItem.quantity = newTotalQuantity;

    return res.status(201).json({
      status: "success",
      message: "Quantity updated in cart",
      data: { cart },
    });
  }

  const isAvailable = checkStockAvailability(req.body, quantity);
  if (!isAvailable) {
    return res.status(400).json({
      status: "fail",
      message: `Only ${req.body.stock} items in stock.`,
    });
  }

  const newCartItem = Object.assign({}, req.body, { quantity });
  cart.push(newCartItem);

  return res.status(201).json({
    status: "success",
    message: "Item added to cart",
    data: { cart },
  });
};

const checkStockAvailability = (item, quantityToAdd) => {
  return quantityToAdd <= item.stock;
};

//===========================================

exports.removeFromCart = (req, res) => {
  const itemId = req.params.id * 1;

  const index = cart.findIndex((item) => item.id === itemId);

  if (index === -1) {
    return res.status(404).json({
      status: "fail",
      message: "Item not found in cart",
    });
  }

  cart.splice(index, 1);
  res.status(200).json({
    status: "success",
    message: "Item removed from cart",
    data: { cart },
  });
};

//===========================================

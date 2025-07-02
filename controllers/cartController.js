const jwt = require("jsonwebtoken");
const CartItem = require("../models/cartModel");
const Book = require("../models/booksModel");

const getUserIdFromToken = (authHeader) => {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.TOKEN_SECRET).id;
  } catch {
    return null;
  }
};

// =====================================
exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity, language } = req.body;
    const qty = parseInt(quantity, 10) || 1;
    const lang = language || "en";

    if (!bookId) {
      return res.status(400).json({
        status: "fail",
        message: "Book ID is required.",
      });
    }

    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        status: "fail",
        message: "Book not found.",
      });
    }

    const stock = book.stock?.[lang];
    if (stock === undefined) {
      return res.status(400).json({
        status: "fail",
        message: `Language '${lang}' not available.`,
      });
    }

    if (qty > stock) {
      return res.status(400).json({
        status: "fail",
        message: `Only ${stock} items in stock.`,
      });
    }

    const existing = await CartItem.findOne({
      book: bookId,
      user: userId,
      language: lang,
    });

    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > stock) {
        return res.status(400).json({
          status: "fail",
          message: `Only ${stock} in stock.`,
        });
      }
      existing.quantity = newQty;
      await existing.save();
    } else {
      await CartItem.create({
        book: bookId,
        quantity: qty,
        language: lang,
        user: userId,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Added to your cart!",
      data: {
        book,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// =====================================
exports.viewCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
    }

    const cartItems = await CartItem.find({ user: userId }).populate("book");
    const formatted = cartItems.map((item) => ({
      id: item._id,
      bookId: item.book._id,
      title: item.book.title,
      price: item.book.price,
      image: item.book.image,
      language: item.language,
      quantity: item.quantity,
    }));

    return res.status(200).json({
      status: "success",
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// =====================================
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
    }

    const item = await CartItem.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "Item not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Item removed.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// =====================================
exports.clearCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      return res.status(401).json({
        status: "fail",
        message: "Authentication required.",
      });
    }

    await CartItem.deleteMany({ user: userId });

    res.status(200).json({
      status: "success",
      message: "Your cart has been cleared.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

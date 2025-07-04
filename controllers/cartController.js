const CartItem = require("../models/cartModel");
const Book = require("../models/booksModel");

// =====================================
exports.addToCart = async (req, res) => {
  try {
    const { bookId, quantity, language } = req.body;
    const qty = parseInt(quantity, 10) || 1;
    const lang = language || "en";
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({
        status: "fail",
        message: "Book ID is required.",
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
      message: "Added to cart!",
      data: { book },
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
    const userId = req.user.id;

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

    res.status(200).json({
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
    const userId = req.user.id;

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
    const userId = req.user.id;

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

// =====================================
exports.updateCartQuantity = async (req, res) => {
  try {
    const { id, quantity } = req.body;
    const userId = req.user.id;

    if (!id || typeof quantity !== "number") {
      return res.status(400).json({
        status: "fail",
        message: "Cart item ID and valid quantity are required.",
      });
    }

    const item = await CartItem.findOne({ _id: id, user: userId }).populate(
      "book"
    );

    if (!item) {
      return res.status(404).json({
        status: "fail",
        message: "Cart item not found.",
      });
    }

    const book = item.book;
    const lang = item.language;
    const stock = book.stock?.[lang];

    if (stock === undefined) {
      return res.status(400).json({
        status: "fail",
        message: `Language '${lang}' not available for this book.`,
      });
    }

    if (quantity <= 0) {
      await CartItem.findByIdAndDelete(id);
      return res.status(200).json({
        status: "success",
        message: "Item removed from cart (quantity was 0 or less).",
      });
    }

    if (quantity > stock) {
      return res.status(400).json({
        status: "fail",
        message: `Only ${stock} items available in stock.`,
      });
    }

    item.quantity = quantity;
    await item.save();

    res.status(200).json({
      status: "success",
      message: "Cart item quantity updated.",
      data: {
        id: item._id,
        bookId: book._id,
        quantity: item.quantity,
        maxAvailable: stock,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

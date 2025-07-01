const jwt = require("jsonwebtoken");
const CartItem = require("../models/cartModel");
const Book = require("../models/booksModel");

// Helper: Extract user ID from token
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
    const book = await Book.findById(bookId).lean();

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

    // Logged-in: Save to DB
    if (userId) {
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
    }
    // Guest: Save to session
    else {
      req.session.cart = req.session.cart || [];
      const existingItemIndex = req.session.cart.findIndex(
        (item) => item.bookId === bookId && item.language === lang
      );

      if (existingItemIndex !== -1) {
        const newQty = req.session.cart[existingItemIndex].quantity + qty;
        if (newQty > stock) {
          return res.status(400).json({
            status: "fail",
            message: `Only ${stock} in stock.`,
          });
        }
        req.session.cart[existingItemIndex].quantity = newQty;
      } else {
        req.session.cart.push({
          bookId,
          quantity: qty,
          language: lang,
          addedAt: new Date(),
        });
      }
    }

    res.status(200).json({
      status: "success",
      message: userId ? "Added to your cart!" : "Added to guest cart.",
      data: {
        bookId: book._id,
        title: book.title,
        price: book.price,
        image: book.image,
        language: lang,
        quantity: qty,
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

    // Logged-in: Fetch from DB
    if (userId) {
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
    }

    // Guest: Fetch from session
    const guestCart = req.session.cart || [];
    const books = await Book.find({
      _id: { $in: guestCart.map((item) => item.bookId) },
    }).lean();

    const formatted = guestCart
      .map((item) => {
        const book = books.find((b) => b._id.toString() === item.bookId);
        return book
          ? {
              id: `${item.bookId}-${item.language}`,
              bookId: item.bookId,
              title: book.title,
              price: book.price,
              image: book.image,
              language: item.language,
              quantity: item.quantity,
            }
          : null;
      })
      .filter(Boolean);

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
    const { id } = req.body; // from body now
    const userId = getUserIdFromToken(req.headers.authorization);

    if (userId) {
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
    } else {
      if (!req.session.cart) {
        return res.status(404).json({
          status: "fail",
          message: "Cart is empty.",
        });
      }

      const [bookId, lang] = id.split("-");
      req.session.cart = req.session.cart.filter(
        (item) => !(item.bookId === bookId && item.language === lang)
      );
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
exports.mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const guestCart = req.session.cart || [];

    if (guestCart.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No guest items to merge.",
      });
    }

    for (const item of guestCart) {
      const book = await Book.findById(item.bookId);
      if (!book) continue;

      const stock = book.stock?.[item.language] || 0;
      const existing = await CartItem.findOne({
        book: item.bookId,
        user: userId,
        language: item.language,
      });

      if (existing) {
        existing.quantity = Math.min(existing.quantity + item.quantity, stock);
        await existing.save();
      } else if (stock > 0) {
        await CartItem.create({
          book: item.bookId,
          quantity: Math.min(item.quantity, stock),
          language: item.language,
          user: userId,
        });
      }
    }

    req.session.cart = [];
    res.status(200).json({
      status: "success",
      message: "Cart merged successfully.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

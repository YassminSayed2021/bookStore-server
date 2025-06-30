const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    author: {
      type: String,
    },

    authorDescription: {
      type: String,
    },

    type: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
    },

    stock: {
      type: Number,
      default: 0,
    },

    languages: {
      type: [String],
    },

    image: {
      type: [String],
    },

    discount: {
      type: Number,
      default: 0,
    },

    slug: {
      type: String,
      unique: true,
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model("Product", productSchema, "books");
module.exports = Product;

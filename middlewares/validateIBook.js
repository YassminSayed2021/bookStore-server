const validateBook = (req, res, next) => {
  const requiredFields = [
    "id",
    "title",
    "vendor",
    "format",
    "language",
    "publicationDate",
    "price",
    "image",
    "stock",
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      !(field in req.body) ||
      req.body[field] === null ||
      req.body[field] === undefined
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: `Missing or invalid fields: ${missingFields.join(", ")}`,
    });
  }

  next();
};

module.exports = { validateBook };

const admin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      status: "Failure",
      message: "Access denied. Admins only.",
    });
  }

  next(); 
};

module.exports = {admin};

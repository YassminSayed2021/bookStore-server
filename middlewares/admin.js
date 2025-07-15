const admin = (req, res, next) => {
  console.log("🔍 Admin middleware - User:", req.user);
  console.log("🔍 Admin middleware - User role:", req.user?.role);
  
  if (!req.user) {
    console.log("❌ Admin middleware - No user object found");
    return res.status(401).json({
      status: "Failure",
      message: "Unauthorized: User not authenticated",
    });
  }
  
  if (req.user?.role !== "admin") {
    console.log("❌ Admin middleware - User is not an admin:", req.user?.role);
    return res.status(403).json({
      status: "Failure",
      message: "Access denied. Admins only.",
    });
  }

  console.log("✅ Admin middleware - Access granted for admin user");
  next(); 
};

module.exports = {admin};

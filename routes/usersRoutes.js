const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController")
const {verifyToken} = require("../middlewares/verifyToken");
const {admin} = require("../middlewares/admin");
const {user} = require ("../middlewares/user")
const { firstNameValidation,lastNameValidation, oldpasswordValidation, newpasswordValidation} = require("../middlewares/authValidation");

// Admin routes
router.get("/", verifyToken, admin, usersController.getAllUsers);
router.get("/:id", verifyToken, admin, usersController.getUserById);
router.patch("/:id", verifyToken, admin, usersController.updateUser);
router.delete("/:id", verifyToken, admin, usersController.deleteUser);

// User profile routes
router.get("/myprofile", verifyToken, usersController.getmyProfile);
router.patch("/myprofile", verifyToken, firstNameValidation.optional(), lastNameValidation, oldpasswordValidation, newpasswordValidation, usersController.updatemyProfile);

module.exports = router;

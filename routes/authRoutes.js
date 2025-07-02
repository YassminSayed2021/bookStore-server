require("dotenv").config();

const { Router } = require("express");

const router = Router();

const { User } = require("../models/usersModel");

const authController = require("../controllers/authController");

const {
  emailValidation,
  passwordValidation,
  firstNameValidation,
  lastNameValidation,
  passwordConfirm,
  emailloginValidation,
  newpasswordValidation,
} = require("../middlewares/authValidation");

//register
router.post(
  "/register",
  firstNameValidation,
  lastNameValidation,
  emailValidation,
  passwordValidation,
  passwordConfirm,
  authController.register
);

//login
router.post("/login", emailloginValidation, authController.login);

router.post("/googleLogin", authController.googleLogin);

router.post("/requestPasswordReset", authController.requestPasswordReset);

router.post(
  "/resetPassword",
  newpasswordValidation,
  authController.resetPassword
);

module.exports = router;

const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController")
const {verifyToken} = require("../middlewares/verifyToken");
const {admin} = require("../middlewares/admin");
const {user} = require ("../middlewares/user")
const { firstNameValidation,lastNameValidation, oldpasswordValidation, newpasswordValidation} = require("../middlewares/authValidation");



//router.post("/", createUser);

router.get("/", verifyToken,admin,usersController.getAllUsers);
router.get("/myprofile",verifyToken,usersController.getmyProfile);
router.patch("/myprofile",verifyToken,firstNameValidation,lastNameValidation,oldpasswordValidation,newpasswordValidation,usersController.updatemyProfile);



module.exports = router;

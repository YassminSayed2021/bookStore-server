const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController")
const {verifyToken} = require("../middlewares/verifyToken");
const {admin} = require("../middlewares/admin");
const {user} = require ("../middlewares/user")


//router.post("/", createUser);

router.get("/", verifyToken,admin,usersController.getAllUsers);



module.exports = router;

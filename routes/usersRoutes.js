const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController")
const verifyToken = require("../middlewares/redirectto");


//router.post("/", createUser);

router.get("/", verifyToken,usersController.getAllUsers);



module.exports = router;

 require('dotenv').config(); 
 const User = require("../models/usersModel");
 const bcrypt = require("bcrypt");
 const { validationResult } = require("express-validator");


const getAllUsers = async (req, res) => {
  const users = await User.find({}, { name: 1, email: 1 });

  res.status(200).json({
    status: "Success",
    message: "Users fetched successfully",
    data: users,
  });
};

const getmyProfile = async(req,res)=>{
try{
const email = req.user.email;
const user = await User.findOne({ email }).select("-password");


 if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      status: "Success",
      message: "User profile loaded",
      data: user,
    });
}catch(err){
      res.status(500).json({
      status: "Failure",
      message: "Internal server error",
    });
}
}

const updatemyProfile = async(req,res)=>{
try{
const email = req.user.email;
const updates = req.body;
const user = await User.findOne({email});
const errors = validationResult(req);

if(!errors.isEmpty()){
    return res.status(400).json({
            status: "Failure",
       // message: errors.array(),
                      message: errors.array()[0].msg


    });
} 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

        if (updates.firstName) user.firstName = updates.firstName;
        // if (updates.lastName) user.lastName = updates.lastName;
if (updates.hasOwnProperty("lastName")) {
  if (updates.lastName === "") {
    user.lastName = undefined;
  } else {
    user.lastName = updates.lastName;
  }
}

if (updates.newPassword) {

  if (!updates.oldPassword) {
    return res.status(400).json({ message: "Old password is required to set a new password" });
  }

  const isMatch = await bcrypt.compare(updates.oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  user.password = await bcrypt.hash(updates.newPassword, salt);
}


        if (updates.email && updates.email !== email) {
      return res.status(400).json({ message: "Email change not allowed" });
    }

    await user.save();

        res.status(200).json({
      status: "Success",
      message: "Profile updated successfully",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });


}catch(err){
        res.status(500).json({
      status: "Failure",
      message: "Internal server error",
    });

}
}

 module.exports = {getAllUsers,getmyProfile,updatemyProfile};
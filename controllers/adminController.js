require('dotenv').config(); 
 const User = require("../models/usersModel");
 const bcrypt = require("bcrypt");
 const { validationResult } = require("express-validator");


const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Count total users for pagination
    const totalUsers = await User.countDocuments();
    
    // Get users with pagination
    const users = await User.find()
      .select('firstName lastName email role createdAt updatedAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "Success",
      message: "Users fetched successfully",
      page,
      totalPages: Math.ceil(totalUsers / limit),
      totalItems: totalUsers,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Error fetching users",
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: "Failure",
        message: "User not found"
      });
    }
    
    res.status(200).json({
      status: "Success",
      data: user
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Error fetching user",
      error: error.message
    });
  }
};

// Update user (admin)
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: "Failure",
        message: "User not found"
      });
    }
    
    // Update fields
    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.hasOwnProperty('lastName')) {
      user.lastName = updates.lastName || undefined;
    }
    if (updates.role && ['user', 'admin'].includes(updates.role)) {
      user.role = updates.role;
    }
    
    await user.save();
    
    res.status(200).json({
      status: "Success",
      message: "User updated successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Error updating user",
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        status: "Failure",
        message: "User not found"
      });
    }
    
    res.status(200).json({
      status: "Success",
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "Failure",
      message: "Error deleting user",
      error: error.message
    });
  }
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

 module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getmyProfile,
  updatemyProfile
};
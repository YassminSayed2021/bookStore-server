// const User = require("../models/usersModel");


// const createUser = async (req, res) => {
//   try {
//     const { body } = req;
//     if (!body.name || !body.email || !body.password) {
//       return res.status(400).json({
//         status: "Failure",
//         message: "there is some missing data",
//       });
//     }

//     const user = await User.create({
//       name: body.name,
//       email: body.email,
//       password: body.password,
//     });

//     res.status(201).json({
//       status: "Success",
//       message: "User created successfully",
//       data: user,
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "Failure",
//       message: "Internal server error",
//     });
//   }
// };

// module.exports = {createUser}
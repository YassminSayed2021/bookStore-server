const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['user','admin'],
        default: 'user'
    }
},{timestamps:true});

const User = mongoose.model("User",userSchema);

module.exports = User;
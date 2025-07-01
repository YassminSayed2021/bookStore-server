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
        required: function () {
    return !this.isGoogleUser;
        }
    },
    role:{
        type: String,
        enum: ['user','admin','guest'],
        default: 'user'
    },
    isGoogleUser: {
  type: Boolean,
  default: false
}

},{timestamps:true});

const User = mongoose.model("User",userSchema);

module.exports = User;
const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
    title :{
        type: String,
        required: true 
    },
    
    author:{
         type: String
    },
    price:{
        type: Number,
        required: true,
        min: 0
    },
    description:{
         type: String
    },
    stock:{
        type: Number,
        default: 0
    },
    image:{
        type:String
    },
    reviews:[{
type: mongoose.Schema.Types.ObjectId,
ref:'Review'
    }],

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true 
 }

    
}, { timestamps: true });

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
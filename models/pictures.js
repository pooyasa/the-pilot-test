const mongoose = require("mongoose");

const picturesSchema =  mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    number : {
        type: Number,
        required: true
    },
} , { collection: 'pictures' });

module.exports = mongoose.model('pictures' , picturesSchema);

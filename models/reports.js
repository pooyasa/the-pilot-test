const mongoose = require("mongoose");

const reportsSchema =  mongoose.Schema({
    gender: {
        type: String,
        required: true
    },
    age : {
        type: String,
        required: true
    },
    education : {
        type: Number,
        required: true
    },
    disorder : {
        type: Number,
        required: true
    },
    medCond: {
        type: Number,
        required: true
    },    
    result: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
    ip: {
        type: String
    }
} , { collection: 'reports' });

module.exports = mongoose.model('reports' , reportsSchema);

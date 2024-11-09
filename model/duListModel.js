const mongoose = require("mongoose");
const { Schema } = mongoose;


const duListSchema = new Schema({
    duNumber: {
        type: String, 
        required: true
    },
    displayNumber: {
        type: [String], 
        required: true
    }
    
});

const duList = mongoose.model("duList",duListSchema);
module.exports = duList
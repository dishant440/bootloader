const mongoose = require("mongoose");
const { Schema } = mongoose;

const duMapSchema = new Schema({
    serviceEngineerName:{
      type:String,
      required:true
    },
    serviceEngineerEmail: {
        type: String,
        required: true,
      },
      duNumber: {
        type: String,
        required: true,
      },
      displayNumber :{
        type:String,
        required:true
      },
      model: {
        type: String,
        required: true,
      },
      fileName:{
        type:String,
        required:true
      },
      fileId:{
        type:String
      },
      dateOfCreation: {   // Add the new field here
        type: Date,
        default: Date.now // Optional: Set a default value
    }
})

const DUMap = mongoose.model('duMap',duMapSchema);
module.exports = DUMap

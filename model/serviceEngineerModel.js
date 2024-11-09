const mongoose = require("mongoose");
const { Schema } = mongoose;

const serviceEngineer = new Schema({

name:{
    type:String,
    required:true
},

email:{
    type:String,
    required:true,
},

phoneNo:{
  type:Number,
  required:true
},

password:{
  type:String,
  required:true
},

employId:{
    type:String,
},
dateOfCreation: {
    type: Date,
    default: Date.now,
},

});
const  ServiceEngineer = mongoose.model("ServiceEngineer", serviceEngineer);
module.exports = ServiceEngineer;



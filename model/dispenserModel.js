const mongoose = require('mongoose');

// Define the schema for the dispenser model
const dispenserSchema = new mongoose.Schema({

  duNumber: {
    type: String,
    required: true,
    unique: true,
  },
  tenderId:{
    type:String,
    required:true
  },
  model: {
    type: String,
    required: true,
  },
  displayNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  duDisplay: {
    type: [String],
    validate: {
      validator: function(arr) {
        return arr.length <= this.displayNumber;
      },
      message: 'You can only enter up to {VALUE} display numbers',
    },
    required: true,
  }
}, {
  timestamps: true,
});

// Create a Mongoose model using the schema
const Dispenser = mongoose.model('Dispenser', dispenserSchema);

module.exports = Dispenser;

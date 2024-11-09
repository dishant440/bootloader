const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    dateJoined: {
        type: Date,
        default: Date.now,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    resetPasswordOtp: {
        type: String,  // To store OTP
    },
    resetPasswordExpires: {
        type: Date,  // To store OTP expiration time
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

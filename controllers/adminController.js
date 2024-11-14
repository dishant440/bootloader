const bcrypt = require("bcrypt");
const User = require("../model/userModel"); // Import your User model
const crypto = require("crypto")
const nodemailer = require('nodemailer')
// Change Admin Password
const changeAdminPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // Check if the admin is authenticated and is an admin
    if (!req.userEmail) {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        // Find the admin by their ID (assuming req.user.id contains the admin's ID)
        const admin = await User.findOne({email:req.userEmail})
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if the old password matches
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        await admin.save();

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const verifyOtpAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({
    message: "User not found"
  });
  
   
  
  if (user.resetPasswordOtp !== otp || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        message:"Invalid Otp"
      });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;  
  user.resetPasswordOtp = undefined; 
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).send('Password successfully updated');
};

const resetPasswordwithOTP = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({message:'User Does Not Exist'});

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: `${process.env.EMAIL}`, pass: `${process.env.EMAIL_PASSWORD}` }
    });
   
    
    

    const mailOptions = {
        to: user.email,
        from: process.env.EMAIL,
        subject: 'Password Reset OTP',
        text: `You are receiving this because you requested a password reset for your account.
        Here is your One-Time Password (OTP) to reset your password: ${otp}. 
        Please enter this OTP within the next hour to reset your password.`
    };

    // const transporter = nodemailer.createTransport({
    //     host: 'smtp.czarmetricsystem.com', // Replace with your company's SMTP server
    //     port: 587, // Typically port 587 for TLS or 465 for SSL
    //     secure: false, // Set true for port 465 (SSL), false for other ports (TLS)
    //     auth: {
    //         user: process.env.EMAIL, // Your company email
    //         pass: process.env.EMAIL_PASSWORD // Your company email password
    //     },
    //     tls: {
    //         rejectUnauthorized: false // Optional: disable for self-signed certificates
    //     }
    // });

    // const mailOptions = {
    //     to: user.email,
    //     from: process.env.EMAIL, // Replace with a company email address, like 'passwordreset@company.com'
    //     subject: 'Password Reset OTP',
    //     text: `You are receiving this because you requested a password reset for your account.
    //     Here is your One-Time Password (OTP) to reset your password: ${otp}.
    //     Please enter this OTP within the next hour to reset your password.`
    // };

    transporter.sendMail(mailOptions, (err) => {
        if (err) return res.status(500).json({
            message: "Email could not be sent",
            error: err.message
        });
        res.status(200).send('Reset OTP sent to email');
    });
};



const updatePassword = async (req,res) =>{
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    
      if (!user) return res.status(400).send('Token is invalid or has expired');
    
      // Hash new password
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
      // Update password
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
    
      res.status(200).send('Password has been updated');
}

module.exports = {
   
    changeAdminPassword,verifyOtpAndResetPassword,resetPasswordwithOTP,updatePassword,verifyOtpAndResetPassword
};

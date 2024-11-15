const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    try {

        const { name, email, password } = req.body;
       
       
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({
            message: "New User Created Successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const login = async (req,res) => {


    try {

        const {email,password} = req.body;

        //if user already exist
        const existingUser = await User.findOne({email});
        if (!existingUser) {
            return res.status(401).json({
                message:"User Does not Exist Please Register!"
            });
        }

        //check Password

        const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);

        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message:"Incorrect credentials"
            });
        }

        
        const token = jwt.sign({email},process.env.JWT_SECRET,)
            res.status(200).json({
                token:token,
                user:existingUser.name
            });

    } catch (error) {
        return res.status(500).json({
            error:error.message
        })
    }
}

module.exports = {register,login}
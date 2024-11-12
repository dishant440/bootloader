const ServiceEngineer = require("../model/serviceEngineerModel");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

// const addServiceEngineer = async (req,res) =>{
//     try {
        
//         const {name,email,phoneNo,password } = req.body;
        
        
//         if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || (typeof phoneNo !== "string" && typeof phoneNo !== "number")) {
//             return res.status(401).json({
//                 message: "Invalid Input"
//             });
//         }
        
//         const phoneNoNumeric = Number(phoneNo);
//         if (isNaN(phoneNoNumeric)) {
//             return res.status(401).json({
//                 message: "Invalid phone number format"
//             });
//         }
//         const ExistServiceEngineer = await  ServiceEngineer.findOne({email:email});
//         if (ExistServiceEngineer) {
//             return res.status(401).json({
//                 message:"Service Engineer already exist"
//             });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const serviceEngineer = new ServiceEngineer({
//             name:name,
//             email:email,
//             phoneNo:phoneNo,
//             password:hashedPassword
//         })
//         await serviceEngineer.save();
//         res.status(200).json({
//             message:"Service Engineer Created"
//         })
//     } catch (error) {
//         res.json({
//             error:error.message
//         })
//     }
// }
const addServiceEngineer = async (req, res) => {
  try {
    const { name, email, phoneNo, password } = req.body;
 
    // Check if required fields are provided and valid
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid or missing name" });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Invalid or missing email" });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid or missing password" });
    }

    if (!phoneNo || (typeof phoneNo !== "string" && typeof phoneNo !== "number")) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }

    const phoneNoNumeric = Number(phoneNo);
    if (isNaN(phoneNoNumeric)) {
      return res.status(400).json({ message: "Phone number should contain only digits" });
    }

    const existServiceEngineer = await ServiceEngineer.findOne({
      $or: [{ email: email }, { phoneNo: phoneNoNumeric }]
    });

    if (existServiceEngineer) {
      if (existServiceEngineer.email === email) {
        return res.status(409).json({ message: "Service Engineer with this email already exists" });
      }
      if (existServiceEngineer.phoneNo === phoneNoNumeric) {
        return res.status(409).json({ message: "Service Engineer with this phone number already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const serviceEngineer = new ServiceEngineer({
      name: name,
      email: email,
      phoneNo: phoneNoNumeric,
      password: hashedPassword,
    });

    await serviceEngineer.save();

    return res.status(201).json({ message: "Service Engineer Created" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



const serviceEngineerLogin = async (req,res) =>{
  try {
    const {email,password} = req.body;
  
    
    const serviceEngineer = await ServiceEngineer.findOne({email});
    
    if (!serviceEngineer) {
        return res.status(401).json({
            message: "Not Authorized"
        });
    }
    const isPasswordCorrect = await bcrypt.compare(password,serviceEngineer.password);
    
    if (!isPasswordCorrect) {
        return res.status(401).json({
            message:"Incorrect credentials"
        });
    }
    const token = jwt.sign({email},process.env.JWT_KEY)
    res.status(200).json({
        token:token,
        message:"Login successful",
    })
  } catch (error) {
    return res.status(500).json({
        error:error.message
    })
  }
}

const getServiceEngineer = async (req, res) => {
  try {
    const serviceEngineers = await ServiceEngineer.find({}).sort({ dateOfCreation: -1 }); 
    if (!serviceEngineers || serviceEngineers.length === 0) {
      return res.status(404).json({
        message: "No Service Engineers found",
      });
    }

    
    const engineers = serviceEngineers.map(({ name, email, phoneNo,_id }) => ({
      name,
      email,
      phoneNo,
      id:_id
    }));


    return res.status(200).json(engineers); 
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, try again later",
      error: error.message,
    });
  }
};



const getServiceEngineerByName = async (req, res) => {
  const { name } = req.query; // Correctly destructure name from req.query
  const query = String(name); // Ensure it's a string

  try {
    // Find service engineers that match the regex query
    const serviceEngineers = await ServiceEngineer.find({ name: { $regex: query, $options: 'i' } });

    if (serviceEngineers.length === 0) { // Check if no engineers were found
      return res.status(404).json({
        message: "Service Engineer not found",
      });
    }

    // Return an array of matching engineer names
    return res.status(200).json(
      serviceEngineers.map(engineer => ({ name: engineer.name }))
    );

  } catch (error) {
    console.error("Error fetching service engineer:", error); // Log the error for debugging
    return res.status(500).json({
      message: "Something went wrong, try again later",
      error: error.message, // Include the error message for debugging
    });
  }
};

const deleteServiceEngineer = async (req, res) => {
  try {
    // Extract the service engineer ID from request parameters
    const serviceEngineerId = req.params.id;

    // Find and delete the service engineer
    const serviceEngineer = await ServiceEngineer.findByIdAndDelete(serviceEngineerId);

    // Check if the service engineer was found
    if (!serviceEngineer) {
      return res.status(404).json({ message: "Service Engineer not found" });
    }

    // Return a success response
    return res.status(200).json({ message: "Service Engineer deleted successfully" });
  } catch (error) {
    // Handle any errors that occur
    return res.status(500).json({ message: error.message });
  }
};




module.exports = { addServiceEngineer,serviceEngineerLogin,
   getServiceEngineer, getServiceEngineerByName,
  deleteServiceEngineer
}
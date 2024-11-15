const ServiceEngineer = require("../model/serviceEngineerModel")
const Dispenser = require("../model/dispenserModel");
const duMap = require("../model/duMapModel")
const File = require("../model/fileModel")

const addDuMap = async (req, res) => {
  const { serviceEngineer, duNumber, model, fileName, displayNumber, fileId } = req.body;

  try {
    // Find the service engineer by name
    const findEngineer = await ServiceEngineer.findOne({ name: serviceEngineer });
    if (!findEngineer) {
      return res.status(404).json({ message: 'Service Engineer not found' });
    }

    const existingDuMap = await duMap.findOne({
      serviceEngineerName: findEngineer.name,
      duNumber,
      displayNumber,
      fileName
    });

    if (existingDuMap) {
      return res.status(404).json({ message: 'DU Map already exists' });
    }

    const newDuMap = new duMap({
      serviceEngineerName: findEngineer.name,
      serviceEngineerEmail: findEngineer.email,
      duNumber,
      model,
      fileName,
      displayNumber,
      fileId,
    });

    await newDuMap.save();

    // Respond with success
    res.status(201).json({ message: 'DU Map added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add DU Map', error: error.message });
  }
};



const addNewDispenser = async (req,res) => {
    try{
    const {duNumber, model, duDisplay,displayNumber,tenderId} = req.body;

    if (!duNumber || !model || !displayNumber || !duDisplay || !tenderId ) {
        return res.status(400).json({
          message: "All fields are required ",
        });
      }
    const existingDispenser = await Dispenser.findOne({ duNumber });
    
    if (existingDispenser) {
        return res.status(400).json({
          message: `Dispenser with this DUNumber: ${duNumber} already exists.`,
        });
    }
    const newDispenser = new Dispenser({
        duNumber,
        model,
        displayNumber,
        duDisplay,
        tenderId
    });
    
    await newDispenser.save();
    
    return res.status(201).json({
        message: "Dispenser created successfully",
        dispenser: newDispenser,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error creating dispenser",
        error: error.message,
      });
    }    

}


const getDUNumber = async (req, res) => {
  const { duNumber } = req.query; 
  

  try {
      
      const dispensers = await Dispenser.find({ duNumber: { $regex: duNumber, $options: 'i' } });

      if (!dispensers || dispensers.length === 0) {
          return res.status(404).json({ message: "Dispenser Not found" });
      }

      
      const response = dispensers.map(dispenser => ({
          duNumber: dispenser.duNumber,
          modelNo: dispenser.model,
          displayNumber: dispenser.displayNumber,
          duDisplay:dispenser.duDisplay
      }));

      return res.json(response); 
  } catch (err) {
      console.error("Error fetching model number:", err); 
      return res.status(500).json({ message: "Error fetching model number" });
  }
};

 const getDUData = async (req,res) =>{

  try {
    const dispenserData = await Dispenser.find({}); 
    
    
    res.status(200).json(dispenserData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dispenser data", error });
  }

 }

 

const DU_Update = async (req, res) => {
  try {
    const serviceEngineerEmail = req.userEmail;
    
    
    const response = await duMap.find({ serviceEngineerEmail: serviceEngineerEmail });

    // const fileId = await File.findOne({fileId,})

    if (!response || response.length === 0) {
      return res.status(404).json({
        message: "No DU Assigned. Contact Manager"
      });   
    }
    
    const groupedResponse = response.reduce((acc, item) => {  
      const existing = acc.find(obj => obj.duNumber === item.duNumber);
      
      if (existing) {
        // If it exists, push the displayNumber into the array
        existing.displayNumbers.push(item.displayNumber);
      } else {
        // If it doesn't exist, create a new entry
        acc.push({
          duNumber: item.duNumber,
          displayNumbers: [item.displayNumber], // Initialize as an array
          fileName: item.fileName,
          fileId: item.fileId
        });
      }
      return acc;
    }, []);

    return res.status(200).json({
      response: groupedResponse
    });

  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      message: "Something went wrong"
    });
  }
}

const deleteDispenser = async (req, res) => {
  const duNumber = req.params.id;
  
  

  try {
    // Check if the dispenser exists
    const foundDispenser = await Dispenser.findOne({ duNumber: duNumber });

    if (!foundDispenser) {
      return res.status(404).json({ message: 'Dispenser not found' });
    }

    // Delete the dispenser from the database
    await Dispenser.deleteOne({ _id: foundDispenser._id });

    res.status(200).json({ message: 'Dispenser deleted successfully' });
  } catch (error) {
    console.error("Error deleting dispenser:", error);
    res.status(500).json({ message: 'Failed to delete dispenser', error: error.message });
  }
};




module.exports = {  addNewDispenser, getDUNumber, addDuMap, getDUData, DU_Update, deleteDispenser};

const DUMap = require('../model/duMapModel');
const getAllDUMaps = async (req, res) => {
  try {

    const duMaps = await DUMap.find().sort({dateOfCreation:-1});
    
    const formattedDUMaps = duMaps.map(duMap => ({
      name: duMap.serviceEngineerName,
      duNumber: duMap.duNumber,
      model: duMap.model,
      displayNumber:duMap.displayNumber,
      duMapId:duMap._id,
      fileName:duMap.fileName
    }));
    

    res.status(200).json(formattedDUMaps);
  } catch (error) {

    res.status(500).json({ message: 'Failed to fetch DU Maps', error: error.message });
  }
};

const deleteDUMap = async (req,res) => {
  
  try {
    const duMapId = req.params.id;
    
      
    const duMapExist = await  DUMap.findByIdAndDelete(duMapId);
    
    if (!duMapExist) {
      return res.status(404).json({
        message: "DUMap does not exist",
      });
    }
    return res.status(200).json({
      message: "DUMap deleted successfully",
    });
    
  } catch (error) {
    return res.status(404).json({
      message:"Something went wrong",
      error:error.message
    })
  }

}

module.exports = { getAllDUMaps,deleteDUMap };


const Folder= require("../model/folderModel");
const File = require("../model/fileModel");

const fetchAllContent = async(req,res) => {
    try {        
        const folders = await Folder.find({ parentFolderId: { $size: 0 } }).sort({ dateOfCreation: -1 });
        const files = await File.find({ folderId:null}).select('-content').sort({ dateOfCreation: -1 })
        console.log(folders); 
        return res.json({Folders:folders,Files:files}); 
    } catch (error) {
        console.error("Error fetching folders:", error);
        throw error; 
    }
}

const contentById = async (req, res) => {
    try {
      const folderId = req.params.id;
        
      // Find the folder by its ID
      const folder = await Folder.findById(folderId);
  
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
  
      const subFolders = await Folder.find(
        { _id: { $in: folder.subFolders } },
        { folderName: 1, docType: 1, dateOfCreation: 1 }
      );
  
      const files = await File.find(
        { _id: { $in: folder.files } },
        { fileName: 1, docType: 1, dateOfCreation: 1,modelNo: 1 }
      );
  
      return res.status(200).json({
        Folders:subFolders,
        Files:files,
      });
  
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  
module.exports = {fetchAllContent,contentById};  
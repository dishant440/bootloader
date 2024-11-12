const User = require('../model/userModel'); 
const Folder = require('../model/folderModel');
const File = require("../model/fileModel");
const fs = require('fs')

const editFolder = async (req, res) => {
  const { newName, folderId } = req.body;

  try {
    const folderExist = await Folder.findById(folderId);
    if (!folderExist) {
      return res.status(404).json({ message: "Folder not found" }); 
    }

    const folder = await Folder.findByIdAndUpdate(
      folderId,
      { folderName: newName }, 
      { new: true }
    );

    res.status(200).json({ message: "Folder name updated successfully", folder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const createFolder = async (req, res) => {    
    try {
        const email = req.userEmail
        const { folderName,  parentFolderId } = req.body; 

        // Find user by email 
        
        const user = await User.findOne({ email: email })      
        //  check its subFolders of parentFolder
        
        if (parentFolderId) {
        
          const parentFolder = await Folder.findById(parentFolderId).populate('subFolders'); // Populate subFolders to access their names
          if (!parentFolder) {
              return res.status(404).json({ message: 'Invalid Folder' });
          }
            
          // Check if a folder with the same name exists in subFolders
          const folderExists = parentFolder.subFolders.some(subFolder => subFolder.folderName === folderName);
          if (folderExists) {
              return res.status(400).json({ message: 'Folder already exists' });
          }
            
          // Create the new folder since it doesn't exist
          const newFolder = new Folder({ folderName, user: user._id });
          await newFolder.parentFolderId.push(parentFolderId);
          await newFolder.save();
           
          // Add the new folder to the parent's subFolders array
          parentFolder.subFolders.push(newFolder._id);
          await parentFolder.save();
            
          res.status(201).json({newFolderId:newFolder._id});
          // res.status(201).json({newFolder});

            
        } else {
          const folderExists = await Folder.findOne({folderName:folderName});
            if (folderExists) {
                return res.status(400).json({ message: 'Folder already exists' });
            }
            
            // Create the new folder without a parent
            const newFolder = new Folder({ folderName, user: user._id });
            await newFolder.save();           
            res.status(201).json({newFolderId:newFolder._id,folderName:newFolder.folderName});
        }
    } catch (error) {
        
        res.status(500).json({ message: error.message });
        
    }
};

const deleteFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
 
    

    // Find the folder and populate its files and subfolders
    const folder = await Folder.findById(folderId).populate('files subFolders');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Delete all subfolders and their files recursively
    await deleteSubfolders(folder);

    // Delete files in the current folder
    await deleteFilesInFolder(folder);

    // Update parent folder if it exists
    if (folder.parentFolderId) {
      const parentFolder = await Folder.findById(folder.parentFolderId);
      if (parentFolder) {
        parentFolder.subFolders = parentFolder.subFolders.filter(subFolderId => subFolderId.toString() !== folder._id.toString());
        await parentFolder.save();
      }
    }

    // Finally, delete the folder itself
    await Folder.findByIdAndDelete(folder._id);

    res.status(200).json({ message: 'Folder and all its contents deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to delete files in a folder and update user and folder models
const deleteFilesInFolder = async (folder) => {
  if (folder.files && folder.files.length > 0) {

    for (const file of folder.files) {
      await File.deleteOne({_id:file._id});
      // const filePath = path.join(__dirname, '../uploads',modelNO, file.fileName);
      
    }
    // Clear the folder's files array after deleting them
    folder.files = [];
    await folder.save();
  }
};

// Helper function to delete subfolders recursively
const deleteSubfolders = async (folder) => {
  if (folder.subFolders && folder.subFolders.length > 0) {
    for (const subFolderId of folder.subFolders) {
      // Fetch subfolder with its files and subfolders
      const subFolder = await Folder.findById(subFolderId).populate('files subFolders');

      if (subFolder) {
        // Recursively delete the subfolders and their files
        await deleteSubfolders(subFolder);
        await deleteFilesInFolder(subFolder);

        // Delete the subfolder itself
        await Folder.findByIdAndDelete(subFolder._id);
      }
    }
  }
};
  

module.exports = { createFolder,deleteFolder,editFolder };

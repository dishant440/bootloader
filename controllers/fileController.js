const File = require("../model/fileModel");
const Folder = require("../model/folderModel");
const {deleteFileFromS3} = require("../helper/index")
const axios = require('axios')
const crypto = require('crypto');
const { generateUploadUrl,downloadFileFromS3 } = require('../helper/index');

const key = Buffer.from([0xcb, 0x38, 0xd2, 0xd5, 0xbe, 0xb2, 0xdb, 0xd1, 0x91, 0x88, 0x9d, 0x5f, 0x06, 0x69, 0xb1, 0x1b, 
  0x34, 0x86, 0xba, 0x39, 0x0b, 0x44, 0x0e, 0xa1, 0x1f, 0xcb, 0xf1, 0xe0, 0xed, 0x69, 0x97, 0x91]);
const default_DU = "99999999";

function encrypt(buffer, key) {
  const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return encrypted;
}

function generateHash(fileBuffer) {
  
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  const fileHash = hash.digest(); 
  return fileHash;

}


const fileDownload = async (req, res) => {
  console.log("file download function called");


  try {
    const fileId = req.params.fileId;
    console.log("fileId : ",fileId);

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).send('File not found');
    }
    const modelNo = file.modelNo;
    const fileName = file.fileName
    console.log("modelNo : ",modelNo);
    console.log("fileName : ",fileName);
    
    const s3Key = `bootloader-binfiles/${modelNo}/${fileName}`;
    console.log("s3key : ",s3Key);
    

    // Download the file from S3
    const fileStream = await downloadFileFromS3(s3Key);
    fileStream.pipe(res);
    console.log("hashes : ");
    
    console.log(file.originalFileHash);
    console.log(file.encryptedFileHash);
    
    

    res.set({
      'Content-Disposition': `attachment; filename="${file.fileName}"`,
      'X-Original-File-Hash': file.originalFileHash,
      'X-Encrypted-File-Hash': file.encryptedFileHash,
      // 'Content-Type': 'application/octet-stream',
    });


    fileStream.on('end', () => {
      console.log('File downloaded successfully from S3.');
    });

    fileStream.on('error', (error) => {
      console.error('Error occurred while streaming the file:', error.message);
      if (!res.headersSent) {
        res.status(500).send('Error occurred while downloading the file');
      }
    });

  } catch (error) {
    console.error('Error occurred in file download:', error.message);
    if (!res.headersSent) {
      res.status(500).json({message:'Error occurred while downloading the file'});
    } else {
      console.log('Headers were already sent, cannot send error response.');
      res.status(401).json({
        message:"Failed to download File"
      })
    }
  }
};

const fileUpload = async (req, res) => {
  const uploadedBy = req.userEmail;
  if (!uploadedBy) {
      return res.status(400).json({ message: 'You are not authorized' });
  }

  try {
    const { folderId, modelNo } = req.body;
    const { originalname, buffer } = req.file;

    if (!req.file) {
      return res.status(404).json({ message: "Invalid File type" });
    }

    // Check if folderId is provided and file already exists
    if (folderId) {
      const folder = await Folder.findById(folderId).populate('files');
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
      const fileInFolder = folder.files.some(file => file.fileName === originalname);
      if (fileInFolder) {
        return res.status(409).json({ message: 'File already exists in this folder' });
      }
    } else {
      const fileExist = await File.findOne({ fileName: originalname, folderId: null });
      if (fileExist) {
        return res.status(409).json({ message: 'File already exists' });
      }
    }
    const fileHash = generateHash(buffer);
    originalFileHash = fileHash.toString('hex');

    // Encrypt the file
    const encryptedFile = encrypt(buffer, key);
    const encryptedFileHash = generateHash(encryptedFile);
    const finalEncrytedFileHash = encryptedFileHash.toString('hex');


    const s3Key = `bootloader-binfiles/${modelNo}/${originalname}`;

    const presignedUrl = await generateUploadUrl(s3Key);

    try {
      await axios.put(presignedUrl, Buffer.from(encryptedFile, 'hex'), {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });
  
    } catch (error) {
      return res.status(401).json({
        message: 'Failed to upload file ',
      })
    }

    const newFile = new File({
      folderId: folderId || null,
      originalFileHash: originalFileHash,
      encryptedFileHash: finalEncrytedFileHash,
      fileName: originalname,
      modelNo: modelNo,
      dateOfCreation: new Date(),
      s3key:s3Key
    });

    await newFile.save();

    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (folder) {
        folder.files.push(newFile._id);
        await folder.save();
      }
    }

    return res.status(201).json({
      message: 'File uploaded and encrypted successfully',
      presignedUrl: presignedUrl, 
    });

  } catch (error) {
    console.error('Error in file upload:', error.message);
    res.status(500).json({ message: error.message });
  }
};



// const deleteFile = async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     // Find the file by ID
//     const file = await File.findById(fileId);
//     const modelNO = file.modelNo;
    
//     if (file) {
//       // Construct the file path in the uploads folder
//       const filePath = path.join(__dirname, '../uploads',modelNO, file.fileName);

//       // Delete the file from the database
//       await File.deleteOne({ _id: fileId });

//       // Update the folder to remove the reference to the deleted file
//       await Folder.updateOne({ _id: file.folderId }, { $pull: { files: fileId } });

//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.error('Error deleting file from uploads folder:', err);
//           return res.status(500).json({ message: 'Failed to delete the file from the server.' });
//         }

//         // File successfully deleted from filesystem
//         return res.status(200).json({ message: 'File deleted successfully from both database and server.' });
//       });
//     } else {
//       // If the file is not found in the database
//       return res.status(404).json({ message: 'File not found' });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };


const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Find the file by ID in MongoDB
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found in database.' });
    }

    const s3Key = `bootloader-binfiles/${file.modelNo}/${file.fileName}`;

    // Delete the file from S3
    const deleteParams = {
      Bucket: process.env.BUCKET_NAME,  // Ensure BUCKET_NAME is set in your environment variables
      Key: s3Key,
    };
    
    await deleteFileFromS3(s3Key);

    await File.deleteOne({ _id: fileId });

    // Update the folder to remove the reference to the deleted file
    if (file.folderId) {
      await Folder.updateOne({ _id: file.folderId }, { $pull: { files: fileId } });
      console.log('Folder updated to remove deleted file reference.');
    }

    // Send success response
    return res.status(200).json({ message: 'File successfully deleted from S3 and database.' });
  } catch (error) {
    console.error('Error in deleteFile handler:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { deleteFile };

const fileGet = async (req, res) => {
  try {
    const du_ID = req.params.duId;
    if (du_ID!==default_DU) {
      res.json({
        message:"Invalid DU Number"
      })
    }
    const files = await File.find({}); 
    
    const fileData = files.map(file => ({
      _id: file._id,
      fileName: file.fileName
    }));

    res.json(fileData); 
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};


const getFile = async (req, res) => {
  const { id } = req.params; 

    try {
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({
      fileName: file.fileName,
      originalFileHash:file.originalFileHash,
      encryptedFileHash:file.encryptedFileHash,     
    })
   
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


const fileByModelNo = async (req, res) => { 
  try {     
      const { modelNo } = req.query;      
      const files = await File.find({ modelNo: { $regex: modelNo, $options: 'i' } });     
      
      if (!files || files.length === 0) {
          return res.status(404).json({ 
              message: "File not found"
          });
      }
      const response = files.map(f => ({
          fileName: f.fileName,
          fileId:f._id
      }));      
      res.status(200).json({
          files: response, 
      });
  } catch (error) {
      console.error("Error fetching file by modelNo:", error); 
      res.status(500).json({
          message: "Internal Server Error",
          error: error.message,
      });
  }
};

module.exports = {getFile, fileUpload, deleteFile,fileGet, fileDownload,fileByModelNo };

// s3Helper.js
const { S3Client, PutObjectCommand,DeleteObjectCommand,GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

const generateUploadUrl = async (key, expiresIn = 300) => {
    const command = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,  // Retrieve bucket name from env variable
      Key: key,
      ContentType: 'application/octet-stream', // Set the content type based on the file type
    });
  
    try {
      const presignedUrl = await getSignedUrl(s3, command, { expiresIn });
      
      return presignedUrl;
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw error;
    }
  };

  const deleteFileFromS3 = async (key) => {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key,
    });
  
    try {
      await s3.send(deleteCommand);
     
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  };

  const downloadFileFromS3 = async (key) => {
    console.log("key : ",key);
    
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      });
      const s3Response = await s3.send(command);
      return s3Response.Body; 
    } catch (error) {
      console.error('Error downloading file from S3:', error);
      throw error;
    }
  };
module.exports = { generateUploadUrl,deleteFileFromS3,downloadFileFromS3 };

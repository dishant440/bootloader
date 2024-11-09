const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2"); 

const fileSchema = new Schema({
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
        default:null
    },
    docType:{
        type:String,
        default:"File"
    },
    originalFileHash:{
        type:String,
        required:true
    },
    encryptedFileHash:{
        type:String,
        required:true
    },
   
    fileName: {
        type: String,
        required: true,
    },
    modelNo:{
        type:String,
        required:true
    },
    // content: {
    //     type: Buffer,
    //     required: true,
    // }, 
    dateOfCreation: {
        type: Date,
        default: Date.now,
    },
    s3key:{
        type:String,
        required:true
    }
});

fileSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

fileSchema.plugin(mongoosePaginate);
const File = mongoose.model("File", fileSchema);
module.exports = File;


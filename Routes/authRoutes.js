const express = require("express");
const router = express.Router();

// Import Controllers
const { login, register } = require("../controllers/authController");
const { authServicecMiddleware } = require("../middleware/authServiceMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const { createFolder, deleteFolder, editFolder } = require("../controllers/folderController");
const { deleteFile, getFile, fileGet, fileDownload, fileByModelNo } = require("../controllers/fileController");
const { fetchAllContent, contentById } = require("../controllers/filesandFolderController");
const { 
    addServiceEngineer, serviceEngineerLogin, 
    getServiceEngineer, getServiceEngineerByName, 
    deleteServiceEngineer 
} = require("../controllers/serviceEngineerController");
const { getAllDUMaps, deleteDUMap } = require("../controllers/DUMapController");
const { addNewDispenser, addDuMap, getDUData, DU_Update, getDUNumber,deleteDispenser } = require("../controllers/addDUController");
const {changeAdminPassword,verifyOtpAndResetPassword,resetPasswordwithOTP,updatePassword} = require("../controllers/adminController")
const {dataLog,getDataLog} = require("../controllers/dataLog")


// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/serviceEngineer/login", serviceEngineerLogin);

// Folder Routes
router.post("/createFolder", authMiddleware, createFolder);
router.put("/editFolder", editFolder);
router.delete("/deleteFolder/:id", authMiddleware, deleteFolder);

// File Routes
router.get("/getFile/:id", getFile);
router.get("/fileGet/:duId", authMiddleware, fileGet);
//router.get("/fileDownload/:fileId",fileDownload);
router.get("/fileDownload/:fileId", authServicecMiddleware, fileDownload);




router.delete("/deleteFile/:id", authMiddleware, deleteFile);
router.get("/fileByModelNo", fileByModelNo);

// Content Routes
router.get("/allContent", fetchAllContent);
router.get("/content/:id", contentById);

// Service Engineer Routes
router.get("/getServiceEngineers", authMiddleware, getServiceEngineer);
router.get("/serviceEngineer", getServiceEngineerByName);
router.post("/addServiceEngineer", addServiceEngineer);
router.delete("/deleteServiceEngineer/:id", authMiddleware, deleteServiceEngineer);

// DU Map and Dispenser Routes
router.get("/getDUNumber", getDUNumber);
router.get("/getDUMap", getAllDUMaps);
router.get("/getDUData", getDUData);
router.delete("/deleteDUData/:id",deleteDispenser)
router.get("/DU_Update", authServicecMiddleware, DU_Update);
router.post("/add-new-dispenserUnit", authMiddleware, addNewDispenser);
router.post("/add-du-map", authMiddleware, addDuMap);
router.delete("/deleteDUMap/:id",deleteDUMap)

//change Password Route
router.put("/admin/change-password", authMiddleware, changeAdminPassword);
router.post("/requestPasswordReset",resetPasswordwithOTP);
router.post("/verify-otp",verifyOtpAndResetPassword);
router.post("/reset/:token",updatePassword);

router.post("/data-log",dataLog);
router.get("/get-data-log",getDataLog);

// Test Route
router.get("/test", (req, res) => res.json("Hello there"));

module.exports = router;



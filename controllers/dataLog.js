
const DataLog = require('../model/dataLogModel');


const dataLog = async (req, res) => {
     
    
    const {Email,Log_ID, IP_Address, Date, Time, DISPENSER_Serial_Number, DISPLAY_Serial_Number, FileName, Result, Error_Description } = req.body;
    try {
        const newDataLog = new DataLog({
            logId:Log_ID,
            email:Email,
            ipAddress:IP_Address,
            date:Date,
            time:Time,
            dispenserSerialNumber:DISPENSER_Serial_Number,
            displaySerialNumber:DISPLAY_Serial_Number,
            fileName:FileName,
            result:Result,
            errorDescription:Error_Description,
        });        
        await newDataLog.save();
            
        res.status(201).json({ message: 'Data log entry created successfully!'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to create data log entry.', error: error.message });
    }
}




// const getDataLog = async (req, res) => {
//     try {
       
//         const dataLog = await DataLog.find({}).sort({ createdAt: -1 }); // assuming `createdAt` is the timestamp field

//         if (!dataLog || dataLog.length === 0) {
//             return res.status(404).json({
//                 message: "No logs Found"
//             });
//         }
//         console.log(dataLog);
        
//         return res.status(200).json({
//             dataLog
//         });
//     } catch (error) {
//         console.error(error); // Log the error for debugging
//         return res.status(500).json({
//             message: "An error occurred while fetching the logs.",
//             error: error.message // Optionally return the error message for debugging
//         });
//     }
// };

// const getDataLog = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1; 
//         const pageSize = parseInt(req.query.pageSize) || 20; 
//         const skip = (page - 1) * pageSize;
//         const totalLogs = await DataLog.countDocuments();
//         const dataLog = await DataLog.find({})
//             .sort({ time: -1 }) 
//             .skip(skip)            
//             .limit(pageSize);     

//         if (!dataLog || dataLog.length === 0) {
//             return res.status(404).json({
//                 message: "No logs found",
//             });
//         }
//         console.log("datalogs : ",dataLog);
//         console.log(totalLogs);
        
        
//         return res.status(200).json({
//             dataLog,      
//             totalLogs    
//         });
//     } catch (error) {
//         console.error(error); 
//         return res.status(500).json({
//             message: "An error occurred while fetching the logs.",
//             error: error.message 
//         });
//     }
// };




// const getDataLog = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1; 
//         const pageSize = parseInt(req.query.pageSize) || 20; 
//         const skip = (page - 1) * pageSize;
//         const totalLogs = await DataLog.countDocuments(); 
//         const dataLog = await DataLog.find({})
//             .sort({ time: -1 })  
//             .skip(skip)         
//             .limit(pageSize);    
//         if (!dataLog || dataLog.length === 0) {
//             return res.status(404).json({
//                 message: "No logs found",
//             });
//         }

//         return res.status(200).json({
//             dataLog,      
//             totalLogs     
//         });
//     } catch (error) {
//         console.error(error); 
//         return res.status(500).json({
//             message: "An error occurred while fetching the logs.",
//             error: error.message 
//         });
//     }
// };



// module.exports = {dataLog,getDataLog};


const getDataLog = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const pageSize = parseInt(req.query.pageSize) || 20; 
        const skip = (page - 1) * pageSize;
        const totalLogs = await DataLog.countDocuments(); 
        const dataLog = await DataLog.find({}, { srNo: 0 })  // Exclude srNo from the result
            .sort({ date: -1, time: -1 })
            .skip(skip)         
            .limit(pageSize);    
            
        if (!dataLog || dataLog.length === 0) {
            return res.status(404).json({
                message: "No logs found",
            });
        }

        return res.status(200).json({
            dataLog,       // Send dataLog without srNo field
            totalLogs      // Send total log count
        });
    } catch (error) {
        console.error(error); 
        return res.status(500).json({
            message: "An error occurred while fetching the logs.",
            error: error.message 
        });
    }
};

module.exports = {dataLog,getDataLog};
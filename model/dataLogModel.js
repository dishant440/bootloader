const mongoose = require('mongoose');

const dataLogSchema = new mongoose.Schema({
    srNo: { type: Number }, 
    logId:{type:String},
    email: { type: String,  },
    ipAddress: { type: String, default: null },
    date: { type: String, }, 
    time: { type: String,  },
    dispenserSerialNumber: { type: String,  },
    displaySerialNumber: { type: String,  },
    fileName: { type: String,  },
    result: { type: String,  },
    errorDescription: { type: String, default: null },
});

dataLogSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const lastEntry = await mongoose.model('DataLog').findOne().sort({ srNo: -1 });
            this.srNo = lastEntry ? lastEntry.srNo + 1 : 1;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const DataLog = mongoose.model('DataLog', dataLogSchema);

module.exports = DataLog;

// {
//     Email: 'suraj.yadav@emertechelectronics.in',
//     IP_Address: '127.0.0.1',
//     Date: '10-10-2024',
//     Time: '13:30:39',
//     DISPENSER_Serial_Number: '99999999',
//     DISPLAY_Serial_Number: '12000000',
//     FileName: 'COUNT.bin',
//     Result: 'Fail',
//     Error_Description: 'E14 - Serial Port Error during Handshake'
//   }
  
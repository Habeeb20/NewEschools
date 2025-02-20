import mongoose, { mongo } from "mongoose";

const schoolReport = new mongoose.Schema({

    offenderId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "schooluser", 
        required: true
    },

    criminalId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "schooluser", 
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School1",
        required: true,
      },
    issue:{
        type:String,
        required: true
    },
    dateOfIncident:{
        type:Date,
        required: true
    },
  
    createdAt:{
        type:Date,
        default:Date.now
    }

})

export default mongoose.model("SchoolReport", schoolReport)
import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({

 
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School1",
        required: true,
      },
    issue:{
        type:String,
        required: true
    },
  
  
    createdAt:{
        type:Date,
        default:Date.now
    }

})

export default mongoose.model("SchoolNotice", noticeSchema)
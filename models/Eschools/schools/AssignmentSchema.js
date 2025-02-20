import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, 
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School1",
        required: true,
      },
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "schooluser", required: true },
      instructions:{
        type:String,required: true
    },
    content: {type:String,required: true},
    
    createdAt: { type: Date, default: Date.now }
})


export default mongoose.model("Assignment", assignmentSchema)

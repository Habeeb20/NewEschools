import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }], 
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School1",
        required: true,
      },
    students: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "SchoolUser" }, 
      scores: {
        firstTest: { type: Number, default: 0 },
        secondTest: { type: Number, default: 0 },
        exam: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        grade: { type: String, default: "F" }
      }
    }]
  }, { timestamps: true });
  
export default mongoose.model("Subject", subjectSchema);
  
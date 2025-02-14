
import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
 
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School1",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Class", classSchema)

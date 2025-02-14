import mongoose from "mongoose";
const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, unique: true },
  visitTime: { type: Date, default: Date.now },
  lastVisit: Date,
  isReturning: { type: Boolean, default: false },
});


export default mongoose.model("Visitor", visitorSchema)
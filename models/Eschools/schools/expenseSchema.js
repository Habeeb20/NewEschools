import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  name: String,
  reason: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "School1" } 
});

export default mongoose.model("Expense", expenseSchema);

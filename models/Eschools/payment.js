import mongoose from "mongoose"

const paymentSchema = new mongoose.Schema({
    email: String,
    amount:Number,
    reference:String,
    status: String
})

export default mongoose.model("UPayment", paymentSchema)
import mongoose from "mongoose";


const requestSchema = new mongoose.Schema({
    nameOfUser:{
        type:String,
        required: true,
        trim: true
    },
    emailOfUser:{
        type:String,
        required: true,


    },
    phone: {
        type:String,
        required: true
    },

    request: {
        type:String,
        required: true
    }
}, {timestamps: true})

export default mongoose.model("Request", requestSchema)
import mongoose from "mongoose";


const examSchema = new mongoose.Schema({
    username: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required:true
    },
    examBody:{
        type:String,

    },
    email:{
        type:String
    },
    phone:{
        type:String,
    },
    category:{
        type:String,
    },
    headOffice:{
        type:String
    },
    location:{
        type:String,
    },
    state:{
        type:String,
    },
    LGA:{
        type:String,
    },
    startDate:{
        type:Date,
    },
    endDate:{
        type:Date
    },
    formPrice:{
        type:String
    },
    Deadline:{
        type:Date
    },
    createdAt: {
        type:Date,
        Default:Date.now
    },
    picture1: String,
    picture2:String,
    picture3: String,
    picture4:String,
    comments: [
        {
          name: String,
          text: String,
          createdAt: { type: Date, default: Date.now }
        }
      ],
      clicks: { type: Number, default: 0 }, 
      shares: { type: Number, default: 0 },



}, {timestamps:true})

export default mongoose.model("Exam", examSchema)
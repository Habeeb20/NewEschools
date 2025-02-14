import mongoose from "mongoose";


const trainingSchema = new mongoose.Schema({
    username:{type:String, required:true},
    password:{type:String, required:true},
    trainingName:String,
    category:String,
    features:String,
    motto:String,
    email:String,
    phone:String,
    state:String,
    LGA:String,
    location:String,
    picture1: String,
    picture2:String,
    picture3: String,
    picture4:String,
    createdAt: { type: Date, default: Date.now },
    uniqueNumber:String,
    comments: [
        {
          name: String,
          text: String,
          createdAt: { type: Date, default: Date.now }
        }
      ],
      clicks: { type: Number, default: 0 }, 
      shares: { type: Number, default: 0 },
}, {timestamps:true} )

export default mongoose.model('Training', trainingSchema)
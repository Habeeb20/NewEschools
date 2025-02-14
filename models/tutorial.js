import mongoose from "mongoose"

const tutorialSchema = new mongoose.Schema({
    username:{type:String, required:true},
    password:{type:String, required:true},
    tutorialName:String,
    email:String,
    phone:String,
    state:String,
    LGA:String,
    location:String,
    formPrice:String,
    picture1: String,
    picture2:String,
    picture3: String,
    picture4:String,
    exam1:String,
    exam2:String,
    exam3:String,
    exam4:String,
    exam5:String,
    otherclasses:String,
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

export default mongoose.model('Tutorial', tutorialSchema)
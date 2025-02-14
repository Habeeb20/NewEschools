import mongoose from "mongoose";
const teacherSchema = new mongoose.Schema({
    username:{type:String, required:true},
    password:{type:String, required:true},
    fname:String,
    lname:String,
    email:String,
    phone:String,
    state:String,
    LGA:String,
    location:String,
    qualification:String,
    school:String,
    grade:String,
    course:String,
    specialization:String,
    unqueNumber:String,
    YOE:String,
    PS:String,
    haveajob:String,
    whatcategory:String,
    lookingforateachingjob:String,
    fitinothercategory:String,
    CV:String,
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

export default mongoose.model('Teacher', teacherSchema)
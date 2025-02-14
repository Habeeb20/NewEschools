import mongoose from "mongoose"
const schoolSchema = new mongoose.Schema({
  username:{type:String, required: true}, 
  password:{type:String, required: true},
  schoolName: String,
  email:String,
  phone:String,
  discount:String,
  discounttext:String,
  percent:String,
  duration:String,
  departments: String,
  faculty: String,
  admissionStartDate: Date,
  admissionEndDate: Date,
  admissionRequirements: String,
  category: String,
  state: String,
  LGA: String,

  location: String,
  schoolFees: Number,
  onBoarding: String,
  schoolbus:String,
  picture: String, 
  schoolPicture: String,
  coverPicture: String,

  picture1: String,
  picture2:String,
  picture3: String,
  picture4:String,
  TC:String,
  schoolNews:String,
  history:String,
  vcpicture:String,
  vcspeech:String,
  AO:String,

  ownership:String,

  schoolfees1:String,
  class1:String,

  schoolfees2:String,
  class2:String,

  schoolfees3:String,
  class3:String,

  schoolfees4:String,
  class4:String,

  schoolfees5:String,
  class5:String,

  schoolfees6:String,
  class6:String,

  schoolfees7:String,
  class7:String,

  jobVacancy:String,
  NumberOfVacancy:Number,

  position1:String,
  salary1:String,
  qualification1:String,


  position2:String,
  salary2:String,
  qualification2:String,

  position3:String,
  salary3:String,
  qualification3:String,

  position4:String,
  salary4:String,
  qualification4:String,

  position5:String,
  salary5:String,
  qualification5:String,

  position6:String,
  salary6:String,
  qualification6:String,

  comments: [
    {
      name: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  clicks: { type: Number, default: 0 }, 
  shares: { type: Number, default: 0 },
}, {timestamps: true});

export default mongoose.model('School', schoolSchema);

import mongoose from "mongoose";
const bookshopSchema = new mongoose.Schema({
  username:{type:String, required:true},
  password:{type:String, required:true},
  bookshopName:String,
  BookOrLibrary:String,
  email:String,
  phone:String,
  state:String,
  LGA:String,
  location:String,
  picture1: String,
  picture2:String,
  picture3: String,
  picture4:String,
  picture5:String,
  picture6:String,
  picture7:String,
  picture8:String,
  picture9:String,
  picture10:String,
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

export default mongoose.model('Bookshop', bookshopSchema)
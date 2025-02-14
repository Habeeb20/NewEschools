import mongoose from 'mongoose';
import bcrypt from "bcrypt";

const jobSeekerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  schoolAttended:String,
  Grade:String,
  phone:String,
  Qualification:String,
  workExp:String,
  state:String,
  LGA:String,
  location:String,
  profilePicture:String,
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
});



const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);
export default JobSeeker;

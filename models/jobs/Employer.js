
import mongoose from 'mongoose';
import bcrypt from "bcrypt"
const employerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  jobPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
});


employerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
employerSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const Employer = mongoose.model('Employer', employerSchema);
export default Employer;

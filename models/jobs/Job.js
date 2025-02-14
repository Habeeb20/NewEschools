// Job.js
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer' },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker' }],
});

const Job = mongoose.model('Job', jobSchema);
export default Job;

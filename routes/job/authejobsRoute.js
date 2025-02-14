import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken';
import Employer from '../../models/jobs/Employer.js';
import JobSeeker from '../../models/jobs/JobSeeker.js';
import express from 'express';
const authJobrouter = express.Router()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Employer Register
authJobrouter.post ('/registeremployer', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const employerExists = await Employer.findOne({ email });
    if (employerExists) return res.status(400).json({ message: 'Employer already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const employer = new Employer({ name, email, password: hashedPassword });
    await employer.save();

    const token = generateToken(employer._id);
    res.status(201).json({ message: 'Employer registered successfully', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Job Seeker Register
authJobrouter.post('/registerjobseeker', async (req, res) => {
  const { name, email, password } = req.body;
  

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
  }

  try {
 
    const jobSeekerExists = await JobSeeker.findOne({ email });
    if (jobSeekerExists) {
      return res.status(400).json({ message: 'Job Seeker already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const jobSeeker = new JobSeeker({ name, email, password: hashedPassword });
    await jobSeeker.save();

    const token = generateToken(jobSeeker._id);
    

    res.status(201).json({ message: 'Job Seeker registered successfully', token });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});


// Employer Login Logic
authJobrouter.post('/employerlogin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if employer exists
    const employer = await Employer.findOne({ email });
    if (!employer) {
      return res.status(404).json({ message: 'Employer not found' });
    }

    // Compare passwords
    const isMatch = await employer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: employer._id, role: 'employer' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      employer: {
        id: employer._id,
        name: employer.name,
        email: employer.email,
      },
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
});


authJobrouter.post('/jobseekerlogin', async (req, res) => {
  const { email, password } = req.body;

  try {
  
    const seeker = await JobSeeker.findOne({ email });
    if (!seeker) {
      return res.status(404).json({ message: 'Job Seeker account not found' });
    }

    console.log("Logging in seeker:", seeker); 

    
    const isMatch = await bcrypt.compare(password, seeker.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: seeker._id, role: 'seeker' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      seeker: {
        id: seeker._id,
        name: seeker.name,
        email: seeker.email,
      },
    });
  } catch (error) {
    console.error(error); // Debugging error
    res.status(500).json({ message: error.message });
  }
});
authJobrouter.get('/alljobs', async (req, res) => {
  try {
 
    const employers = await Employer.find({}, 'name jobPosts').populate({
      path: 'jobPosts', 
      model: 'Job', 
    });

    
    const jobs = employers.flatMap((employer) =>
      Array.isArray(employer.jobPosts)
        ? employer.jobPosts.map((job) => ({
            jobId: job._id,
            title: job.title,
            description: job.description,
            location:job.location,
            employerName: employer.name,
            applicantsCount: job.applicants.length || 0,
          }))
        : []
    );

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});



export default authJobrouter

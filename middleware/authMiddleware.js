import jwt from 'jsonwebtoken';
import Employer from '../models/jobs/Employer.js';
import JobSeeker from '../models/jobs/JobSeeker.js';


const protectEmployer = async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; 
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 

      // Attach the employer's data to the request object
      req.user = await Employer.findById(decoded.id).select('-password'); // Exclude the password from the result

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized as employer' });
      }

      next(); // Pass control to the next middleware or route handler
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token is not valid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

// Middleware to protect Job Seeker routes
const protectSeeker = async (req, res, next) => {
  let token;

  // Check for the token in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Extract the token from the "Bearer" string
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify and decode the token

      // Attach the job seeker's data to the request object
      req.user = await JobSeeker.findById(decoded.id).select('-password'); // Exclude the password from the result

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized as job seeker' });
      }

      next(); // Pass control to the next middleware or route handler
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token is not valid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
};

export { protectEmployer, protectSeeker };

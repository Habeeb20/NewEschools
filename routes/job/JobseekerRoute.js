
import Job from '../../models/jobs/job.js';
import JobSeeker from '../../models/jobs/JobSeeker.js';
import jwt from "jsonwebtoken"
import pkg from "cloudinary"
import mongoose from 'mongoose';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { protectSeeker } from '../../middleware/authMiddleware.js';
import express from 'express';

const {v2: cloudinary} = pkg
const applyjobroute =express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: 624216876378923,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: "schools" },
});

applyjobroute.post("/applyjob/:id", protectSeeker, async (req, res) => {
  try {
    const jobId = req.user._id; 
    const {id} = req.params
    const seeker = await JobSeeker.findById(req.user._id);
    console.log("this is ur data!!", seeker)
    if (!seeker) {
   
      return res.status(404).json({ message: "Job seeker not found" });
    }

    const job = await Job.findById(id);
    if (!job) {
      console.log("not found")
      return res.status(404).json({ message: "Job not found" });
    }


    if (job.applicants.includes(seeker._id)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Update job and seeker records
    job.applicants.push(seeker._id);
    await job.save();

    seeker.appliedJobs.push(job._id);
    await seeker.save();

    res.status(200).json({ message: "Applied for job successfully" });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error" });
  }
});


applyjobroute.get("/dashbaord", protectSeeker, async(req, res) => {
  const userId = req.user._id;
  const user = await JobSeeker.findById(userId);

  if(!user){
    res.status(404).json({message:"user not found"})
  }



  res.status(200).json(user)
})



applyjobroute.put("/:id", protectSeeker, async(req, res) => {
  const {id} =req.params

  const user = await JobSeeker.findById(id)
  if(!user){
    res.status(404).json({message:"user not found"})
  }


  if(user.id.toString() !==req.user.id){
    res.status(403).json({message:"not authorized"})
  }

  const updates = { ...req.body };
  const uploadFile = async (file) => {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "schools",
    });
    return result.secure_url;
  };
  if (req.files) {
    if (req.files.picture) {
      updates.picture = await uploadFile(req.files.picture);
    }
  }


  const updatedUser = await JobSeeker.findByIdAndUpdate(id, updates, {
    new: true,
  });
  if(!updatedUser){
    res.ststus(500).json({message: "failed to update school"})
  }

  console.log(updatedUser)
  res.status(200).json(updatedUser)


})

applyjobroute.get("/getjobs", protectSeeker, async (req, res) => {
  try {
  
    const seekerId = req.user._id;
    console.log(seekerId)

    if (!seekerId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

   
    const jobSeeker = await JobSeeker.findById(seekerId).populate(
      "appliedJobs",
      "title description location employer"
    );

    if (!jobSeeker) {
      return res.status(404).json({ message: "Job seeker not found" });
    }


    res.status(200).json(jobSeeker.appliedJobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default applyjobroute

import mongoose from "mongoose";
import express from "express";
import School from "../../../models/Eschools/schools/school.schema.js";
import Class from "../../../models/Eschools/schools/schoolClass.js"
import SchoolUser from "../../../models/Eschools/schools/schoolUsers.js";
import Subject from "../../../models/Eschools/schools/schoolSubject.js";
import { Protect, verifyToken } from "../../../middleware/protect.js";
import User from "../../../models/Eschools/user.js";
import schooluserRouter from "./schoolusers.route.js";
const subjectRouter = express.Router()
// Create a new subject


subjectRouter.post("/create-subject", Protect, async (req, res) => {
    try {
        const { name, classes } = req.body;

        // Check if admin exists
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ message: "Not authenticated" });
        }

        // Find the school associated with the admin
        const school = await School.findOne({ userId: req.user._id });
        if (!school) {
            return res.status(403).json({ error: "No school found for this user" });
        }

        // Convert class names to ObjectIds
        const foundClasses = await Class.find({ name: { $in: classes }, schoolId: school._id });
        console.log("my found class", foundClasses)
        console.log("my class!!", classes)
        // Ensure all provided classes exist and belong to the school
        if (foundClasses.length === 0) {
            return res.status(400).json({ message: "no class belong to this school" });
        }

        // Get the ObjectIds of the valid classes
        const classIds = foundClasses.map(cls => cls._id);

        // Create the new subject
        const newSubject = new Subject({
            name,
            classes: classIds,
            schoolId: school._id,
        });

        await newSubject.save();

        res.status(201).json({ message: "Subject created successfully", subject: newSubject });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create subject" });
    }
});


// Get all subjects
subjectRouter.get("/get-my-subjects", Protect, async (req, res) => {
    try {
      
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(403).json({ message: "Not authenticated" });
        }

        const school = await School.findOne({ userId: req.user._id });
        if (!school) {
            return res.status(404).json({ error: "No school found for this user" });
        }

      
        const subjects = await Subject.find({ schoolId: school._id })
            .populate("classes", "name") // Populate class names
            .populate("schoolId", "schoolName" );

        res.status(200).json({ message: "Subjects retrieved successfully", subjects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve subjects" });
    }
});


//get all subjects by teachers
subjectRouter.get("/get-my-school-subjects", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUser.findById(req.user.id)
        if(!teacher) return res.status(404).json({message:"this teacher details is not found"})
        
        const school = await SchoolUser.findOne({schoolId: teacher.schoolId})
        if(!school) return res.status(404).json({message: "school not found"})
        
            const subjects = await Subject.find({ schoolId: teacher.schoolId })
            .populate("classes", "name") // Populate class names
            .populate("schoolId", "schoolName" );

        res.status(200).json({ message: "Subjects retrieved successfully", subjects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve subjects" });
    }
})

export default subjectRouter

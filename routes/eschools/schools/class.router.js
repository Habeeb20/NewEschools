import express from "express";
import Class from "../../../models/Eschools/schools/schoolClass.js";
import Subject from "../../../models/Eschools/schools/schoolSubject.js";
import SchoolUsers from "../../../models/Eschools/schools/schoolUsers.js";
import User from "../../../models/Eschools/user.js";
import School from "../../../models/Eschools/schools/school.schema.js";
import { Protect } from "../../../middleware/protect.js";

const classRouter = express.Router();

// Create a new class
classRouter.post("/create-class", Protect, async (req, res) => {
    try {
        const { name } = req.body;

       
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(403).json({ message: "Not authenticated" });
        }

    
        const school = await School.findOne({ userId: req.user._id });
        if (!school) {
            return res.status(404).json({ error: "No school found for this user" });
        }

       
        const newClass = new Class({ 
            name, 
         
            schoolId: school._id 
        });

        await newClass.save();


        res.status(200).json({ message: "Class created successfully", class: newClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create class" });
    }
});

// Get all classes
classRouter.get("/my-classes", Protect, async (req, res) => {
    try {
        // Check if the user is authenticated as an admin
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(403).json({ message: "Not authenticated" });
        }

        // Find the school linked to this admin
        const school = await School.findOne({ userId: req.user._id });
        if (!school) {
            return res.status(404).json({ error: "No school found for this user" });
        }

        // Fetch only classes that belong to the authenticated admin's school
        const classes = await Class.find({ schoolId: school._id })
          

        res.status(200).json({ message: "Classes retrieved successfully", classes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

export default classRouter;

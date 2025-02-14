
import express from "express";
import School from "../../../models/Eschools/schools/school.schema.js";
import Class from "../../../models/Eschools/schools/schoolClass.js"
import SchoolUser from "../../../models/Eschools/schools/schoolUsers.js";
import Subject from "../../../models/Eschools/schools/schoolSubject.js";
import { Protect } from "../../../middleware/protect.js";
import User from "../../../models/Eschools/user.js";
const subjectRouter = express.Router()
// Create a new subject
subjectRouter.post("/create-subject", Protect, async (req, res) => {
    try {
        const { name, classes } = req.body;

      
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ message: "Not authenticated" });
        }

       
        const school = await School.findOne({ userId: req.user._id });
        if (!school) {
            return res.status(403).json({ error: "No school found for this user" });
        }

        const students = await SchoolUser.find({ classId: { $in: classes } });

      
        const newSubject = new Subject({
            name,
            classes,
            schoolId: school._id, 
            students: students.map(student => ({
                studentId: student._id, 
                scores: {
                    firstTest: 0,
                    secondTest: 0,
                    exam: 0,
                    total: 0,
                    grade: "F"
                }
            }))
        });

        await newSubject.save();

     
        const hasSubjectsField = SchoolUser.schema.paths.subjects;
        if (hasSubjectsField) {
            await SchoolUser.updateMany(
                { _id: { $in: students.map(s => s._id) } },
                { $push: { subjects: newSubject._id } }
            );
        }

        res.status(201).json({ message: "Subject created successfully", subject: newSubject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create subject" });
    }
});
// Get all subjects
subjectRouter.get("/get-my-subjects", Protect, async (req, res) => {
    try {
        // Check if the user is an authenticated admin
        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(403).json({ message: "Not authenticated" });
        }

        // Find the school associated with the admin
        const school = await School.findOne({ userId: req.user._id });
        if (!school) {
            return res.status(404).json({ error: "No school found for this user" });
        }

        // Find all subjects linked to this school
        const subjects = await Subject.find({ schoolId: school._id })
            .populate("classes", "name") // Populate class names
            .populate("students.studentId", "name email classId"); // Populate student details

        res.status(200).json({ message: "Subjects retrieved successfully", subjects });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve subjects" });
    }
});

export default subjectRouter

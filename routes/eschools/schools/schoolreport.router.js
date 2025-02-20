import Report from "../../../models/Eschools/schools/report.js";
import schoolUsers from "../../../models/Eschools/schools/schoolUsers.js"
import mongoose from "mongoose";
import express from "express"
import { Protect, verifyToken } from "../../../middleware/protect.js";
import School from "../../../models/Eschools/schools/school.schema.js";
import User from "../../../models/Eschools/user.js";

const reportSchoolrouter = express.Router()

reportSchoolrouter.post("/postmyreportbystudent", verifyToken, async(req, res) => {
    try {

        const {criminal, issue, dateOfIncident} = req.body
        const student = await schoolUsers.findById(req.user.id)
        if(!student)return res.status(404).json({message: "student id not found"})
        
                
    const admin = await schoolUsers.findOne({schoolId: student.schoolId})
    if(!admin) return res.status(404).json({message: "admin id not found"})

    const report = new Report({
        offenderId: req.user.id,
        criminalId: new mongoose.Types.ObjectId(criminal),
        schoolId:student.schoolId,
        issue,
        dateOfIncident,
     
    })

    await report.save()
    return res.status(200).json({message:"successfully sent"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "an error occurred from the server"})
    }
} )


reportSchoolrouter.get("/getmyreports", verifyToken, async (req, res) => {
    try {
     
        const student = await schoolUsers.findById(req.user.id);
        if (!student) return res.status(404).json({ message: "Student details not found" });


        const myReport = await Report.find({ schoolId: student.schoolId }) // FIXED: `schoolId` typo
            .populate("criminalId", "name role")
            .populate("schoolId", "name")
            .populate("offenderId", "name email");

   
        if (myReport.length === 0) {
            return res.status(404).json({ message: "No reports found" });
        }

        console.log("Student Reports:", myReport);
        return res.status(200).json(myReport);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({ message: "An error occurred on the server" });
    }
});

reportSchoolrouter.get("/getreportbyadmin", verifyToken, async (req, res) => {
    try {
        // Find the school associated with the logged-in user
        const school = await School.findOne({ userId: req.user.id });
        if (!school) {
            return res.status(404).json({ message: "No school found for this user" });
        }

        // Fetch reports for the school
        const reports = await Report.find({ schoolId: school._id }) 
            .populate("criminalId", "name email role")
            .populate("offenderId", "name email role");

        // If no reports exist
        if (reports.length === 0) {
            return res.status(404).json({ message: "No reports found for this school." });
        }

        console.log("Reports for admin:", reports);
        return res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({ message: "An error occurred while fetching reports." });
    }
});


reportSchoolrouter.post("/postreportbyteacher", verifyToken, async(req, res) => {
    try {
       
        const {criminal, issue, dateOfIncident} = req.body
        const teacher = await schoolUsers.findById(req.user.id)
        if(!teacher) return res.status(404).json({message: "not found"})
        
            const admin = await schoolUsers.findOne({schoolId: teacher.schoolId})
    if(!admin) return res.status(404).json({message: "admin id not found"})

        const report = new Report({
            offenderId: req.user.id,
            criminalId: new mongoose.Types.ObjectId(criminal),
            schoolId:teacher.schoolId,
            issue,
            dateOfIncident,
         
        })
    
        await report.save()
        return res.status(200).json({message:"successfully sent"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "an error occurred from the server"})
    }
})


reportSchoolrouter.get("/getreportbyteacher", verifyToken, async(req, res) => {
    try {
        const teacher = await schoolUsers.findById(req.user.id)
        if(!teacher) return res.status(404).json({message:" not found"})
        
        const admin = await schoolUsers.findOne({schoolId:teacher.schoolId})
        if(!admin) return res.status(404).json({message: "not found"})
        
        const report = await Report.find({schoolId: teacher.schoolId})
        .populate("criminalId", "name email role")
        .populate("offenderId", "name email role")
    
    return res.status(200).json(report)
    } catch (error) {
        
    }
})


export default reportSchoolrouter
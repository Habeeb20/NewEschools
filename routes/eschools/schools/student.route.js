import express from "express";
import StudentScore from "../../../models/Eschools/schools/schoolScore.js";
import { verifyToken } from "../../../middleware/protect.js";
import schoolUsers from "../../../models/Eschools/schools/schoolUsers.js";
import Assignment from "../../../models/Eschools/schools/AssignmentSchema.js";
import noticeSchema from "../../../models/Eschools/schools/noticeSchema.js";

const studentRouter = express.Router();

studentRouter.get("/my-scores", verifyToken, async (req, res) => {
  try {
    const student = await schoolUsers.findById(req.user.id)
    if(!student)return res.status(404).json({message: "student id not found"})
    
    const admin = await schoolUsers.findOne({schoolId: student.schoolId})
    if(!admin) return res.status(404).json({message: "admin id not found"})
    
    const myScore = await StudentScore.find({studentId: student._id}).populate("teacherId", "name").populate("subjectId", "name")
    
    if(!myScore) return res.status(400).json({message:'no score available for you'})
    return res.status(200).json(myScore)
  
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error retrieving scores: " + error.message });
  }
});

studentRouter.get("/studentdashboard", verifyToken, async (req, res) => {
  try {
    const student = req.user.id;
    if (!student)
      return res.status(404).json({ message: "student id not found" });

    const user = await schoolUsers.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "your details is not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server error" });
  }
});

//get all assignment
studentRouter.get("/studentgetallassignments", verifyToken, async (req, res) => {
  try {
    const student = await schoolUsers.findById(req.user.id);
    if (!student)
      return res.status(404).json({ message: "student information not found" });

    const admin = await schoolUsers.findOne({ schoolId: student.schoolId });
    if (!admin) return res.status(404).json({ message: "admin not found" });

    const assignments = await Assignment.find({ schoolId: student.schoolId })
      .populate("classId", "name")
      .populate("teacherId", "name email");
    console.log("all assignments!!!!", assignments);
    return res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred from the server" });
  }
});

//get all teachers
studentRouter.get("/studentgetallteachers", verifyToken, async (req, res) => {
  try {
    const student = await schoolUsers.findById(req.user.id);
    if (!student)
      return res.status(404).json({ message: "student information not found" });

    const admin = await schoolUsers.findOne({ schoolId: student.schoolId });
    if (!admin) return res.status(404).json({ message: "admin not found" });

    const students = await schoolUsers.find({
      schoolId: student.schoolId,
      role: "teacher",
    });

    if (!students || students.length === 0) {
      return res
        .status(404)
        .json({ message: "No teacher found for this school" });
    }
    console.log("I have got the response for the teachers");
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students." });
  }
});


//get all students and teachers in the school

studentRouter.get("/getallschoolusers", verifyToken, async(req, res) => {
  try {
     
    const student = await schoolUsers.findById(req.user.id);
    if (!student)
      return res.status(404).json({ message: "student information not found" });

    const admin = await schoolUsers.find({ schoolId: student.schoolId });
    if (!admin) return res.status(404).json({ message: "admin not found" });


    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
})


//get all the announcement
studentRouter.get("/getstudentnotice", verifyToken, async(req, res) => {
  try {
    const admin = await schoolUsers.findById(req.user.id)
    if(!admin) return res.status(404).json({message:"not found"})
    
    const notice = await noticeSchema.find({schoolId: admin.schoolId}).populate("schoolId", "name")
    if(!notice) return res.status(404).json({message:"your  admin details not found"})
    
    return res.status(200).json(notice)
  } catch (error) {
    console.log(error)
    return res.status(500).json({message:"an error occurred"})
  }
})


export default studentRouter;

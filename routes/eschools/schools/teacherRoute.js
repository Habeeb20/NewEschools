import express from "express";
import SchoolUsers from "../../../models/Eschools/schools/schoolUsers.js";
import jwt from "jsonwebtoken"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Protect, Protect2, verifyToken } from "../../../middleware/protect.js";
import School from "../../../models/Eschools/schools/school.schema.js";
import mongoose from "mongoose";
import StudentScore from "../../../models/Eschools/schools/schoolScore.js"
import Assignment from "../../../models/Eschools/schools/AssignmentSchema.js";
import schoolClass from "../../../models/Eschools/schools/schoolClass.js";
import noticeSchema from "../../../models/Eschools/schools/noticeSchema.js";
import schoolUsers from "../../../models/Eschools/schools/schoolUsers.js";
const teacherRouter = express.Router()



teacherRouter.get("/teacherdashboard", verifyToken, async (req, res) => {
    try {
     
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.id;
      

    
        const user = await SchoolUsers.findById(userId);
        if (!user) {
            console.log("User not found here");
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching teacher data:", error);
        res.status(500).json({ message: "Server error" });
    }
});


teacherRouter.get("/teachergetuser", verifyToken, async (req, res) => {
    try {
      
        const teacher = await SchoolUsers.findById(req.user.id);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
   
        
        // Ensure schoolId exists
        if (!teacher.schoolId) {
         
            return res.status(400).json({ message: "Teacher has no assigned schoolId" });
        }
        
        const admin = await SchoolUsers.findOne({ schoolId: teacher.schoolId });


if (!admin) {
  
    return res.status(404).json({ message: "Admin not found" });
}

        

     
        const users = await SchoolUsers.find({ schoolId: teacher.schoolId });

        const students = users.filter(user => user.role === "student");
        const teachers = users.filter(user => user.role === "teacher" && user._id.toString() !== teacher._id.toString());

        console.log("Successful retrieval");
        console.log(students)
        console.log(teachers)
        res.json({
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            },
            students,
            teachers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


teacherRouter.get("/teachergetstudentsByClass", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id);
        if(!teacher){
            return res.status(404).json({message: "not found"})
        }

        const admin = await SchoolUsers.findOne({schoolId: teacher.schoolId });
        if(!admin){
            return res.status(404).json({message: "Admin's Id  is not found "})
        }

        const students = await SchoolUsers.find({schoolId:teacher.schoolId , role: "student"})

        if(!students || students.length === 0) {
            return res.status(404).json({message: "No student found for this school"})
        }

        const studentsByClass = students.reduce((acc, student) => {
            const classId = student.sclass || "unassigned";
            if (!acc[classId]) {
                acc[classId] = [];
              }
              acc[classId].push(student);
              return acc;
        }, {})
        console.log("succcessful for student by class")
      res.status(200).json(studentsByClass);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" })
    }
})
// //get students
teacherRouter.get("/getmyteacherstudents", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id)
        if(!teacher){
            return res.status(404).json({message: "not found"})
        }
            const admin = await SchoolUsers.findOne({schoolId: teacher.schoolId});
            if(!admin){
                return res.status(404).json({message: "Admin's Id  is not found "})
            }
    
            const students = await SchoolUsers.find({schoolId:  teacher.schoolId, role: "student"})
    
            if(!students || students.length === 0) {
                return res.status(404).json({message: "No student found for this school"})
            }
            console.log("i have got the response for teacher students")
            res.status(200).json(students)
        
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students." });
    }
})

// //get teachers
teacherRouter.get("/getmyteacherteachers", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id)
        if(!teacher){
            return res.status(404).json({message: "not found"})
        }
            const admin = await SchoolUsers.findOne({schoolId:teacher.schoolId});
            if(!admin){
                return res.status(404).json({message: "Admin's Id  is not found "})
            }
    
            const students = await SchoolUsers.find({schoolId: teacher.schoolId, role: "teacher"})
    
            if(!students || students.length === 0) {
                return res.status(404).json({message: "No teacher found for this school"})
            }

            res.status(200).json(students)
        
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students." });
    }
})

// //get other staffs
teacherRouter.get("/getmyteacherotherstaff", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id)
        if(!teacher){
            return res.status(404).json({message: "not found"})
        }
            const admin = await SchoolUsers.findOne({schoolId: teacher.schoolId});
            if(!admin){
                return res.status(404).json({message: "Admin's Id  is not found "})
            }
    
            const students = await SchoolUsers.find({schoolId: teacher.schoolId, role: "otherStaff"})
    
            if(!students || students.length === 0) {
                return res.status(404).json({message: "No studne found for this school"})
            }
            console.log("i have got other staff details")
            res.status(200).json(students)
        
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students." });
    }
})


// //get school data for teacher
teacherRouter.get("/getschooldataforteacher", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id)
        if(!teacher){
            return res.status(404).json({message: "not found"})
        }
            const admin = await SchoolUsers.findOne({schoolId:teacher.schoolId});
            if(!admin){
                return res.status(404).json({message: "Admin's Id  is not found "})
            }
    
            const school = await SchoolUsers.find({schoolId: teacher.schoolId})
    
            if(!school || school.length === 0) {
                return res.status(404).json({message: "No school found"})
            }
         
            return res.status(200).json(school)
        
    } catch (error) {
        console.log(error)
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students." });
    }
})

//get all the class
teacherRouter.get("/getAllMyClasses", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id)
        if(!teacher) return res.status(404).json({message: "teacher is not found"})

        const school = await SchoolUsers.findOne({schoolId: teacher.schoolId})
        if(!school) return res.status(404).json({message: "school not found"})

         const classes = await schoolClass.find({ schoolId:  teacher.schoolId })
         return res.status(200).json(classes)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: " an error occurred from the server"})
    }
})





//assigns score to a student
teacherRouter.post("/assign-score", verifyToken, async(req, res) => {
    try {
        const { studentId, subject, academicSession, term, assignmentScore, firstTestScore, secondTestScore, examScore, comment } = req.body;
        const teacherId = req.user.id;

        let scoreEntry = await StudentScore.findOne({ studentId, subject, academicSession, term });


        if (scoreEntry) {
            // Update existing entry
            scoreEntry.assignmentScore = assignmentScore;
            scoreEntry.firstTestScore = firstTestScore;
            scoreEntry.secondTestScore = secondTestScore;
            scoreEntry.examScore = examScore;
            scoreEntry.comment = comment;
        } else {
            // Create new entry
            scoreEntry = new StudentScore({
                studentId,
                teacherId,
                subjectId: new mongoose.Types.ObjectId(subject),
                academicSession,
                term,
                assignmentScore,
                firstTestScore,
                secondTestScore,
                examScore,
                comment
            });
        }
        await scoreEntry.save();
        res.status(200).json({ message: "Score assigned successfully!" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error assigning score: " + error.message }); 
    }
})


//get my scores for all students

teacherRouter.get("/getmyassignedscores", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id)
        if(!teacher) return res.status(404).json({message: "user not found"})
        
        const admin = await SchoolUsers.findOne({schoolId: teacher.schoolId})
        if(!admin) return res.status(404).json({message: "admin details not found"})
        
        const teacherScore = await StudentScore.find({teacherId:req.user.id}).populate("studentId", "name email sclass").populate("subjectId", "name")
        if(!teacherScore) return res.status(404).json({message: "teacher score not found in the scores table"})
        
        console.log(teacherScore)

        return res.status(200).json(teacherScore)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "an error occurred from the server"})
    }
})


//get all scores from all the teachers 
teacherRouter.get("/getallassignedscores", verifyToken, async (req, res) => {
    try {
        
        const teacher = await SchoolUsers.findById(req.user.id);
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const teachers = await SchoolUsers.find({ schoolId: teacher.schoolId, role: "teacher" });
        if (teachers.length === 0) return res.status(404).json({ message: "No teachers found in this school" });

       
        const teacherIds = teachers.map(t => t._id);

       
        const teacherScores = await StudentScore.find({ teacherId: { $in: teacherIds } })
            .populate("teacherId", "name email")
            .populate("studentId", "name email sclass")
            .populate("subjectId", "name");

        if (teacherScores.length === 0) {
            return res.status(404).json({ message: "No scores found for teachers in this school" });
        }

        return res.status(200).json(teacherScores);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred on the server" });
    }
});

//post assignment
teacherRouter.post("/postassignmentforclass", verifyToken, async (req, res) => {
    try {
        const { classes, instructions, content } = req.body; 

        const teacher = await SchoolUsers.findById(req.user.id);
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

       
        const admin = await SchoolUsers.findOne({ schoolId: teacher.schoolId });
        if (!admin) return res.status(404).json({ message: "School admin not found" });

     

    
        const myData = new Assignment({
            classId: new mongoose.Types.ObjectId(classes),
            schoolId: teacher.schoolId,  
            teacherId: teacher._id,
            instructions,  
            content
        });

        await myData.save();

        return res.status(201).json( myData );
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred on the server" });
    }
});

//get all my assignments
teacherRouter.get("/getallassignments", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id);
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const assignments = await Assignment.find({ teacherId: req.user.id }).populate("classId", "name");
        
     
        return res.status(200).json(assignments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred from the server" });
    }
})

//get all assignments for teachers
teacherRouter.get("/getotherassignment", verifyToken, async(req, res) => {
    try {
        const teacher = await SchoolUsers.findById(req.user.id);
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const admin = await SchoolUsers.findOne({ schoolId: teacher.schoolId });
        if (!admin) return res.status(404).json({ message: "Admin details not found" });

        const assignments = await Assignment.find({ schoolId: teacher.schoolId }).populate("classId", "name").populate("teacherId", "name email");

    
        console.log("all assignments!!!!", assignments)
        return res.status(200).json(assignments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred from the server" });
    }
})


//get a student details in all schema in the database



// Get full details of a student
teacherRouter.get("/student/:studentId", verifyToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const teacher = await SchoolUsers.findById(req.user.id)
        if(!teacher) return res.status(404).json({message: "teacher not found"})
   

        const student = await SchoolUsers.findById(studentId)
            .populate("schoolId", "schoolName ")  
            .populate("subjects", "name") 
            .lean();  

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const scores = await StudentScore.find({ studentId })
            .populate("teacherId", "name ")  
            .populate("subjectId", "name")  
            .lean();

        console.log("!!!!", student, scores)
        return res.status(200).json({ student, scores });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});


teacherRouter.get("/getteachernotice", verifyToken, async(req, res) => {
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



//get all scores form all the teachers for the admin
// teacherRouter.get("/getallassignedscores", verifyToken, async (req, res) => {
//     try {
       
//         const admin = await SchoolUsers.findById(req.user.id);
//         if (!admin) return res.status(404).json({ message: "Admin not found" });

//         // Ensure the requester is actually an admin
//         if (admin.role !== "admin") {
//             return res.status(403).json({ message: "Unauthorized: Only admins can view all assigned scores" });
//         }

//         // Find all teachers in the same school as the admin
//         const teachers = await SchoolUsers.find({ schoolId: admin.schoolId, role: "teacher" });
//         if (teachers.length === 0) return res.status(404).json({ message: "No teachers found in this school" });

//         // Extract teacher IDs
//         const teacherIds = teachers.map((teacher) => teacher._id);

//         // Find all scores assigned by these teachers
//         const teacherScores = await StudentScore.find({ teacherId: { $in: teacherIds } })
//             .populate("studentId", "name email")
//             .populate("subjectId", "name");

//         if (teacherScores.length === 0) {
//             return res.status(404).json({ message: "No scores found for teachers in this school" });
//         }

//         return res.status(200).json(teacherScores);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "An error occurred on the server" });
//     }
// });


export default teacherRouter

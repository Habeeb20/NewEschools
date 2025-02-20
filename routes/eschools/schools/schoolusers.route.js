import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary"
import SchoolUsers from "../../../models/Eschools/schools/schoolUsers.js";
import User from "../../../models/Eschools/user.js";
import School from "../../../models/Eschools/schools/school.schema.js"
import jwt from "jsonwebtoken"
import { roleBasedAccess, Protect, verifyToken } from "../../../middleware/protect.js";
import nodemailer from "nodemailer"
import bcryptjs from "bcryptjs";
import noticeSchema from "../../../models/Eschools/schools/noticeSchema.js";
import Notice from "../../../models/Eschools/schools/noticeSchema.js";



const schooluserRouter = express.Router();



const transporter = nodemailer.createTransport(({
    service:'gmail',
    auth: {
       user:"essentialng23@gmail.com",
        pass:"clepxviuvbxqbedp"
      },
}));



const sendOTPEmail = async(email, otp) => {
    const mailOptions = {
        from:process.env.EMAIL_USER,
        to:email,
        subject: 'Verify your email',
        text: `Your verification code is: ${otp}`,

    };
    
  await transporter.sendMail(mailOptions);
}


schooluserRouter.post("/addstudents", Protect, async (req, res) => {
  const { name, email, sclass, password, role } = req.body;

  try {
   
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

  
    const school = await School.findOne({ userId: req.user._id });
    if (!school) {
      return res.status(403).json({ error: "No school found for this admin" });
    }


    const existingUser = await SchoolUsers.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: `User already exists with this email: ${email}` });
    }

   
    
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP & Unique Number
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const uniqueNumber = `RL-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; 

console.log("your class!!!", sclass)

    const newUser = await SchoolUsers.create({
      name,
      email,
      sclass,
      role,
      password: hashedPassword,
      schoolId: school._id, 
      uniqueNumber,
      verificationToken,
      verificationTokenExpiresAt,
    });

  

    res.status(201).json({ message: "User created successfully", newUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});


///login for the users

schooluserRouter.post("/loginusers", async(req, res) => {
   const {email, password} = req.body;

    try {
        const user = await SchoolUsers.findOne({email})
        if(!user) return res.status(404).json({message: "incorrect email"})
        const passwordCompare = await bcryptjs.compare(password, user.password)
        if(!passwordCompare) return res.status(404).json({message:"incorrect password"})
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"})

        res.status(200).json({success: true, message: "succesfully logged in ", user, token})
        console.log("user details", user, token)
    } catch (error) {
        console.error('Error in login: ', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})


schooluserRouter.get("/userdashboard", Protect, async(req, res) => {
    const userId = req.user.id
    try {
        const user = await SchoolUsers.findById(userId)
        if(!user){
            return res.status(404).json({message: "not found"})
    
        }
    
        return res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "an error occurred"})
    }
})

//get all his staff

schooluserRouter.get("/getusers", Protect, async (req, res) => {
    try {
     
      const school = await School.findOne({ userId: req.user._id });
  
      if (!school) {
        return res.status(403).json({ error: "No school found for this admin" });
      }
  
   
      const users = await SchoolUsers.find({ schoolId: school._id });
  
      if (users.length === 0) {
        return res.status(404).json({ message: "No users found for this school" });
      }
  
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });


  //get each student by their class


  schooluserRouter.get("/getstudentsByClass", Protect, async (req, res) => {
    try {
      
      const school = await School.findOne({ userId: req.user._id });
  
      if (!school) {
        return res.status(403).json({ error: "No school found for this admin" });
      }
  
      
      const students = await SchoolUsers.find({ schoolId: school._id, role: "student" });

      if (!students || students.length === 0) {
        return res.status(404).json({ message: "No students found for this school" });
      }
      
      const studentsByClass = students.reduce((acc, student) => {
        const classId = student.sclass || "Unassigned"; 
        if (!acc[classId]) {
          acc[classId] = [];
        }
        acc[classId].push(student);
        return acc;
      }, {});
  
      res.status(200).json(studentsByClass);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });
  


//get userBy role

schooluserRouter.get("/getusersByrole", Protect, async (req, res) => {
    try {
      const { role } = req.query;
      
      if (!role) {
        return res.status(400).json({ error: "Role is required" });
      }
  
      const school = await School.findOne({ userId: req.user._id });
      if (!school) {
        return res.status(403).json({ error: "No school found for this admin" });
      }
  
      const users = await SchoolUsers.find({
        schoolId: school._id, 
        role: new RegExp("^" + role + "$", "i"), 
      });
  
      if (users.length === 0) {
        return res.status(404).json({ message: `No users found with role: ${role}` });
      }
      console.log(users)
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users by role:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });


//get all students by  an admin


schooluserRouter.get("/getmystudents", Protect, async (req, res) => {
    try {

        const school = await School.findOne({ userId: req.user._id });

        if (!school) {
            return res.status(404).json({ message: "School not found for this account." });
        }


        const users = await SchoolUsers.find({ schoolId: school._id, role: "student" });;

        if (users.length === 0) {
            return res.status(404).json({ message: "No students found for this school." });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: "Failed to fetch students." });
    }
});


///get all teachers by an admin


schooluserRouter.get("/getmyteachers", Protect, async (req, res) => {
    try {

        const school = await School.findOne({ userId: req.user._id });

        if (!school) {
            return res.status(404).json({ message: "School not found for this account." });
        }


        const users = await SchoolUsers.find({ schoolId: school._id, role: "teacher" });

        if (users.length === 0) {
            return res.status(404).json({ message: "No teacher found for this school." });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching teacher:", error);
        res.status(500).json({ error: "Failed to fetch teachers." });
    }
});


///get all other staffs by an admin


schooluserRouter.get("/getmyotherstaff", Protect, async (req, res) => {
    try {

        const school = await School.findOne({ userId: req.user._id });

        if (!school) {
            return res.status(404).json({ message: "School not found for this account." });
        }


        const users = await SchoolUsers.find({ schoolId: school._id, role: "otherStaff" });

        if (users.length === 0) {
            return res.status(404).json({ message: "No staff found for this school." });
        }

        return res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({ error: "Failed to fetch staffs." });
    }
});

  


///updating the data

schooluserRouter.put("/editstudent/:id", Protect, async (req, res) => {
    const { name, email, sclass, role, password } = req.body;
  
    try {
      const student = await SchoolUsers.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      // Check if the admin owns the school
      const school = await School.findOne({ userId: req.user._id, _id: student.schoolId });
      if (!school) {
        return res.status(403).json({ error: "Unauthorized to edit this student" });
      }
  
      // If password is being updated, hash it
      let hashedPassword = student.password;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }
  
      student.name = name || student.name;
      student.email = email || student.email;
      student.sclass = sclass || student.sclass;
      student.role = role || student.role;
      student.password = hashedPassword;
  
      await student.save();
  
      res.status(200).json({ message: "Student updated successfully", student });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });

  

  //deleting the data

  schooluserRouter.delete("/deletestudent/:id", Protect, async (req, res) => {
    try {
      const student = await SchoolUsers.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      // Check if the admin owns the school
      const school = await School.findOne({ userId: req.user._id, _id: student.schoolId });
      if (!school) {
        return res.status(403).json({ error: "Unauthorized to delete this student" });
      }
  
      await SchoolUsers.findByIdAndDelete(req.params.id);
  
      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });
  

//get a single student
  schooluserRouter.get("/getstudent/:id", Protect, async (req, res) => {
    try {
      const student = await SchoolUsers.findById(req.params.id).populate("schoolId", "name");
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
  
      res.status(200).json(student);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  });


  ///make announcement
  schooluserRouter.post("/postnotice", verifyToken, async(req, res) => {
    const {issue} = req.body
    try {
      const admin = await User.findById(req.user.id)
      if(!admin) return res.status(404).json({message:"not found"})
      
        
        const school = await School.findOne({ userId: req.user.id });
        if (!school) {
            return res.status(404).json({ error: "No school found for this user" });
        }

       

      const newNotice = new noticeSchema({
        schoolId: school.id,
        issue
      })
      await newNotice.save()
      return res.status(200).json("successfully sent")
    } catch (error) {
      console.log(error)
      return res.status(500).json({message:"an error occurred"})
    }
  })
  

  ///get announcement

  schooluserRouter.get("/getnotices", verifyToken, async (req, res) => {
    try {
       
        const school = await School.findOne({ userId: req.user.id });
        if (!school) {
            return res.status(404).json({ message: "No school found for this user." });
        }

        const notices = await Notice.find({ schoolId: school._id }) 
            .populate("schoolId", "name") 
            .sort({ createdAt: -1 }); 

        
        if (notices.length === 0) {
            return res.status(404).json({ message: "No announcements found for this school." });
        }

        return res.status(200).json(notices);
    } catch (error) {
        console.error("Error fetching notices:", error);
        return res.status(500).json({ message: "An error occurred while fetching announcements." });
    }
});

export default schooluserRouter;

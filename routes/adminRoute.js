import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import  Book from  "../models/bookshop.js"
import  Exam from "../models/exam.js"
import Report from "../models/report.js"
import Request from "../models/request.js"
import School from "../models/school.js"
import Store from "../models/store.js"
import Teacher from "../models/teacher.js"
import Training from "../models/training.js"
import Tutorial from "../models/tutorial.js"
import Admin from "../models/admin.js"


const adminrouter = express.Router()

adminrouter.get("/schools", async(req, res) => {
    try {
        const users = await School.find({});
        res.json(users);

    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.message})
    }
})


adminrouter.get("/training", async(req, res) => {
    try {
        const users = await Training.find({});
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
})



adminrouter.get("/tutorial", async (req, res) => {
    try {
        const users = await Tutorial.find({});
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
})


adminrouter.get("/exam", async(req, res) => {
    try {
        const users = await Exam.find({})
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
})


adminrouter.get("/store", async(req, res) => {
    try {
        const users = await Store.find({})
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
})


adminrouter.get("/teacher", async (req, res) => {
    try {
        const users = await Teacher.find({})
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
}) 

adminrouter.get("/book", async(req, res) => {
    try {
        const users = await Book.find({})
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
})

adminrouter.get("/report", async(req, res) => {
    try {
        const users = await Report.find({})
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
})

adminrouter.get("/request", async(req, res) => {
    try {
        const users = await Request.find({})
        res.json(users)
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: error.message});
    }
})


adminrouter.post('/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
  
    try {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      });
  
      await newAdmin.save();
      res.status(201).json({ message: 'Admin registered successfully' });
    } catch (error) {
        console.log(error)
      res.status(500).json({ message: 'Error registering admin', error });
    }
  });
  


  adminrouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ message: 'Admin not found' });
      }
  
      const isMatch = await bcrypt.compare(password, admin.password);
    //   if (!isMatch) {
    //     console.log("incorrect password")
    //     return res.status(400).json({ message: 'Invalid credentials' });
    //   }
  
      const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ token });
    } catch (error) {
        console.log(error)
      res.status(500).json({ message: 'Error logging in', error });
    }
  });

export default adminrouter
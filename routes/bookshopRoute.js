import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Bookshop from "../models/bookshop.js";
import asyncHandler from "express-async-handler";
import pkg from "cloudinary";
import upload from "../upload.js";
import { protect5 } from "../middleware/auth.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer"
const { v2: cloudinary } = pkg;


const router = express.Router()
// Cloudinary setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: 624216876378923,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: "schools" },
  });


  const transporter = nodemailer.createTransport(({
    service:'gmail',
    auth: {
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
 
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


//forgot password
router.post("/forgot-password", async(req, res) => {
  const { email } = req.body;
	try {
		const user = await Bookshop.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

	  // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = jwt.sign({ resetToken }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send an email with the reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user:"babatundeademola112@gmail.com",
        pass:"pknseuxqxzkoqdjg"
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link below to reset your password: \n\n ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
})


//reset your password
router.post("/reset-password/:token", async(req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

try {
// Verify the reset token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const { resetToken } = decoded;

// Find the user by the token
const user = await Bookshop.findOne({ resetToken });
if (!user) {
  return res.status(404).json({ message: 'Invalid token' });
}

// Hash the new password
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(newPassword, salt);

await user.save();

res.status(200).json({ message: 'Password reset successfully' });
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
})


  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;
  
      if (!username || !password) {
        res.status(400);
        throw new Error("Username and password are required.");
      }
  
      const existingexam = await Bookshop.findOne({ username });
      if (existingexam) {
        res.status(400);
        throw new Error("User with this username already exists.");
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const exam = new Bookshop({
        username,
        password: hashedPassword,
      });
  
      await exam.save();
  
      res.status(201).json({
        message: "User registered successfully.",
        exam,
      });
    })
  );

  router.post("/login", asyncHandler(async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400);
        throw new Error("Username and password are required.");
      }
      const user = await Bookshop.findOne({ username });
      if (!user) {
        res.status(404).json({ message: "Invalid username " });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(404);
        throw new Error("Invalid  password.");
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({
        message:"Login successful",
        token, user})
  
  }))


  router.get('/dashboard', protect5,  asyncHandler(async(req, res) => {
    const userId = req.user.id;

    const user = await Bookshop.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.status(200).json(user);

  }))

  router.put("/:id", protect5, asyncHandler(async(req, res) => {
    const {id} = req.params

    const exam = await Bookshop.findById(id);
    if (!exam) {
      res.status(404);
      throw new Error("School not found.");
    }

    if (exam._id.toString() !== req.user.id) {
        res.status(403);
        throw new Error("Not authorized to update this school.");
      }
      const updates = { ...req.body };

      const uploadFile = async (file) => {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "schools",
        });
        return result.secure_url;
      };

      if (req.files) {
        if (req.files.picture1) {
          updates.picture1 = await uploadFile(req.files.picture1);
        }
        if (req.files.picture2) {
          updates.picture2 = await uploadFile(req.files.picture2);
        }
        if (req.files.picture3) {
          updates.picture3 = await uploadFile(req.files.picture3);
        }
        if (req.files.picture4) {
          updates.picture4 = await uploadFile(req.files.picture4);
        }
        if (req.files.picture5) {
          updates.picture5 = await uploadFile(req.files.picture5);
        }
        if (req.files.picture6) {
          updates.picture6 = await uploadFile(req.files.picture6);
        }
        if (req.files.picture7) {
          updates.picture7 = await uploadFile(req.files.picture7);
        }
        if (req.files.picture8) {
          updates.picture8 = await uploadFile(req.files.picture8);
        }
        if (req.files.picture9) {
          updates.picture9 = await uploadFile(req.files.picture9);
        }
        if (req.files.picture10) {
          updates.picture10 = await uploadFile(req.files.picture10);
        }
    }

    const updatedExam = await Bookshop.findByIdAndUpdate(id, updates, {
        new: true,
      });
      if (!updatedExam) {
        res.status(500);
        throw new Error("Failed to update exam.");
      }
      res.status(200).json({
        message: "Exam updated successfully.",
        updatedExam,
      });


  }))

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const { id } = req.params;
  
      const school = await Bookshop.findById(id);
      if (!school) {
        res.status(404);
        throw new Error("exam not found.");
      }
  
      await school.remove();
      res.status(200).json({ message: "exam deleted successfully." });
    })
  );

  
  router.get("/",  asyncHandler(async (req, res) => {
    try {
      const exam = await Bookshop.find({});
      res.json(exam);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }) )

    // Get share count
router.get("/:id/shares", async (req, res) => {
  try {
    const { id } = req.params;

    const exam = await Bookshop.findById(id);

    if (!exam) {
      return res.status(404).json({ message: "exam not found" });
    }
    res.status(200).json({ shareCount: exam.shares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


  // Increment share count
  router.post("/:id/shares", async(req, res) => {
    try {
      const { id } = req.params;
    
      const exam = await Bookshop.findByIdAndUpdate(
        id,
        { $inc: { shares: 1 } }, 
        { new: true } 
      );
    
      if (!exam) {
         return res.status(404).json({ message: "bookshop  not found" });
      }
    
      res.status(200).json({ message: "Share count updated.", shareCount: exam.shares });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  })


    //view more count

// Route to increment click count
router.post("/:id/click", async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Bookshop.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({ message: "School not found" });
    }

    res
      .status(200)
      .json({ message: "Click count updated", clicks: exam.clicks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


  // Get the click count for a specific school
  router.get("/get-clicks/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      const exam = await Bookshop.findById(id);
  
      if (!exam) {
        return res.status(404).json({ message: "exam not found" });
      }
  
      res.status(200).json({ clicks: exam.clicks });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });


  router.get("/get-clicks", async (req, res) => {
    try {
      const exams = await Bookshop.find({}, "exam clicks"); // Fetch school name and clicks only
  
      res.status(200).json(exams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });



  router.get("/abookshop/:id", async (req, res) => {
    console.log("Request parameters:", req.params);
    try {
      const { id } = req.params;
      console.log(req.params);
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log("id not found");
        return res
          .status(400)
          .json({ success: false, message: "Invalid user ID" });
      }
  
      const exam = await Bookshop.findById(id);
  
      if (!exam) {
        console.log("bookshop not found");
        return res
          .status(404)
          .json({ success: false, message: "exam not found" });
      }
  
      res.status(200).json({
        success: true,
       exam
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  });



  router.get("/countbookshop", async (req, res) => {
    try {
      const { locations } = req.query;
  
      if (!locations || !Array.isArray(locations)) {
        return res.status(400).json({
          message: "Locations query parameter must be an array of strings",
        });
      }
  
      const counts = await Promise.all(
        locations.map(async (loc) => {
          const count = await Bookshop.countDocuments({
            location: { $regex: loc, $options: "i" },
          });
          return { location: loc, count };
        })
      );
  
      res.json(counts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  });

  router.get("/count", async (req, res) => {
    try {
      const teacherCount = await Bookshop.countDocuments();
      res.status(200).json({ count: teacherCount });
    } catch (error) {
      console.error("Error fetching teacher count:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });



  export default router












import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import School from "../models/school.js";
import asyncHandler from "express-async-handler";
import pkg from "cloudinary";
import upload from "../upload.js";
import { protect } from "../middleware/auth.js";
import mongoose from "mongoose";
import crypto from "crypto"
import nodemailer from "nodemailer"
const { v2: cloudinary } = pkg;
const router = express.Router();
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
  const user = await School.findOne({ email });

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
const user = await School.findOne({ resetToken });
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

    const existingSchool = await School.findOne({ username });
    if (existingSchool) {
      res.status(400);
      throw new Error("User with this username already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const school = new School({
      username,
      password: hashedPassword,
    });

    await school.save();

    res.status(201).json({
      message: "User registered successfully.",
      school,
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({message:"Username and password are required."});
    }

    const user = await School.findOne({ username });
    if (!user) {
      res.status(404).json({ message: "Invalid username " });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(404).json({message:"Invalid  password."});
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        schoolName: user.schoolName,
        email: user.email,
        discount: user.discount,
        percent: user.percent,
        duration: user.duration,
        departments: user.departments,
        faculty: user.faculty,
        admissionStartDate: user.admissionStartDate,
        admissionEndDate: user.admissionEndDate,
        admissionRequirements: user.admissionRequirements,
        phone: user.phone,
        category: user.category,
        state: user.state,
        LGA: user.LGA,
        schoolFees: user.schoolFees,
        onBoarding: user.onBoarding,
        schoolPicture: user.schoolPicture,
        coverPicture: user.coverPicture,
        picture: user.picture,
        location: user.location,
        picture1: user.picture1,
        picture2: user.picture2,
        picture3: user.picture3,
        picture4: user.picture4,
        TC: user.TC,
        schoolNews: user.schoolNews,
        history: user.history,
        vcpicture: user.vcpicture,
        vcspeech: user.vcspeech,
      },
    });
  })
);

router.get(
  "/dashboard",
  protect,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await School.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.status(200).json(user);
  })
);

// Update a school
router.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if the school exists
    const school = await School.findById(id);
    if (!school) {
      res.status(404);
      throw new Error("School not found.");
    }

    // Check if the logged-in user is authorized to update this school
    if (school._id.toString() !== req.user.id) {
      res.status(403);
      throw new Error("Not authorized to update this school.");
    }

    const updates = { ...req.body };

    // Handle file uploads
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
      if (req.files.schoolPicture) {
        updates.schoolPicture = await uploadFile(req.files.schoolPicture);
      }
      if (req.files.coverPicture) {
        updates.coverPicture = await uploadFile(req.files.coverPicture);
      }
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
      if (req.files.vcpicture) {
        updates.vcpicture = await uploadFile(req.files.vcpicture);
      }
    }

    // Update the school
    const updatedSchool = await School.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedSchool) {
      res.status(500);
      throw new Error("Failed to update school.");
    }

    res.status(200).json({
      message: "School updated successfully.",
      updatedSchool,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const school = await School.findById(id);
    if (!school) {
      res.status(404);
      throw new Error("School not found.");
    }

    await school.remove();
    res.status(200).json({ message: "School deleted successfully." });
  })
);

// Get all schools
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const schools = await School.find({});
      res.json(schools);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
);


// Get share count
router.get("/:id/shares", async (req, res) => {
  try {
    const { id } = req.params;

    const school = await School.findById(id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    res.status(200).json({ shareCount: school.shares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});



// Increment share count
router.post("/:id/shares", async(req, res) => {
  try {
    const { id } = req.params;
  
    const school = await School.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 } }, 
      { new: true } 
    );
  
    if (!school) {
       return res.status(404).json({ message: "School not found" });
    }
  
    res.status(200).json({ message: "Share count updated.", shareCount: school.shares });
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
    const school = await School.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res
      .status(200)
      .json({ message: "Click count updated", clicks: school.clicks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});





// Get the click count for a specific school
router.get("/get-clicks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const school = await School.findById(id);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    res.status(200).json({ clicks: school.clicks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get click counts for all schools
router.get("/get-clicks", async (req, res) => {
  try {
    const schools = await School.find({}, "schoolName clicks"); // Fetch school name and clicks only

    res.status(200).json(schools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//getasingleschool

router.get("/aschool/:id", async (req, res) => {
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

    const school = await School.findById(id);

    if (!school) {
      console.log("school not found");
      return res
        .status(404)
        .json({ success: false, message: "school not found" });
    }

    res.status(200).json({
      success: true,
      school,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});
//add comment
router.post("/:id/comments", async (req, res) => {
  const { name, text } = req.body;
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    const newComment = { name, text };
    school.comments.push(newComment);
    await school.save();
    res.status(201).json({ comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//countSchools

router.get("/countSchools", async (req, res) => {
  try {
    const { locations } = req.query;

    if (!locations || !Array.isArray(locations)) {
      return res.status(400).json({
        message: "Locations query parameter must be an array of strings",
      });
    }

    const counts = await Promise.all(
      locations.map(async (loc) => {
        const count = await School.countDocuments({
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

router.get("/schoolscompare", async (req, res) => {
  try {
    const { location, schoolFees, onBoarding, schoolName } = req.query;

    // Construct query to match any of the provided search parameters
    const query = [];

    if (location && typeof location === "string") {
      query.push({ location: { $regex: location, $options: "i" } });
    }
    if (schoolFees && !isNaN(parseInt(schoolFees))) {
      query.push({ schoolFees: parseInt(schoolFees) });
    }
    if (onBoarding !== undefined) {
      query.push({ onBoarding: JSON.parse(onBoarding.toLowerCase()) });
    }
    if (schoolName && typeof schoolName === "string") {
      query.push({ name: { $regex: name, $options: "i" } });
    }

    const schools = await School.find({ $or: query });
    res.json(schools);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/comparison", async (req, res) => {
  const { school } = req.query;
  try {
    const school1 = await School.findOne({
      school: new RegExp(`^${school}$`, "i"),
    }); 
    if (school1) {
      res.json(school1);
    } else {
      res.status(404).json({ message: "School not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





//category count

router.get('/category/counts', async(req, res) => {
  try {
    const categoryCounts = {
      primary: await School.countDocuments({ category: 'primary' }),
      secondary: await School.countDocuments({ category: 'secondary' }),
      college: await School.countDocuments({ category: 'college' }),
      polytechnic: await School.countDocuments({ category: 'polytechnic' }),
      university: await School.countDocuments({ category: 'university' })
    };

    res.json(categoryCounts);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})




router.get('/location/counts', async (req, res) => {
  try {

    const states = [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
      'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
      'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
      'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ];


    const stateCounts = {};

    for (const state of states) {
      const count = await School.countDocuments({ state: state });
      stateCounts[state] = count;
    }


    res.json(stateCounts);

  } catch (error) {
    console.error('Error fetching state counts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

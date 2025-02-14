import User from "../../models/Eschools/user.js";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import express from "express";
import cloudinary from "cloudinary"
import nodemailer from "nodemailer"

import crypto from "crypto"
import { verifyToken } from "../../middleware/protect.js";

const userRouter = express.Router()



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})


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


userRouter.post("/signup", async(req, res) => {
    const {email, password, role} = req.body;

    try {
        if(!email || !password){
            console.log("password and email required")
            return res.status(400).json({message: "email, password and role are required"})
        }

        const existingUser = await User.findOne({email})
        if(existingUser) return res.status(400).json({message: "email already exists"})
        
       const hashedPassword = await bcryptjs.hash(password, 10);
       const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // OTP generation
       const uniqueNumber = `RL-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
       const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

       const user = new User({
        email, password:hashedPassword, role,
        uniqueNumber,
        verificationToken,
        verificationTokenExpiresAt,
       })
       
    await user.save();
    
    await sendOTPEmail(user.email, verificationToken);

    return res.status(201).json({
        message: "user registered successfully, check your email to get verify your account",
        user: { ...user._doc, password: undefined },})
    
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong during registration' });
    }
})


userRouter.post("/login", async(req, res) => {
    const {role, password, email} = req.body;
    console.log(req.body)

    try {
        if(!role || !password ||!email){
            return res.status(400).json({message: "all fields are required"})
        }
        const user = await User.findOne({email})
        if(!user ) return res.status(404).json({message: "incorrect email"})
        const passwordCompare = await bcryptjs.compare(password, user.password)
        if(!passwordCompare) return res.status(404).json({message: "incorrect password"})
        if(user.role !== role) return res.status(403).json({message: `you sign up as ${user.role}. Please log in as a ${user.role}.`})

        user.lastlogin = new Date()
        await user.save()

        const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:'7d'})

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            user,
            token
        })
        console.log('user details',user, token)
    } catch (error) {
        console.error('Error in login: ', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})

userRouter.post("/verify-email", async(req, res) => {
    const {code} = req.body;

    try {
        const user = await User.findOne({
            verificationToken:code,
            verificationTokenExpiresAt:{ $gt: Date.now() },
        })
        if(!user) {
            return res.status(400).json({success:false, message:"Invalid or expired verification code"})
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save()

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: { ...user._doc, password: undefined },
        })
    
    } catch (error) {
        console.error('Error in verifyEmail: ', error)
        res.status(500).json({ success: false, message: 'Server error' });
    }
})

userRouter.get("/dashboard", verifyToken, async(req, res) => {
    const userId = req.user.id;

    const user = await User.findById(userId)
    if(!user){
        return res.status(404).json({message: "not found"})

    }

    return res.status(200).json(user)
})


userRouter.post("/forgotpassword", async(req, res) => {
    const {email} = req.body;

    try {
		const user = await User.findOne({ email });

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
        user:"essentialng23@gmail.com",
      pass:"clepxviuvbxqbedp"
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

userRouter.post("/reset-password/:token", async(req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify the reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { resetToken } = decoded;
      
        // Find the user by the token
        const user = await User.findOne({ resetToken });
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

export default userRouter
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            unique:true,
            required:true
        },
        password:{
            type:String,
            required: true
        },
        role:{
            type:String,
            required:true,
            enum:["school-administrator", "store-owner", "tutorial-center"]
          },
          isVerified: {type: Boolean,default: false},
          status: { type: String, enum: ['active', 'blocked', 'pending'], default: 'pending' },
          createdAt: { type: Date, default: Date.now },
          registrationDate: { type: Date, default: Date.now },
          uniqueNumber: { type: String, unique: true },
          resetPasswordToken: String,
          resetPasswordExpiresAt: Date,
          verificationToken: String,
          verificationTokenExpiresAt: Date,
    },
    { timestamps: true }

)

export default mongoose.model("User", userSchema)
import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolName: { type: String, required: true },
    phone: String,
    discount: String,
    discountText: String,
    percent: String,
    duration: String,

    departments: [String],
    faculties: [String],

    admissionStartDate: { type: Date,  },
    admissionEndDate: { type: Date,  },
    admissionRequirements: String,
    category: String,

    location: {
      state: String,
      LGA: String,
      address: String,
    },

    schoolFees: [
      {
        class: String,
        amount: String,
      },
    ],

    onBoarding: String,
    schoolBus: String,
    
    // Image Uploads
    pictures: {
      main: String,
      school: String,
      cover: String,
      additional: [String], // Stores multiple additional pictures
      vc: String, // Vice Chancellor's picture
    },

    schoolNews: String,
    history: String,
    vcspeech: String,
    AO: String,
    ownership: String,

    jobVacancies: [
      {
        position: String,
        salary: String,
        qualification: String,
      },
    ],

    comments: [
      {
        name: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    clicks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("School1", schoolSchema);

import mongoose from "mongoose";

const studentScoreSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "schooluser", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "schooluser", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    academicSession: { type: String, required: true },  
    term: { type: String, required: true, enum: ["First Term", "Second Term", "Third Term"] },
    
    assignmentScore: { type: Number, default: 0 },
    firstTestScore: { type: Number, default: 0 },
    secondTestScore: { type: Number, default: 0 },
    examScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },  
    grade: { type: String },
    comment: { type: String },

    createdAt: { type: Date, default: Date.now }
});

// Auto-calculate total score before saving
studentScoreSchema.pre("save", function (next) {
    this.totalScore = this.assignmentScore + this.firstTestScore + this.secondTestScore + this.examScore;

    // Assign grade based on total score
    if (this.totalScore >= 70) this.grade = "A";
    else if (this.totalScore >= 60) this.grade = "B";
    else if (this.totalScore >= 50) this.grade = "C";
    else if (this.totalScore >= 40) this.grade = "D";
    else this.grade = "F";

    next();
});

export default mongoose.model("StudentScore", studentScoreSchema);


import express from "express";
import Subject from "../../../models/Eschools/schools/schoolSubject.js"

const scoreRouter = express.Router()
// Update student score in a subject
scoreRouter.put("/update-score/:subjectId/:studentId", async (req, res) => {
    try {
        const { firstTest, secondTest, exam } = req.body;
        const { subjectId, studentId } = req.params;

        // Calculate total score
        const total = firstTest + secondTest + exam;

        // Assign grade based on total score
        let grade = "F";
        if (total >= 70) grade = "A";
        else if (total >= 60) grade = "B";
        else if (total >= 50) grade = "C";
        else if (total >= 40) grade = "D";

        // Update the student's score inside the subject
        const subject = await Subject.findOneAndUpdate(
            { _id: subjectId, "students.studentId": studentId },
            {
                $set: {
                    "students.$.scores": { firstTest, secondTest, exam, total, grade }
                }
            },
            { new: true }
        );

        if (!subject) return res.status(404).json({ message: "Subject or student not found" });

        res.status(200).json({ message: "Score updated successfully", subject });
    } catch (error) {
        res.status(500).json({ error: "Failed to update score" });
    }
});

// Get scores for a student in all subjects
scoreRouter.get("/student-scores/:studentId", async (req, res) => {
    try {
        const { studentId } = req.params;

        const subjects = await Subject.find({ "students.studentId": studentId })
            .select("name students")
            .populate("students.studentId");

        // Filter only scores for the requested student
        const scores = subjects.map(subject => ({
            subject: subject.name,
            scores: subject.students.find(s => s.studentId._id.toString() === studentId)?.scores
        }));

        res.status(200).json(scores);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch scores" });
    }
});

export default scoreRouter

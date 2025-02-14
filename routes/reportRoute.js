import express from "express";
import Report from "../models/report.js"


const reportRouter = express.Router()

reportRouter.get("/getreports", async(req, res) => {
    try {
        const reports = await Report.find();
        res.status(200).json(reports)
    } catch (error) {
        res.status(400).json({error: error.message})
    }

} )
reportRouter.post("/postreports", async(req, res) => {
    const { nameOfReporter, emailOfReporter, phonenum, school, emailOfReported, offense } = req.body;

    console.log(req.body)

    try {
        const report = new Report({
            nameOfReporter,
            emailOfReporter,
            phonenum,
            school,
            emailOfReported,
            offense
        })

        await report.save();

        return res.status(201).json({message: "report successfully  registered", report})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "server error"})
    }
})

export default reportRouter
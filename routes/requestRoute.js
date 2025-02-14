import express from "express";
import Request from "../models/request.js"
const requestRouter = express.Router()


requestRouter.get("/getrequests", async(req, res) => {
    try {
        const request = await Request.find();
        res.status(200).json(request)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})
requestRouter.post("/postrequests", async(req, res) => {
    const {nameOfUser, emailOfUser, phone,  request } = req.body

    console.log(req.body)

    try {
        const newrequest = new Request({
            nameOfUser,
            emailOfUser,
            phone,
            request
        })

        await newrequest.save();

        return res.status(201).json({message: "request successfully sent"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "an error occurred during submission"})
    }
})


export default requestRouter
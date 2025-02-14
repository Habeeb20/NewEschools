import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import connectDb from "./db.js";
import morgan from "morgan"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import router from "./routes/schoolRoute.js";
import reportRouter from "./routes/reportRoute.js";
import requestRouter from "./routes/requestRoute.js";
// import visitorRoute from "./routes/visitorStats.js";
import examRoute from "./routes/examRoute.js"
import trainingRoute from "./routes/trainingRoute.js"
import teacherRoute from "./routes/teacherRoute.js"
import All from "./routes/allRoute.js"
import bookRoute from "./routes/bookshopRoute.js"
import tutorialRoute from "./routes/tutorial.js"
import storeRoute from "./routes/storeRoute.js"
import { v4 as uuidv4 } from 'uuid';
import Visitor from "./models/visitors.js";

import authJobrouter from "./routes/job/authejobsRoute.js";
import postjobroute from "./routes/job/employerRoute.js";
import applyjobroute from "./routes/job/JobseekerRoute.js";
import adminrouter from "./routes/adminRoute.js";
import paymentrouter from "./routes/paymentRoute.js";
import userRouter from "./routes/eschools/user.route.js";
import userPaymentrouter from "./routes/eschools/userPayment.js";
import schoolrouter from "./routes/eschools/schools/schools.route.js";
import schooluserRouter from "./routes/eschools/schools/schoolusers.route.js";
import classRouter from "./routes/eschools/schools/class.router.js";
import subjectRouter from "./routes/eschools/schools/subject.route.js";
dotenv.config();


connectDb()

const app = express()
app.use(express.json())


// app.use(cors("https://eschoolconnect.ng/"))

app.use(cors("*"))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cookieParser()); 








const PORT =9000

//Eschool
app.use("/eschools/user", userRouter)
app.use("/eschools/payment", userPaymentrouter)
app.use("/eschools/schools", schoolrouter)
app.use("/eschools/schools", schooluserRouter)
app.use("/eschools/schools", classRouter )
app.use("/eschools/schools", subjectRouter)











app.use("/schools", router)

app.use("/job", authJobrouter)
app.use("/job", postjobroute)
app.use("/job", applyjobroute)


//request & report
app.use("/report", reportRouter)
app.use("/request", requestRouter)


//visitor
// app.use("/visitor", visitorRoute)

//exam 
app.use("/exam", examRoute)

//training
app.use("/training", trainingRoute )


//teacher
app.use("/teacher", teacherRoute)


//all
app.use("/all", All)


app.use("/book", bookRoute)


app.use("/tutorial", tutorialRoute)

app.use("/store", storeRoute)

app.use("/admin", adminrouter)

app.use("/api/payment", paymentrouter)

 // Start server
 app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

app.get("/", (req, res) => {
    res.json("the api for eschools is perfectly working right now.......")
  })
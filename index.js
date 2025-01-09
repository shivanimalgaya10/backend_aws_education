import express, { urlencoded } from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import dotenv from 'dotenv'
import userRoute from './routes/user.route.js'
import connectDB from "./utils/db.js"
import postRoute from './routes/post.route.js'
import messageRoute from './routes/message.route.js'
import collegeRoute from './routes/admin/college.route.js';
import getCollegeRoute from './routes/user/getcollege.route.js'
import { College } from "./models/admin/college.model.js"
import nodemailer from 'nodemailer'



dotenv.config({})
const app =express();
const PORT=process.env.PORT || 8000



//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({extended:true}))
const corsOptions={
    origin: ['https://education.blackgrapesgroup.com','https://admin.blackgrapesgroup.com'], // The frontend origin
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], // Specify allowed headers

}
app.use(cors(corsOptions))
app.get("/",(_,res)=>{
  return res.status(200).json({
      message:'I am coming  from backend',
      success:true
  })
})

//yha pr apni api aayengi
app.use("/api/v1/user",userRoute)
app.use('/api/v1/post',postRoute)
app.use('/api/v1/message',messageRoute)
app.use('/api/v1/getcollege', getCollegeRoute)

app.use('/api/v1/admin/college', collegeRoute);

app.post("/send-email", async (req, res) => {
    const { fullName, phoneNumber, email, dob, city, courseType, course, collegeName } = req.body;
  
    if (!fullName || !phoneNumber || !email || !dob || !city || !courseType || !course || !collegeName) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      // Create a transporter object
      const transporter = nodemailer.createTransport({
        service: "gmail", // e.g., use Gmail or another service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
      });
  
      // Email content
      const mailOptions = {
        from: email,
        to: "shivanimalgaya10@gmail.com", // Send confirmation to the applicant
        subject: `Application Received for ${collegeName}`,
        html: `
          <h1>Application Confirmation</h1>
          <p>Dear ${fullName},</p>
          <p>Thank you for applying to <strong>${collegeName}</strong>.</p>
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Phone Number:</strong> ${phoneNumber}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Date of Birth:</strong> ${dob}</li>
            <li><strong>City:</strong> ${city}</li>
            <li><strong>Course Type:</strong> ${courseType}</li>
            <li><strong>Course:</strong> ${course}</li>
          </ul>
          <p>We will contact you soon for the next steps.</p>
          <p>Regards,</p>
          <p>${collegeName} Admissions Team</p>
        `,
      };
  
      // Send the email
      const info = await transporter.sendMail(mailOptions);
  
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
      console.error("Error sending email: ", error);
      res.status(500).json({ message: "Error sending email" });
    }
  });



app.listen(PORT,()=>{
    connectDB()
  console.log(`server listen at port ${PORT}`);
 })
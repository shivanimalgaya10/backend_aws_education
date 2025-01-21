import express, { urlencoded } from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import dotenv from 'dotenv'
import userRoute from './routes/user.route.js'
import connectDB from "./utils/db.js"
import postRoute from './routes/post.route.js'
import messageRoute from './routes/message.route.js'
import collegeRoute from './routes/admin/college.route.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'

import getCollegeRoute from './routes/user/getcollege.route.js'
import nodemailer from 'nodemailer'

dotenv.config({})
const app =express();
const PORT=process.env.PORT || 8000


const corsOptions={
    origin: ['https://education.blackgrapesgroup.com','https://admin.blackgrapesgroup.com'], // The frontend origin
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], // Specify allowed headers

}

app.use(cors(corsOptions))

// Set the Content Security Policy (CSP) header
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +  // Allow resources from same origin
    "connect-src 'self' https://api.phonepe.com; " +  // Allow connections to PhonePe API
    "script-src 'self'; " +   // Allow scripts from same origin
    "style-src 'self' 'unsafe-inline'; " + // Allow styles from same origin and inline styles
    "img-src 'self' data:; " +  // Allow images from same origin and inline images
    "frame-src 'self'; "  // Allow iframes from the same origin
  );
  next();  // Proceed to the next middleware
});
//middlewares
app.use(express.json())
app.use(cookieParser())
app.use(urlencoded({extended:true}))

//yha pr apni api aayengi
app.use("/api/v1/user",userRoute)
app.use('/api/v1/post',postRoute)
app.use('/api/v1/message',messageRoute)
app.use('/api/v1/getcollege', getCollegeRoute)

app.use('/api/v1/admin/college', collegeRoute);

// Handle OPTIONS requests globally for preflight (needed for CORS)
app.options('*', cors(corsOptions));  // Allow preflight requests for all routes


app.get("/",(_,res)=>{
  return res.status(200).json({
      message:'I am coming  from backend',
      success:true
  })
})
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
      const adminMailOptions   = {
        from: email,
        to: "surajverma7049214132@gmail.com", // Send confirmation to the applicant
        subject: `New Application Received fo ${collegeName}`,
        html: `
          <h1>New Application</h1>
          <p>Dear Admin,</p>
          <p>A new application has been submitted for <strong>${collegeName}</strong>.</p>
          <p><strong>Application Details:</strong></p>
          <ul>
            <li><strong>Full Name:</strong> ${fullName}</li>
            <li><strong>Phone Number:</strong> ${phoneNumber}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Date of Birth:</strong> ${dob}</li>
            <li><strong>City:</strong> ${city}</li>
            <li><strong>Course Type:</strong> ${courseType}</li>
            <li><strong>Course:</strong> ${course}</li>
          </ul>
          <p>Please review the application and contact the applicant for the next steps.</p>
          <p>Regards,</p>
          <p>${collegeName} Admissions Team</p>
        `,
      };
      // Email content for student (confirmation)
      const studentMailOptions = {
        from: process.env.EMAIL_USER, // From your email (admin email)
        to: email, // Send confirmation to the applicant
        subject: `Application Confirmation for ${collegeName}`,
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
          <p>We have received your application and will contact you soon for the next steps.</p>
          <p>Regards,</p>
          <p>${collegeName} Admissions Team</p>
        `,
      };
  
      // Send the admin email
      const adminInfo = await transporter.sendMail(adminMailOptions);
      console.log("Admin Email sent: " + adminInfo.response);

      // Send the student confirmation email
      const studentInfo = await transporter.sendMail(studentMailOptions);
      console.log("Student Confirmation Email sent: " + studentInfo.response);

      res.status(200).json({ message: "Emails sent successfully!" });
    } catch (error) {
      console.error("Error sending email: ", error);
      res.status(500).json({ message: "Error sending email" });
    }
  });



const MERCHANT_KEY="618fa17f-c54c-4aff-9f5b-8e10b3e835f2";
const MERCHANT_ID="M22SBE31INURY";
const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
const prod_status_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status";
const redirectUrl = "https://awsedu.blackgrapesgroup.com/status";
const successUrl = "https://education.blackgrapesgroup.com/payment-success";
const failureUrl = "https://education.blackgrapesgroup.com/payment-failure";

// Create Order Route
app.post('/create-order', async (req, res) => {
  const { name, mobileNumber, amount } = req.body;
  const orderId = uuidv4();

  // Payment Payload
  const paymentPayload = {
    merchantId: MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: amount * 100,
    merchantTransactionId: orderId,
    redirectUrl: `${redirectUrl}/?id=${orderId}`,
    redirectMode:'POST',
    paymentInstrument: {
      type: 'PAY_PAGE'
    }
  };

  console.log("Request payload:", paymentPayload);

  const payload =Buffer.from(JSON.stringify(paymentPayload)).toString('base64');
  const keyIndex = 1;
  const string = payload +'/pg/v1/pay' + MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + keyIndex;

  console.log("Generated Checksum:", checksum);

  const option = {
    method: 'POST',
    url: prod_URL,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum
    },
    data: {
      request: payload
    }
  };

  try {
    const response = await axios.request(option);
    console.log("response",response.data);
    
    console.log(response.data.data.instrumentResponse.redirectInfo.url);
    res.status(200).json({ msg: "OK", url: response.data.data.instrumentResponse.redirectInfo.url });
  } catch (error) {
    console.log("Error in payment", error);
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

// Payment Status Route
app.post('/status', async (req, res) => {
  const merchantTransactionId = req.query.id;

  const keyIndex = 1;
  const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`+ MERCHANT_KEY;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256+ '###' + keyIndex;

  const option = {
    method: 'GET',
    url: `${prod_status_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': MERCHANT_ID
    },
  };

  axios.request(option).then((response) => {
    if (response.data.success === true) {
      return res.redirect(successUrl);

    } else {
      return res.redirect(failureUrl);
    }
  });
}); 
app.listen(PORT,()=>{
  connectDB()
  console.log(`server listen at port ${PORT}`);
 })
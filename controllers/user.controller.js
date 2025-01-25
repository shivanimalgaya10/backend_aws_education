import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register=async(req,res)=>{
    try {
        const {username,email,password,role}=req.body;

     if(!username || !email || !password){
            return res.status(401).json({
                message:"something is missing please check",
                success:false
            })
        }
        const user=await User.findOne({email})
        if(user){
            return res.status(404).json({
                message:"Email already exists.Try Different email",
                success:false
            })
        }
        const hashPassword=await bcrypt.hash(password,10)
        const userRole = role ? role : 'user'; // If no role provided, default to 'user'
        await User.create({
            username,
            email,
            password:hashPassword,
            role:userRole
        })
        return res.status(201).json({
            message:"Account Created",
            success:true
        })
        
    } catch (error) {
        console.log(error);
         // Send an error response if something goes wrong
    return res.status(500).json({
        message: "Internal server error. Please try again later.",
        success: false,
      });
        
    }
}

export const login=async(req,res)=>{
    try {
        const{email,password}=req.body
        if(!email || !password){
            return res.status(401).json({
                message:"something is missing please check",
                success:false
            })
        }
        let user=await User.findOne({email})
        if(!user){
            return res.status(401).json({
                message:"incorrect email or password",
                success:false
            })
        }
        const isPasswordMatch=await bcrypt.compare(password,user.password)

        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false
            })
        }
        const token =  jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'1d'})

        
      
        return res.cookie('token',token,{httpOnly:true,sameSite:'none',secure: true,maxAge:1*24*60*60*1000}).json({
            message:`welcom back ${user.username}`,
            success:true,
            user,
            token 
        })


        
    } catch (error) {
        console.log(error);
        
    }
}

export const logout=async(_,res)=>{
    try{
       // Clear the token cookie
       res.cookie("token", "", { maxAge: 0, httpOnly: true, secure: false, path: '/' });

       return res.json({
           message: "Logged out successfully",
           success: true
       });

    }catch(error){
         console.log(error);
         
    }
}

// Get total number of users
export const getUserCount = async (req, res) => {
    try {
      const count = await User.countDocuments(); // Get total count of users
      res.status(200).json({ count });
    } catch (error) {
      console.error("Error fetching user count", error);
      res.status(500).json({ message: "Error fetching user count" });
    }
  };

export const getProfile=async(req,res)=>{
   try {
    const userId=req.params._id;
    let user=await User.findById(userId).select("-password");

        // Check if user exists
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
       return res.status(200).json({
        user,
        success:true
    })
    
   } catch (error) {
    console.log(error);
    }
}

export const editProfile=async(req,res)=>{
    try {
        const userId=req.id;
        const{bio,gender}=req.body;
        const profilePicture=req.file;

        let cloudResponse;
        if(profilePicture){
            const fileUri=getDataUri(profilePicture)
            cloudResponse= await cloudinary.uploader.upload(fileUri)
        }
        const user=await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({
                message:"user not found",
                success:false
            })
        }
        if(bio) user.bio=bio;
        if(gender) user.gender=gender;
        if(profilePicture) user.profilePicture= cloudResponse.secure_url;
        
        await user.save();

        return res.status(200).json({
            message:'profile updated',
            success:true,
            user
        })
    } catch (error) {
        console.log(error);
        
    }
}



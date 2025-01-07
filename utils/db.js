import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const connectDB = async () => {
    try {
        // Check if the MONGO_DB_URL environment variable is set
        if (!process.env.MONGO_DB_URL) {
            console.log("MongoDB URI is not set in .env file");
            return;
        }

        // Connect to MongoDB using the connection string from the .env file
        await mongoose.connect(process.env.MONGO_DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection failed", error.message);
    }
};

export default connectDB;

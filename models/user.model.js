import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Allow only 'user' or 'admin'
    default: 'user' // Default to 'user' role
  }
}, { timestamps: true });

// Create a User model based on the schema
export const User = mongoose.model('User', userSchema);

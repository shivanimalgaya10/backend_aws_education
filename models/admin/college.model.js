import mongoose from "mongoose";

const courseOptions = ['BSc', 'MSc', 'MBBS', 'BTech', 'BCom', 'BBA'];
const categoryOptions = ['India', 'Abroad', 'Coaching'];

const courseSchema = new mongoose.Schema({
  course: { type: String, required: true },
  fees: { type: Number, required: true},
}, { _id: false });

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  institutionType: { type: String, required: true }, // Added for "Institution Type"
  remarks: { type: String, required: true }, // Added for "Remarks"
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  category: { type: String, enum: categoryOptions, required: true },
  ugCourses: { type: [courseSchema], default: [] },
pgCourses: { type: [courseSchema], default: [] },
  details: { type: String, required: true },
  images: [{
    url: { type: String},  // URL of the image in Cloudinary
    public_id: { type: String }  // Public ID of the image in Cloudinary
  }],
  
}, { timestamps: true });

// Add indexing for faster queries
collegeSchema.index({ name: 1, country: 1, category: 1 });

export const College = mongoose.model('College', collegeSchema);
// removedImages: [{ type: String }],
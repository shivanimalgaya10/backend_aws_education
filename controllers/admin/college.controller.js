import { College } from "../../models/admin/college.model.js";
import cloudinary from '../../utils/cloudinary.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export const addCollege = async (req, res) => {
  console.log('Request Body: shivani ', req.body);
  try {
    const {
      name,
      institutionType,
      remarks,
      address,
      pincode,
      state,
      city,
      country,
      category,
      details,
    } = req.body;

    console.log("images", req.files);
    console.log("ugCourses before parsing:", ugCourses);
console.log("pgCourses before parsing:", pgCourses);

    // Parse and validate courses
    let ugCourses = req.body.ugCourses;
    let pgCourses = req.body.pgCourses;

 // If courses are passed as JSON strings, parse them
if (typeof ugCourses === 'string') {
  try {
    ugCourses = JSON.parse(ugCourses);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid UG courses JSON format' });
  }
}

if (typeof pgCourses === 'string') {
  try {
    pgCourses = JSON.parse(pgCourses);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid PG courses JSON format' });
  }
}

    console.log("ug pg ", ugCourses)
    console.log("ugCourses after parsing:", ugCourses);
console.log("pgCourses after parsing:", pgCourses);

    // Validate course data format
    const validateCourses = (courses) => {
      return Array.isArray(courses) && courses.every(course =>
        typeof course.course === 'string' && !isNaN(Number(course.fees)) && Number(course.fees) >= 0
      );
    };

    if (!validateCourses(ugCourses) || !validateCourses(pgCourses)) {
      return res.status(400).json({ message: 'Invalid course data format' });
    }


    // Check if images are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    // Upload images to Cloudinary using file.buffer
    const imagePromises = req.files.map(async (file) => {
      const uploadResponse = await cloudinary.uploader.upload(file.path, {
        folder: 'colleges',
      });
      return {
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      };
    });



    const uploadedImages = await Promise.all(imagePromises);


    // Create a new College instance
    const newCollege = new College({
      name,
      institutionType,
      remarks,
      address,
      pincode,
      state,
      city,
      country,
      category,
      ugCourses: ugCourses.map(course => ({
        course: course.course,
        fees: parseFloat(course.fees),
      })),
      pgCourses: pgCourses.map(course => ({
        course: course.course,
        fees: parseFloat(course.fees),
      })),
      details,
      images: uploadedImages, // Store image URLs and public IDs in the database
      // Store image URLs and public IDs in the database
    });
    // images: uploadedImages,

    console.log('New College:', newCollege);

    // Save the college to the database
    await newCollege.save();

    res.status(201).json({ message: 'College added successfully', college: newCollege });
  } catch (error) {
    console.error('Error adding college:', error);
    res.status(500).json({ error: error.message });
  }
};

//   export const addCollege = async (req, res) => {
//     console.log('Request Body:', req.body);
//     try {
//       const {
//         name,
//         institutionType, 
//         remarks,
//         address,
//         pincode,
//         state,
//         city,
//         country,
//         category,
//         ugCourses,  // Array of UG courses
//        pgCourses,  // Array of PG courses
//         details,
//       } = req.body;

//       console.log("images",req.files);

//        // Ensure courses are parsed correctly
//     const parsedUgCourses = JSON.parse(ugCourses || '[]');
//     const parsedPgCourses = JSON.parse(pgCourses || '[]');


//       // Check if images are provided
//       if (!req.files || req.files.length === 0) {
//         return res.status(400).json({ error: 'No images provided' });
//       }

//       // Upload images to Cloudinary using file.buffer
//       const imagePromises = req.files.map(async (file) => {
//         const uploadResponse = await cloudinary.uploader.upload(file.path, {
//           folder: 'colleges',
//         });
//         return {
//           url: uploadResponse.secure_url,
//           public_id: uploadResponse.public_id,
//         };
//       });


//       const uploadedImages = await Promise.all(imagePromises);

//      // Ensure fees are numbers in each course
//      const updatedUgCourses =  Array.isArray(parsedUgCourses) ? parsedUgCourses.map(course => ({
//       ...course,
//       fees: typeof course.fees === 'string' ? parseFloat(course.fees) : course.fees,
//     })) : []; // Return an empty array if ugCourses is not an array

//     const updatedPgCourses =  Array.isArray(parsedPgCourses) ? parsedPgCourses.map(course => ({
//   ...course,
//   fees: typeof course.fees === 'string' ? parseFloat(course.fees) : course.fees,
// })) : []; // Return an empty array if ugCourses is not an array

//       // Create a new College instance
//       const newCollege = new College({
//         name,
//         institutionType,
//         remarks,
//         address,
//         pincode,
//         state,
//         city,
//         country,
//         category,
//          ugCourses: updatedUgCourses,  // Assign UG courses separately
//        pgCourses: updatedPgCourses,  // Assign PG courses separately
//         details,
//         images: uploadedImages, // Store image URLs and public IDs in the database
//         // Store image URLs and public IDs in the database
//       });
//       // images: uploadedImages,

//       console.log('New College:', newCollege);

//       // Save the college to the database
//       await newCollege.save();

//       res.status(201).json({ message: 'College added successfully', college: newCollege });
//     } catch (error) {
//       console.error('Error adding college:', error);
//       res.status(500).json({ error: error.message });
//     }
//   };


// Controller function to get colleges by country and category
export const getCollegesByCountryAndCategory = async (req, res) => {
  try {
    const { country, category } = req.query;

    let filter = {}; // Initialize an empty filter

    // Add filters if country or category is provided
    if (country) filter.country = country;
    if (category) filter.category = category;

    // Fetch colleges based on the filters
    const colleges = await College.find(filter);

    // Check if colleges exist
    if (!colleges || colleges.length === 0) {
      return res.status(404).json({ message: "No colleges found for the specified filters" });
    }

    // Respond with the filtered colleges
    res.status(200).json({ message: "Colleges retrieved successfully", colleges });
  } catch (error) {
    console.error("Error fetching colleges:", error);
    res.status(500).json({ error: "An error occurred while fetching colleges" });
  }
};

export const updateCollege = async (req, res) => {
  const { id } = req.params;
  console.log("body", req.body);

  let {
    name,
    address,
    institutionType,
    remarks,
    pincode,
    state,
    city,
    country,
    category,
    ugCourses,
    pgCourses,
    details,
    removedImages
  } = req.body;

  console.log(removedImages);
  removedImages = removedImages || []; // Default fallback

  if (typeof ugCourses === 'string') {
    try {
      ugCourses = JSON.parse(ugCourses); // Parse stringified JSON
    } catch (error) {
      console.error("Error parsing ugCourses:", error);
      ugCourses = [];
    }
  }

  if (typeof pgCourses === 'string') {
    try {
      pgCourses = JSON.parse(pgCourses); // Parse stringified JSON
    } catch (error) {
      console.error("Error parsing pgCourses:", error);
      pgCourses = [];
    }
  }


  try {
    // Find the college by its ID
    const college = await College.findById(id);

    // Check if the college exists
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Update basic details if provided
    if (name) college.name = name;
    if (institutionType) college.institutionType = institutionType;
    if (remarks) college.remarks = remarks;
    if (address) college.address = address;
    if (pincode) college.pincode = pincode;
    if (state) college.state = state;
    if (city) college.city = city;
    if (country) college.country = country;
    if (category) college.category = category;
    if (details) college.details = details;

    // Update courses if provided
    // Update UG and PG courses separately
    if (Array.isArray(ugCourses)) {
      college.ugCourses = ugCourses.map(course => ({
        course: course.course,
        fees: course.fees,
      }));
    }

    if (Array.isArray(pgCourses)) {
      college.pgCourses = pgCourses.map(course => ({
        course: course.course,
        fees: course.fees,
      }));
    }
    // console.log("Type of removedImages:", typeof removedImages);

    if (removedImages) {
      // Check if removedImages is a string
      if (typeof removedImages === "string") {
        try {
          // Parse the string into an array
          removedImages = JSON.parse(removedImages);
          console.log("Parsed removedImages array:", removedImages);
        } catch (error) {
          console.error("Error parsing removedImages string:", error);
          removedImages = []; // Fallback to an empty array
        }
      }
      // Remove images from Cloudinary if any are marked for removal
      if (Array.isArray(removedImages) && removedImages.length > 0) {
        // Filter out any undefined values from removedImages array
        console.log("removed", removedImages);


        //  const validImages = removedImages.filter(imageUrl => imageUrl !== undefined);
        // Filter out any null or invalid values from removedImages
        const validRemovedImages = removedImages.filter(imageUrl => imageUrl && typeof imageUrl === "string");
        console.log("Valid URLs after filtering:", validRemovedImages); // Log valid URLs

        for (const imageUrl of validRemovedImages) {
          if (typeof imageUrl === "string") {
            console.log("Processing image URL:", imageUrl);


            // Use a regular expression to extract the public_id from the URL
            const regex = /\/upload\/v\d+\/(.*?)\./;
            const matches = imageUrl.match(regex);

            if (matches && matches[1]) {
              const public_id = matches[1];

              console.log("public id", public_id);

              try {
                await cloudinary.uploader.destroy(public_id);
                // Remove the image from the database
                college.images = college.images.filter(image => image.public_id !== public_id);
              } catch (error) {
                console.error('Error removing image from Cloudinary:', error);
              }
            } else {
              console.log("Invalid URL format:", imageUrl);
            }
          } else {
            console.log("Skipping invalid entry:", imageUrl);
          }
        }
      }


      // Upload new images to Cloudinary if provided
      if (req.files && req.files.length > 0) {
        const imageUploads = req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, { folder: 'colleges' });
          return {
            url: result.secure_url,
            public_id: result.public_id,
          };
        });

        const uploadedImages = await Promise.all(imageUploads);
        college.images.push(...uploadedImages);
      }

      // Save the updated college to the database
      await college.save();

      res.status(200).json({ message: 'College updated successfully', college });
    }
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get a specific college by ID
export const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id); // Replace `College` with your Mongoose model name

    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    res.status(200).json(college);
  } catch (error) {
    console.error("Error fetching college:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};



export const deleteCollege = async (req, res) => {
  try {
    const collegeId = req.params.id;
    const deletedCollege = await College.findByIdAndDelete(collegeId);

    if (!deletedCollege) {
      return res.status(404).json({ message: 'College not found' });
    }

    res.status(200).json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}

export const editCollege = async (req, res) => {
  try {
    const collegeId = req.params.id;
    const updatedData = req.body;

    const updatedCollege = await College.findByIdAndUpdate(collegeId, updatedData, { new: true });

    if (!updatedCollege) {
      return res.status(404).json({ message: 'College not found' });
    }

    res.status(200).json(updatedCollege);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
}
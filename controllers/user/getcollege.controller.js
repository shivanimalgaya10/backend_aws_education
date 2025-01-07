import { College } from "../../models/admin/college.model.js";

export const  getCollegesByFilters=async(req,res)=>{
    const {category,courseName,courseType}=req.query;

    console.log("category,courseName,courseType",category,courseName,courseType);
    

    try {
        const filter = {
            category,
        };

        if (!category || !courseName || !courseType) {
            return res.status(400).json({message :"Missing required parameters"})
        }

        // Modify the filter depending on courseType (UG or PG)
        if (courseType === "UG") {
            // Use $elemMatch to find a match within the nested array
            filter["ugCourses"] = { $elemMatch: { course: courseName } };
        } else if (courseType === "PG") {
            // Use $elemMatch to find a match within the nested array
            filter["pgCourses"] = { $elemMatch: { course: courseName } };
        } else {
            // For both UG and PG
            filter.$or = [
                { "ugCourses": { $elemMatch: { course: courseName } } },
                { "pgCourses": { $elemMatch: { course: courseName } } },
            ];
        }

        console.log("Filter Query:", filter);

        // Query the database with the modified filter
        const colleges = await College.find(filter);
        console.log("colleges",colleges);

          // Check if courseType is UG or PG and filter accordingly
//           if (courseType === "UG") {
//             filter["ugCourses.course"] = courseName; // Match in UG courses
//         } else if (courseType === "PG") {
//             filter["pgCourses.course"] = courseName; // Match in PG courses
//         } else {
//             filter.$or = [
//                 { "ugCourses.course": courseName },
//                 { "pgCourses.course": courseName },
//             ]; // Match in both UG and PG courses if courseType not specified
//         }

//         console.log("Filter Query:", filter);
//         const colleges = await College.find({ category: 'Abroad' });
// console.log(colleges);
        // const colleges=await College.find(filter)
        // console.log("colleges",colleges);
        
        if (colleges.length === 0) {
            return res.status(404).json({ message: "No colleges found matching your criteria" });
          }
          res.status(200).json({
            message: "Colleges fetched successfully",
            colleges,
        });
        
    } catch (error) {
        console.error("Error fetching colleges:", error);
        res.status(500).json({
            message: "An error occurred while fetching colleges",
        });
        
        
    }
}
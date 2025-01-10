import express from 'express';
import { addCollege, deleteCollege, getCollegeById, getCollegesByCountryAndCategory, updateCollege } from '../../controllers/admin/college.controller.js';
import upload1 from '../../utils/multer1.js';
import isAuthenticated from '../../middlewares/isAuthenticated.js';
import adminAuth from '../../middlewares/adminAuth.js';


const router = express.Router();

// Route to add a new college
router.route("/addcollege").post(upload1.array('images', 5), addCollege);
router.route("/updatecollege/:id").put(upload1.array('images', 15), updateCollege);

router.get("/getCollegesByCountryAndCategory",getCollegesByCountryAndCategory);
router.route("/deletecollege/:id").delete(deleteCollege);
// Route to get a specific college by ID
router.route("/getcollege/:id").get(getCollegeById);


export default router;

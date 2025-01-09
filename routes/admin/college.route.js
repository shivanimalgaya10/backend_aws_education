import express from 'express';
import { addCollege, deleteCollege, getCollegeById, getCollegesByCountryAndCategory, updateCollege } from '../../controllers/admin/college.controller.js';
import upload1 from '../../utils/multer1.js';
import isAuthenticated from '../../middlewares/isAuthenticated.js';
import adminAuth from '../../middlewares/adminAuth.js';


const router = express.Router();

// Route to add a new college
router.route("/addcollege").post(isAuthenticated, adminAuth,upload1.array('images', 5), addCollege);
router.route("/updatecollege/:id").put(isAuthenticated, adminAuth,upload1.array('images', 15), updateCollege);

router.get("/getCollegesByCountryAndCategory", isAuthenticated, adminAuth,getCollegesByCountryAndCategory);
router.route("/deletecollege/:id").delete(isAuthenticated, adminAuth,deleteCollege);
// Route to get a specific college by ID
router.route("/getcollege/:id").get(getCollegeById);


export default router;

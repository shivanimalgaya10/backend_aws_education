import express from 'express'
import { getCollegesByFilters } from '../../controllers/user/getcollege.controller.js';
const router=express.Router();

router.route('/getCollegeByFilters').get(getCollegesByFilters)

export default router;

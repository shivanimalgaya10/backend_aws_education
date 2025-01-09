import express from "express"
import { getProfile, login, logout, register } from "../controllers/user.controller.js"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
const router=express.Router()

router.route("/register").post(register);
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/:_id/profile").get(isAuthenticated,getProfile)


export default router;
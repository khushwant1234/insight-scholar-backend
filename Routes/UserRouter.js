import express from "express";
import { getUserProfile, updateUserProfile, getStudentMentors, getMentorById } from "../Controllers/UserController.js";
import { protect } from "../Middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/profile", protect, getUserProfile);
userRouter.put("/profile", protect, updateUserProfile);

// New route to fetch student mentors
userRouter.get("/mentors", getStudentMentors);

// Get a specific mentor by ID
userRouter.get("/mentor/:id", getMentorById);

export default userRouter;

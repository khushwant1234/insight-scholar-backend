import express from "express";
import { 
  getUserProfile, 
  updateUserProfile, 
  getStudentMentors, 
  getMentorById,
  toggleMentorStatus 
} from "../Controllers/UserController.js";
import { protect } from "../Middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/profile", protect, getUserProfile);
userRouter.put("/profile", protect, updateUserProfile);

// New route to toggle mentor status
userRouter.put("/toggle-mentor", protect, toggleMentorStatus);

// New route to fetch student mentors
userRouter.get("/mentors", getStudentMentors);

// Get a specific mentor by ID
userRouter.get("/mentor/:id", getMentorById);

export default userRouter;

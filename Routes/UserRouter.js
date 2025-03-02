import express from "express";
import { getUserProfile, updateUserProfile } from "../Controllers/UserController.js";
import { protect } from "../Middlewares/auth.js";

const userRouter = express.Router();

// Endpoints for user-related data
userRouter.get("/profile", protect, getUserProfile);
userRouter.put("/profile", protect, updateUserProfile);

export default userRouter;

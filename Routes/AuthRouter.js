import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationEmail 
} from "../Controllers/authController.js";

const authRouter = express.Router();

// Endpoints for authentication
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/verify-email/:token", verifyEmail);
authRouter.post("/resend-verification", resendVerificationEmail);

export default authRouter;
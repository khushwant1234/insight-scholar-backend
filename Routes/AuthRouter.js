import express from "express";
import { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  verifyResetToken
} from "../Controllers/authController.js";

const authRouter = express.Router();

// Existing endpoints
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.get("/verify-email/:token", verifyEmail);
authRouter.post("/resend-verification", resendVerificationEmail);

// New password reset endpoints
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);
authRouter.get("/verify-reset-token/:token", verifyResetToken);

export default authRouter;
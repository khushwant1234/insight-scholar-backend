import mongoose from "mongoose";
import crypto from "crypto";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateJWTToken } from "../utils/GenerateJWT.js";
import { User } from "../Models/userModel.js";
import sendEmail from "../utils/emailService.js";

// Controller to register a new user
export const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, major, year, linkedIn, college } = req.body;

  if (!name || !email || !password || !major || !year || !college) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@snu\.edu\.in$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Email must be a valid @snu.edu.in address");
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Build the user data object
  const userData = { 
    name, 
    email, 
    password, 
    major, 
    year, 
    college,
    verificationToken,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
    isEmailVerified: false
  };
  
  if (linkedIn) {
    userData.linkedIn = linkedIn;
  }

  const newUser = await User.create(userData);
  if (!newUser) {
    throw new ApiError(500, "Failed to create User");
  }

  // Generate verification URL
  const verificationURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

  // Send verification email
  try {
    await sendEmail({
      email: newUser.email,
      subject: "Verify Your Email - Nandan",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D43134;">Welcome to Nandan!</h2>
          <p>Hello ${newUser.name},</p>
          <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationURL}" style="background-color: #D43134; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationURL}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The Nandan Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Continue with registration even if email fails
  }

  const jwtToken = generateJWTToken(newUser._id);

  res.status(201).json({
    success: true,
    message: "Registration successful! Please check your email to verify your account.",
    data: {
      token: jwtToken,
      user: {
        ...newUser.toObject(),
        password: undefined // Remove password from response
      },
    },
  });
});

// Controller to log in a user
export const loginUser = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  
  const user = await User.findOne({ email });
  
  // Check if user exists and password is correct
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  
  // Check if email is verified
  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }
  
  const jwtToken = generateJWTToken(user._id);

  res.status(200).json({
    success: true,
    data: { 
      token: jwtToken, 
      user: {
        ...user.toObject(),
        password: undefined
      } 
    },
  });
});

// Add a new controller for email verification
export const verifyEmail = AsyncHandler(async (req, res) => {
  const { token } = req.params;
  
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }
  
  // Update user verification status
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Email verified successfully! You can now log in."
  });
});

// Add a controller to resend verification email
export const resendVerificationEmail = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }
  
  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.verificationToken = verificationToken;
  user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
  
  await user.save();
  
  // Generate verification URL
  const verificationURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
  
  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - Nandan",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D43134;">Nandan Email Verification</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a new verification link. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationURL}" style="background-color: #D43134; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationURL}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The Nandan Team</p>
        </div>
      `
    });
    
    res.status(200).json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new ApiError(500, "Failed to send verification email");
  }
});

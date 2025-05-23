import mongoose from "mongoose";
import crypto from "crypto";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateJWTToken } from "../utils/GenerateJWT.js";
import { User } from "../Models/userModel.js";
import sendEmail from "../utils/emailService.js";
import { College } from "../Models/collegeModel.js";

// Controller to register a new user
export const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, major, year, linkedIn, college } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  // If a college is selected (and not "notInCollege"), verify the email domain
  if (college && college !== "notInCollege") {
    const collegeData = await College.findById(college);
    
    if (!collegeData) {
      throw new ApiError(404, "Selected college not found");
    }
    
    // Extract email domain from user's email
    const userEmailDomain = email.split('@')[1];
    
    // If the college has specified email domains, verify the user's email
    if (collegeData.emailDomains && collegeData.emailDomains.length > 0) {
      if (!collegeData.emailDomains.includes(userEmailDomain)) {
        throw new ApiError(
          400, 
          `To register with ${collegeData.name}, you must use an email address from one of these domains: ${collegeData.emailDomains.join(', ')}`
        );
      }
    }
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Build the user data object
  const userData = { 
    name, 
    email, 
    password,
    verificationToken,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
    isEmailVerified: false
  };
  
  // Only add college if it's not "notInCollege"
  if (college && college !== "notInCollege") {
    userData.college = college;
  }
  
  // Add other optional fields if provided
  if (major) userData.major = major;
  if (year) userData.year = year;
  if (linkedIn) userData.linkedIn = linkedIn;

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
      subject: "Verify Your Email - InsightScholar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logonobg2.png" alt="InsightScholar Logo" style="max-width: 120px; height: auto;">
          </div>
          <h2 style="color: #5E35B1; margin-bottom: 20px; font-size: 24px;">Welcome to InsightScholar!</h2>
          <p style="color: #333; margin-bottom: 15px; font-size: 16px;">Hello ${newUser.name},</p>
          <p style="color: #333; margin-bottom: 25px; font-size: 16px;">Thank you for registering with us. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationURL}" style="background-color: #5E35B1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 16px;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; margin-bottom: 10px; font-size: 14px;">If the button doesn't work, please copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #5E35B1; margin-bottom: 25px; font-size: 14px;">${verificationURL}</p>
          <p style="color: #666; margin-bottom: 15px; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; margin-bottom: 10px; font-size: 14px;">Best regards,<br>The InsightScholar Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} InsightScholar. All rights reserved.</p>
          </div>
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
      subject: "Verify Your Email - InsightScholar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${process.env.FRONTEND_URL || 'http://localhost:5173'}/logonobg2.png" alt="InsightScholar Logo" style="max-width: 120px; height: auto;">
      </div>
      <h2 style="color: #5E35B1; margin-bottom: 20px; font-size: 24px;">Email Verification</h2>
      <p style="color: #333; margin-bottom: 15px; font-size: 16px;">Hello ${user.name},</p>
      <p style="color: #333; margin-bottom: 25px; font-size: 16px;">You requested a new verification link. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationURL}" style="background-color: #5E35B1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 16px;">
          Verify Email
        </a>
      </div>
      <p style="color: #666; margin-bottom: 10px; font-size: 14px;">If the button doesn't work, please copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #5E35B1; margin-bottom: 25px; font-size: 14px;">${verificationURL}</p>
      <p style="color: #666; margin-bottom: 15px; font-size: 14px;">This link will expire in 24 hours.</p>
      <p style="color: #666; margin-bottom: 10px; font-size: 14px;">Best regards,<br>The InsightScholar Team</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #888; font-size: 12px;">
        <p>© ${new Date().getFullYear()} InsightScholar. All rights reserved.</p>
        
      </div>
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

// Request password reset
export const forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  
  const user = await User.findOne({ email });
  
  if (!user) {
    // For security reasons, don't disclose that the user doesn't exist
    return res.status(200).json({ 
      success: true, 
      message: "If an account with that email exists, a password reset link has been sent." 
    });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash and set the reset token
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes
  
  await user.save({ validateBeforeSave: false });
  
  // Generate reset URL
  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  
  // Send reset email
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset - InsightScholar",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5E35B1;">Reset Your Password</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset. Please click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #5E35B1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this reset, you can safely ignore this email.</p>
          <p>This link will expire in 15 minutes for security reasons.</p>
          <p>If the button doesn't work, please copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetURL}</p>
          <p>Best regards,<br>The InsightScholar Team</p>
        </div>
      `
    });
    
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    
    // Reset the token fields in case of email failure
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new ApiError(500, "Failed to send password reset email");
  }
});

// Reset password with token
export const resetPassword = AsyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  
  if (!token || !password) {
    throw new ApiError(400, "Token and new password are required");
  }
  
  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  // Find user with matching token and valid expiration
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new ApiError(400, "Password reset token is invalid or has expired");
  }
  
  // Set new password and clear reset token fields
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save();
  
  // Generate new JWT token for automatic login after reset
  const jwtToken = generateJWTToken(user._id);
  
  res.status(200).json({
    success: true,
    message: "Password has been reset successfully",
    data: {
      token: jwtToken,
      user: {
        ...user.toObject(),
        password: undefined
      }
    }
  });
});

// Verify reset token validity (for frontend validation)
export const verifyResetToken = AsyncHandler(async (req, res) => {
  const { token } = req.params;
  
  if (!token) {
    throw new ApiError(400, "Token is required");
  }
  
  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  // Check if token exists and is not expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new ApiError(400, "Password reset token is invalid or has expired");
  }
  
  res.status(200).json({
    success: true,
    message: "Token is valid",
    data: {
      email: user.email
    }
  });
});

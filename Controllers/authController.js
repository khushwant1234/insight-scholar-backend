import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateJWTToken } from "../utils/GenerateJWT.js";
import { User } from "../Models/userModel.js";

// Controller to register a new user
export const registerUser = AsyncHandler(async (req, res) => {
  const { name, email, password, major, year, linkedIn, college } = req.body; // add college

  if (!name || !email || !password || !major || !year || !college ) { // add college to required fields
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

  // Build the user data object conditionally based on the fields received
  const userData = { name, email, password, major, year, college }; // add college
  if (linkedIn) {
    userData.linkedIn = linkedIn;
  }

  const newUser = await User.create(userData);
  if (!newUser) {
    throw new ApiError(500, "Failed to create User");
  }

  const jwtToken = generateJWTToken(newUser._id);

  res.status(201).json({
    success: true,
    data: {
      token: jwtToken,
      user: newUser, // Return the created user's data
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
  
  // Assuming your User model implements a method to compare password
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  
  const jwtToken = generateJWTToken(user._id);

  // // Log the database stats to the console
  // const dbStats = await mongoose.connection.db.stats();
  // console.log("Database Stats:", dbStats);

  res.status(200).json({
    success: true,
    data: { token: jwtToken, user },
  });
});

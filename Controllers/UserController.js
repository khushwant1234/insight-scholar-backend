import jwt from "jsonwebtoken";
import { User } from "../Models/userModel.js";

// Helper function to create a JWT token for a user (if needed)
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Controller to get logged-in user's info
const getUserProfile = async (req, res) => {
  // console.log("Fetching user profile...");
  try {
    // Assumes req.user is set from an authentication middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      college: user.college,
      major: user.major,
      year: user.year,
      interests: user.interests,
      linkedIn: user.linkedIn,
      stats: user.stats,
      karma: user.karma,
      joinedColleges: user.joinedColleges,
      isMentor: user.isMentor,
      mentordetails: user.mentorDetails,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to update logged-in user's info
const updateUserProfile = async (req, res) => {
  
  try {
    // Assumes req.user is set from an authentication middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update fields if provided in the request body
    const { name, profilePic, college, major, year, interests, linkedIn } = req.body;
    if (name) user.name = name;
    if (profilePic) user.profilePic = profilePic;
    if (college) user.college = college;
    if (major) user.major = major;
    if (year) user.year = year;
    if (interests) user.interests = interests;
    if (linkedIn) user.linkedIn = linkedIn;
    
    const updatedUser = await user.save();
    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      college: updatedUser.college,
      major: updatedUser.major,
      year: updatedUser.year,
      interests: updatedUser.interests,
      linkedIn: updatedUser.linkedIn,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export { getUserProfile, updateUserProfile };
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
    const { name, profilePic, major, year, interests, linkedIn } = req.body;
    if (name) user.name = name;
    if (profilePic) user.profilePic = profilePic;
    
    // Note: We're intentionally not updating the college field
    // Even if it's sent in the request, we ignore it
    
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
      college: updatedUser.college, // Return the original college
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

// Controller to get student mentors (users with isMentor flag set to true)
const getStudentMentors = async (req, res) => {
  try {
    // Find users with isMentor true and select relevant fields
    const mentors = await User.find({ isMentor: true }).select(
      "_id name email profilePic college major year karma stats mentorDetails"
    )
    .populate("college", "name location");
    
    res.json({ success: true, mentors });
  } catch (error) {
    console.error("Error fetching student mentors:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to get a specific student mentor by ID
const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await User.findOne({ _id: id, isMentor: true })
      .select("_id name email profilePic college major year karma stats interests linkedIn mentorDetails bio")
      .populate("college", "name location");
    
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found" });
    }
    
    res.json({ success: true, mentor });
  } catch (error) {
    console.error("Error fetching mentor:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to toggle mentor status (for users to opt out of being a mentor)
const toggleMentorStatus = async (req, res) => {
  try {
    // Assumes req.user is set from an authentication middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Only allow users to opt out if they're currently a mentor
    // They can't manually opt in - that happens automatically via karma
    if (user.isMentor) {
      user.isMentor = false;
      
      // Clear any mentor details when opting out
      user.mentorDetails.isAssigned = false;
      user.mentorDetails.assignedTo = null;
    }
    
    const updatedUser = await user.save();
    
    res.json({
      success: true,
      message: "Mentor status updated successfully",
      isMentor: updatedUser.isMentor
    });
  } catch (error) {
    console.error("Error toggling mentor status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export { getUserProfile, updateUserProfile, getStudentMentors, getMentorById, toggleMentorStatus };
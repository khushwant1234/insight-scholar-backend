import { College } from "../Models/collegeModel.js";
import { User } from "../Models/userModel.js";

// Create a new college
const createCollege = async (req, res) => {
  try {
    const { name, profilePic, location, description, facts, domain } = req.body;
    
    // Basic validation: name is required
    if (!name) {
      return res.status(400).json({ error: "College name is required" });
    }
    // Check if the college already exists
    const existingCollege = await College.findOne({ name });
    if (existingCollege) {
      return res.status(400).json({ error: "College already exists" });
    }

    const college = await College.create({
      name,
      profilePic,
      location,
      description,
      facts,
      domain,
    });

    res.status(201).json({ success: true, college });
  } catch (error) {
    console.error("Error creating college:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single college by ID
const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Handle case where id is undefined, null, or "notInCollege"
    if (!id || id === "undefined" || id === "null" || id === "notInCollege") {
      return res.json({ 
        success: true, 
        college: {
          _id: "notInCollege",
          name: "Not in College",
          location: null,
          description: "This represents users who are not affiliated with any college",
          members: [],
          posts: []
        }
      });
    }
    
    // Regular case - find college by ID
    const college = await College.findById(id)
      .populate("members", "name profilePic")
      .populate("posts");
      
    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }
    
    res.json({ success: true, college });
  } catch (error) {
    console.error("Error fetching college:", error);
    
    // Handle invalid ID format errors gracefully
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.json({ 
        success: true, 
        college: {
          _id: "notInCollege",
          name: "Not in College", 
          location: null,
          description: "This represents users who are not affiliated with any college",
          members: [],
          posts: []
        }
      });
    }
    
    res.status(500).json({ error: "Server error" });
  }
};

// Get all colleges
const getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find({})  // Returns all colleges
      .populate("members", "name profilePic")
      .populate("posts");
    res.json({ success: true, colleges });
  } catch (error) {
    console.error("Error fetching colleges:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update an existing college
const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, profilePic, location, description, facts } = req.body;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }

    if (name) college.name = name;
    if (profilePic) college.profilePic = profilePic;
    if (location) college.location = location;
    if (description) college.description = description;
    if (facts) college.facts = facts;

    const updatedCollege = await college.save();
    res.json(updatedCollege);
  } catch (error) {
    console.error("Error updating college:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete an existing college
const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ error: "College not found" });
    }
    await college.remove();
    res.json({ message: "College removed successfully" });
  } catch (error) {
    console.error("Error deleting college:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// New: Controller to join a college
const joinCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Find the college by ID
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found" });
    }

    // Check if the user is already a member
    if (college.members.includes(userId)) {
      return res.status(400).json({ success: false, message: "User already joined this college" });
    }

    // Add the user ID to the members array
    college.members.push(userId);
    const updatedCollege = await college.save();

    res.json({ success: true, college: updatedCollege });
  } catch (error) {
    console.error("Error joining college:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Controller to get student mentors (users with isMentor flag set to true)
const getStudentMentors = async (req, res) => {
  try {
    // Find users with isMentor true and populate their college information
    const mentors = await User.find({ isMentor: true })
      .select(
        "_id name email profilePic college major year karma stats mentorDetails"
      )
      .populate("college", "name location"); // Populate college data
      
    res.json({ success: true, mentors });
  } catch (error) {
    console.error("Error fetching student mentors:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all mentors from a specific college
const getCollegeMentors = async (req, res) => {
  try {
    const { collegeId } = req.params;
    
    // Find users who are mentors AND belong to this specific college
    const mentors = await User.find({ 
      isMentor: true,
      college: collegeId
    })
    .select("_id name email profilePic major year karma stats mentorDetails")
    .sort({ karma: -1 }); // Sort by karma (highest first)
    
    res.json({ 
      success: true, 
      mentors,
      count: mentors.length
    });
  } catch (error) {
    console.error("Error fetching college mentors:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getCollegeNames = async (req, res) => {
  try {
    const colleges = await College.find({}).select("name");
    // console.log("Colleges", colleges);
    res.json({ success: true, colleges });
  } catch (error) {
    console.error("Error fetching college names:", error);
    res.status(500).json({ error: "Server error" });
  }
}

export { createCollege, getCollegeById, getAllColleges, updateCollege, deleteCollege, joinCollege, getStudentMentors, getCollegeNames, getCollegeMentors };
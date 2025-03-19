import { MentorRequest } from "../Models/mentorRequestModel.js";
import { User } from "../Models/userModel.js";

// Create a new mentor request
export const createMentorRequest = async (req, res) => {
  try {
    const { mentorId, studentId, paymentAmount } = req.body;

    // Check if there's already a pending request
    const existingRequest = await MentorRequest.findOne({
      student: studentId,
      mentor: mentorId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        error: "You already have a pending request for this mentor" 
      });
    }

    const newRequest = new MentorRequest({
      student: studentId,
      mentor: mentorId,
      paymentAmount,
      paymentStatus: "pending_verification",
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating mentor request:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get all pending mentor requests (for admin)
export const getPendingRequests = async (req, res) => {
  try {
    // Check if the user is an admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized. Only admins can view all pending requests"
      });
    }
    
    const requests = await MentorRequest.find({ status: "pending" })
      .populate("student", "name email profilePic")
      .populate("mentor", "name email profilePic");

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Approve or reject a mentor request (admin only)
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;
    
    // Check if the user is an admin
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || !adminUser.isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized. Only admins can approve or reject requests"
      });
    }

    const request = await MentorRequest.findById(id);
    
    if (!request) {
      return res.status(404).json({ success: false, error: "Request not found" });
    }

    // Update request status
    request.status = status;
    request.paymentStatus = paymentStatus;
    request.notes = notes;
    request.reviewedBy = req.user.id; // Admin ID

    await request.save();

    // If approved, update mentor status
    if (status === "approved" && paymentStatus === "verified") {
      const mentor = await User.findById(request.mentor);
      
      if (mentor) {
        mentor.mentorDetails.isAssigned = true;
        mentor.mentorDetails.assignedTo = request.student;
        await mentor.save();
      }
    }

    res.json({
      success: true,
      message: `Request ${status}`,
      request,
    });
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// Get requests for a specific student
export const getStudentRequests = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const requests = await MentorRequest.find({ student: studentId })
      .populate("mentor", "name email profilePic")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching student requests:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
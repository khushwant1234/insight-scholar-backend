import express from "express";
import { 
  createMentorRequest,
  getPendingRequests,
  updateRequestStatus,
  getStudentRequests
} from "../Controllers/MentorRequestController.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Create a new mentor request
router.post("/create", protect, createMentorRequest);

// Get all pending requests (admin only)
router.get("/pending", protect, getPendingRequests);

// Approve/reject a request (admin only)
router.put("/:id", protect, updateRequestStatus);

// Get requests for a specific student
router.get("/student/:studentId", protect, getStudentRequests);

export default router;
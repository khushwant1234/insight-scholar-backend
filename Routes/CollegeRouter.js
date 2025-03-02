import express from "express";
import { 
  createCollege, 
  getCollegeById, 
  getAllColleges, 
  updateCollege, 
  deleteCollege,
  joinCollege   // Import joinCollege controller
} from "../Controllers/collegeController.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Route to get all colleges and create a new college
router.route("/")
  .get(getAllColleges)
  .post(protect, createCollege);

// Routes to get, update, and delete a specific college by id
router.route("/:id")
  .get(getCollegeById)
  .put(protect, updateCollege)
  .delete(protect, deleteCollege);

// New route for joining a college
router.put("/:id/join", protect, joinCollege);

export default router;
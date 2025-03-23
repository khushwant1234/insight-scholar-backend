import express from 'express';
import { 
  createCollege,
  getCollegeById,
  getAllColleges,
  updateCollege,
  deleteCollege,
  joinCollege,
  getCollegeNames,
  getCollegeMentors
} from '../Controllers/collegeController.js';
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

// Define specific routes first
router.get('/getCollegeNames', getCollegeNames);
router.get('/allColleges', getAllColleges);

// Get all mentors from a specific college
router.get("/:collegeId/mentors", protect, getCollegeMentors);

// Then define parameterized routes
router.get('/:id', protect, getCollegeById);
router.put('/:id/join', protect, joinCollege);
router.put('/:id', protect, updateCollege);
router.delete('/:id', protect, deleteCollege);

// Other routes
router.post('/createCollege', createCollege);

export default router;
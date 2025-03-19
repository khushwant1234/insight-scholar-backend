import express from 'express';
import { 
  createCollege,
  getCollegeById,
  getAllColleges,
  updateCollege,
  deleteCollege,
  joinCollege,
  getCollegeNames
} from '../Controllers/collegeController.js';

const router = express.Router();

// Define specific routes first
router.get('/getCollegeNames', getCollegeNames);
router.get('/allColleges', getAllColleges);

// Then define parameterized routes
router.get('/:id', getCollegeById);
router.put('/:id/join', joinCollege);
router.put('/:id', updateCollege);
router.delete('/:id', deleteCollege);

// Other routes
router.post('/', createCollege);

export default router;
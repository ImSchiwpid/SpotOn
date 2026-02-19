import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus
} from '../controllers/complaintController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);
router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/', restrictTo('admin'), getAllComplaints);
router.put('/:id', mongoIdValidation, restrictTo('admin'), updateComplaintStatus);

export default router;


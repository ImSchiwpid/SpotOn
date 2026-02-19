import express from 'express';
import {
  createReview,
  getParkingReviews,
  getMyReviews,
  replyToReview
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

router.get('/parking/:id', mongoIdValidation, getParkingReviews);

router.use(protect);
router.get('/my', getMyReviews);
router.post('/', restrictTo('customer', 'admin'), createReview);
router.put('/:id/reply', mongoIdValidation, restrictTo('parking_owner', 'admin'), replyToReview);

export default router;


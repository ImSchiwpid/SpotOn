import express from 'express';
import {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { bookingValidation, paymentVerificationValidation, mongoIdValidation } from '../middleware/validation.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', bookingValidation, createBooking);
router.post('/verify-payment', paymentLimiter, paymentVerificationValidation, verifyPayment);
router.get('/my', getMyBookings);
router.get('/:id', mongoIdValidation, getBooking);
router.put('/:id/cancel', mongoIdValidation, cancelBooking);

// Admin only
router.get('/', restrictTo('admin'), getAllBookings);

export default router;

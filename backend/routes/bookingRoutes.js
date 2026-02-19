import express from 'express';
import {
  createBooking,
  verifyPayment,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  getPaymentHistory,
  getBookingInvoice,
  markBookingCompleted
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
router.get('/payments/history', getPaymentHistory);
router.get('/:id', mongoIdValidation, getBooking);
router.get('/:id/invoice', mongoIdValidation, getBookingInvoice);
router.put('/:id/complete', mongoIdValidation, restrictTo('parking_owner', 'admin'), markBookingCompleted);
router.put('/:id/cancel', mongoIdValidation, cancelBooking);

// Admin only
router.get('/', restrictTo('admin'), getAllBookings);

export default router;

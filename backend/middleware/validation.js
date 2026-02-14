import { body, param, query, validationResult } from 'express-validator';

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Parking spot validation
export const parkingSpotValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Valid coordinates required'),
  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),
  body('pricePerHour').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('totalSlots').isInt({ min: 1 }).withMessage('At least 1 slot required'),
  validate
];

// Booking validation
export const bookingValidation = [
  body('parkingSpotId').isMongoId().withMessage('Valid parking spot ID required'),
  body('startTime').isISO8601().withMessage('Valid start time required'),
  body('endTime').isISO8601().withMessage('Valid end time required'),
  body('hours').isInt({ min: 1 }).withMessage('Minimum 1 hour booking required'),
  validate
];

// Car validation
export const carValidation = [
  body('name').trim().notEmpty().withMessage('Car name is required'),
  body('numberPlate').trim().notEmpty().withMessage('Number plate is required'),
  body('type').optional().isIn(['car', 'bike', 'truck', 'van']).withMessage('Invalid vehicle type'),
  validate
];

// Payment validation
export const paymentVerificationValidation = [
  body('razorpay_payment_id').notEmpty().withMessage('Payment ID required'),
  body('razorpay_order_id').notEmpty().withMessage('Order ID required'),
  body('razorpay_signature').notEmpty().withMessage('Signature required'),
  body('bookingId').isMongoId().withMessage('Valid booking ID required'),
  validate
];

// MongoDB ID validation
export const mongoIdValidation = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate
];

import express from 'express';
import {
  createParkingSpot,
  getParkingSpots,
  getParkingSpot,
  updateParkingSpot,
  deleteParkingSpot,
  getMyParkingSpots,
  getCities
} from '../controllers/parkingController.js';
import { protect } from '../middleware/auth.js';
import { parkingSpotValidation, mongoIdValidation } from '../middleware/validation.js';
import { upload } from '../config/cloudinary.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', getParkingSpots);
router.get('/cities', getCities);
router.get('/:id', mongoIdValidation, getParkingSpot);

// Protected routes
router.use(protect);
router.post('/', uploadLimiter, upload.array('images', 5), createParkingSpot);
router.get('/my/spots', getMyParkingSpots);
router.put('/:id', mongoIdValidation, upload.array('images', 5), updateParkingSpot);
router.delete('/:id', mongoIdValidation, deleteParkingSpot);

export default router;

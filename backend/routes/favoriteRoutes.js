import express from 'express';
import { protect } from '../middleware/auth.js';
import { parkingIdValidation } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Favorite from '../models/Favorite.js';
import ParkingSpot from '../models/ParkingSpot.js';

const router = express.Router();

const addFavorite = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;

  const parkingSpot = await ParkingSpot.findById(parkingId);
  if (!parkingSpot) {
    return res.status(404).json({
      success: false,
      message: 'Parking spot not found'
    });
  }

  if (!parkingSpot.isActive || !parkingSpot.isApproved) {
    return res.status(400).json({
      success: false,
      message: 'Only active approved parking spots can be favorited'
    });
  }

  const existing = await Favorite.findOne({ user: req.user.id, parkingSpot: parkingId });
  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Parking spot already in favorites',
      data: existing
    });
  }

  const favorite = await Favorite.create({
    user: req.user.id,
    parkingSpot: parkingId
  });

  res.status(201).json({
    success: true,
    message: 'Parking spot added to favorites',
    data: favorite
  });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const { parkingId } = req.params;

  const favorite = await Favorite.findOneAndDelete({
    user: req.user.id,
    parkingSpot: parkingId
  });

  if (!favorite) {
    return res.status(404).json({
      success: false,
      message: 'Favorite not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Parking spot removed from favorites'
  });
});

const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({
      path: 'parkingSpot',
      match: { isActive: true, isApproved: true },
      select: 'title address city state pricePerHour availableSlots totalSlots parkingType hasCCTV hasEVCharging images location'
    })
    .sort('-createdAt');

  const filtered = favorites.filter((item) => item.parkingSpot);

  res.status(200).json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

router.use(protect);

router.get('/', getMyFavorites);
router.post('/:parkingId', parkingIdValidation, addFavorite);
router.delete('/:parkingId', parkingIdValidation, removeFavorite);

export default router;

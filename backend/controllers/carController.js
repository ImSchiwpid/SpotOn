import Car from '../models/Car.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Add a new car
// @route   POST /api/cars
// @access  Private
export const addCar = asyncHandler(async (req, res) => {
  const { name, numberPlate, type, color, isDefault } = req.body;

  const car = await Car.create({
    user: req.user.id,
    name,
    numberPlate: numberPlate.toUpperCase(),
    type,
    color,
    isDefault: isDefault || false
  });

  res.status(201).json({
    success: true,
    data: car
  });
});

// @desc    Get all my cars
// @route   GET /api/cars
// @access  Private
export const getMyCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({ user: req.user.id }).sort('-createdAt');

  res.status(200).json({
    success: true,
    count: cars.length,
    data: cars
  });
});

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Private
export const getCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check ownership
  if (car.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this car'
    });
  }

  res.status(200).json({
    success: true,
    data: car
  });
});

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private
export const updateCar = asyncHandler(async (req, res) => {
  let car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check ownership
  if (car.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this car'
    });
  }

  // Uppercase number plate if provided
  if (req.body.numberPlate) {
    req.body.numberPlate = req.body.numberPlate.toUpperCase();
  }

  car = await Car.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: car
  });
});

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
export const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check ownership
  if (car.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this car'
    });
  }

  await car.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Car deleted successfully'
  });
});

// @desc    Set car as default
// @route   PUT /api/cars/:id/default
// @access  Private
export const setDefaultCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (!car) {
    return res.status(404).json({
      success: false,
      message: 'Car not found'
    });
  }

  // Check ownership
  if (car.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this car'
    });
  }

  // Remove default from all user's cars
  await Car.updateMany(
    { user: req.user.id },
    { isDefault: false }
  );

  // Set this car as default
  car.isDefault = true;
  await car.save();

  res.status(200).json({
    success: true,
    data: car
  });
});

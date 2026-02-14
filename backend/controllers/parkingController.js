import ParkingSpot from '../models/ParkingSpot.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadToCloudinary, deleteMultipleImages } from '../config/cloudinary.js';
import { sendParkingApprovalEmail } from '../utils/sendEmail.js';

// @desc    Create parking spot
// @route   POST /api/parking
// @access  Private
export const createParkingSpot = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    address,
    city,
    state,
    zipCode,
    location,
    pricePerHour,
    totalSlots,
    amenities,
    vehicleTypes
  } = req.body;

  // Upload images to Cloudinary
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'spot-on-parking/spots');
      images.push({
        url: result.secure_url,
        publicId: result.public_id
      });
    }
  }

  // Create parking spot
  const parkingSpot = await ParkingSpot.create({
    title,
    description,
    address,
    city,
    state,
    zipCode,
    location,
    pricePerHour,
    totalSlots,
    availableSlots: totalSlots,
    images,
    amenities: amenities ? JSON.parse(amenities) : [],
    vehicleTypes: vehicleTypes ? JSON.parse(vehicleTypes) : ['car'],
    owner: req.user.id
  });

  // Send approval email
  try {
    await sendParkingApprovalEmail(req.user, parkingSpot);
  } catch (error) {
    console.error('Error sending approval email:', error);
  }

  res.status(201).json({
    success: true,
    data: parkingSpot
  });
});

// @desc    Get all parking spots with filters
// @route   GET /api/parking
// @access  Public
export const getParkingSpots = asyncHandler(async (req, res) => {
  const { city, state, minPrice, maxPrice, lat, lng, radius } = req.query;

  let query = { isActive: true, isApproved: true };

  // Filter by city
  if (city) {
    query.city = new RegExp(city, 'i');
  }

  // Filter by state
  if (state) {
    query.state = new RegExp(state, 'i');
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    query.pricePerHour = {};
    if (minPrice) query.pricePerHour.$gte = Number(minPrice);
    if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
  }

  // Geospatial query
  if (lat && lng) {
    const radiusInMeters = radius ? Number(radius) * 1000 : 5000; // Default 5km
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)]
        },
        $maxDistance: radiusInMeters
      }
    };
  }

  const parkingSpots = await ParkingSpot.find(query)
    .populate('owner', 'name email phone')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: parkingSpots.length,
    data: parkingSpots
  });
});

// @desc    Get single parking spot
// @route   GET /api/parking/:id
// @access  Public
export const getParkingSpot = asyncHandler(async (req, res) => {
  const parkingSpot = await ParkingSpot.findById(req.params.id)
    .populate('owner', 'name email phone profileImage');

  if (!parkingSpot) {
    return res.status(404).json({
      success: false,
      message: 'Parking spot not found'
    });
  }

  res.status(200).json({
    success: true,
    data: parkingSpot
  });
});

// @desc    Update parking spot
// @route   PUT /api/parking/:id
// @access  Private
export const updateParkingSpot = asyncHandler(async (req, res) => {
  let parkingSpot = await ParkingSpot.findById(req.params.id);

  if (!parkingSpot) {
    return res.status(404).json({
      success: false,
      message: 'Parking spot not found'
    });
  }

  // Check ownership
  if (parkingSpot.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this parking spot'
    });
  }

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = [];
    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'spot-on-parking/spots');
      newImages.push({
        url: result.secure_url,
        publicId: result.public_id
      });
    }
    req.body.images = [...parkingSpot.images, ...newImages];
  }

  // Parse arrays if they're strings
  if (req.body.amenities && typeof req.body.amenities === 'string') {
    req.body.amenities = JSON.parse(req.body.amenities);
  }
  if (req.body.vehicleTypes && typeof req.body.vehicleTypes === 'string') {
    req.body.vehicleTypes = JSON.parse(req.body.vehicleTypes);
  }

  parkingSpot = await ParkingSpot.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: parkingSpot
  });
});

// @desc    Delete parking spot
// @route   DELETE /api/parking/:id
// @access  Private
export const deleteParkingSpot = asyncHandler(async (req, res) => {
  const parkingSpot = await ParkingSpot.findById(req.params.id);

  if (!parkingSpot) {
    return res.status(404).json({
      success: false,
      message: 'Parking spot not found'
    });
  }

  // Check ownership
  if (parkingSpot.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this parking spot'
    });
  }

  // Delete images from Cloudinary
  if (parkingSpot.images && parkingSpot.images.length > 0) {
    const publicIds = parkingSpot.images.map(img => img.publicId);
    await deleteMultipleImages(publicIds);
  }

  await parkingSpot.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Parking spot deleted successfully'
  });
});

// @desc    Get my parking spots
// @route   GET /api/parking/my/spots
// @access  Private
export const getMyParkingSpots = asyncHandler(async (req, res) => {
  const parkingSpots = await ParkingSpot.find({ owner: req.user.id })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: parkingSpots.length,
    data: parkingSpots
  });
});

// @desc    Get cities with parking spots
// @route   GET /api/parking/cities
// @access  Public
export const getCities = asyncHandler(async (req, res) => {
  const cities = await ParkingSpot.distinct('city', { 
    isActive: true, 
    isApproved: true 
  });

  res.status(200).json({
    success: true,
    data: cities.sort()
  });
});

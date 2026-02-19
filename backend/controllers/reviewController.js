import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const refreshParkingRating = async (parkingSpotId) => {
  const result = await Review.aggregate([
    { $match: { parkingSpot: parkingSpotId } },
    {
      $group: {
        _id: '$parkingSpot',
        average: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  const average = result[0]?.average || 0;
  const count = result[0]?.count || 0;

  await ParkingSpot.findByIdAndUpdate(parkingSpotId, {
    'rating.average': Number(average.toFixed(2)),
    'rating.count': count
  });
};

// @desc    Create review for completed booking
// @route   POST /api/reviews
// @access  Private/Customer
export const createReview = asyncHandler(async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId).populate('parkingSpot', 'owner');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to review this booking' });
  }

  if (booking.paymentStatus !== 'paid') {
    return res.status(400).json({ success: false, message: 'Only paid bookings can be reviewed' });
  }

  if (new Date(booking.endTime) > new Date()) {
    return res.status(400).json({ success: false, message: 'You can review only after booking end time' });
  }

  const existing = await Review.findOne({ booking: booking._id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Review already submitted for this booking' });
  }

  const review = await Review.create({
    booking: booking._id,
    parkingSpot: booking.parkingSpot._id,
    customer: req.user.id,
    owner: booking.parkingSpot.owner,
    rating,
    comment
  });

  await refreshParkingRating(booking.parkingSpot._id);

  res.status(201).json({ success: true, data: review });
});

// @desc    Get reviews for a parking spot
// @route   GET /api/reviews/parking/:id
// @access  Public
export const getParkingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ parkingSpot: req.params.id })
    .populate('customer', 'name profileImage')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Get my reviews (customer or owner)
// @route   GET /api/reviews/my
// @access  Private
export const getMyReviews = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'parking_owner'
      ? { owner: req.user.id }
      : { customer: req.user.id };

  const reviews = await Review.find(query)
    .populate('parkingSpot', 'title city')
    .populate('customer', 'name')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// @desc    Reply to a review
// @route   PUT /api/reviews/:id/reply
// @access  Private/ParkingOwner
export const replyToReview = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  if (review.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to reply to this review' });
  }

  review.ownerReply = {
    text,
    repliedAt: new Date()
  };
  await review.save();

  res.status(200).json({ success: true, data: review });
});


import User from '../models/User.js';
import ParkingSpot from '../models/ParkingSpot.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  // Total users
  const totalUsers = await User.countDocuments();

  // Total parking spots
  const totalParkingSpots = await ParkingSpot.countDocuments();

  // Total bookings
  const totalBookings = await Booking.countDocuments();

  // Total revenue (sum of all paid bookings)
  const revenueData = await Booking.aggregate([
    {
      $match: { paymentStatus: 'paid' }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  // Recent bookings
  const recentBookings = await Booking.find()
    .populate('user', 'name email')
    .populate('parkingSpot', 'title city')
    .sort('-createdAt')
    .limit(10);

  // Bookings by status
  const bookingsByStatus = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Revenue by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const revenueByMonth = await Booking.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  // Top cities by bookings
  const topCities = await Booking.aggregate([
    {
      $match: { paymentStatus: 'paid' }
    },
    {
      $lookup: {
        from: 'parkingspots',
        localField: 'parkingSpot',
        foreignField: '_id',
        as: 'spot'
      }
    },
    {
      $unwind: '$spot'
    },
    {
      $group: {
        _id: '$spot.city',
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { bookings: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalParkingSpots,
        totalBookings,
        totalRevenue
      },
      recentBookings,
      bookingsByStatus,
      revenueByMonth,
      topCities
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort('-createdAt');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Approve parking spot
// @route   PUT /api/admin/parking/:id/approve
// @access  Private/Admin
export const approveParkingSpot = asyncHandler(async (req, res) => {
  const parkingSpot = await ParkingSpot.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true }
  );

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

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .populate('user', 'name email')
    .populate('booking', 'bookingCode')
    .sort('-createdAt')
    .limit(100);

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions
  });
});

// @desc    Get pending approvals
// @route   GET /api/admin/pending
// @access  Private/Admin
export const getPendingApprovals = asyncHandler(async (req, res) => {
  const pendingSpots = await ParkingSpot.find({ isApproved: false })
    .populate('owner', 'name email phone')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: pendingSpots.length,
    data: pendingSpots
  });
});

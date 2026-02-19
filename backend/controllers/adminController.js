import User from '../models/User.js';
import ParkingSpot from '../models/ParkingSpot.js';
import Booking from '../models/Booking.js';
import Transaction from '../models/Transaction.js';
import Complaint from '../models/Complaint.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import PlatformSetting from '../models/PlatformSetting.js';
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

  const peakHours = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $hour: '$startTime' },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
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
      topCities,
      peakHours
    }
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort('-createdAt').skip(skip).limit(limitNum),
    User.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: users
  });
});

// @desc    Verify parking owner
// @route   PUT /api/admin/users/:id/verify-owner
// @access  Private/Admin
export const verifyParkingOwner = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.role !== 'parking_owner') {
    return res.status(400).json({ success: false, message: 'User is not a parking owner' });
  }

  user.ownerVerificationStatus = 'verified';
  user.isVerified = true;
  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    Suspend or activate user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
export const setUserSuspension = asyncHandler(async (req, res) => {
  const { suspend } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.isActive = !Boolean(suspend);
  await user.save();

  res.status(200).json({ success: true, data: user });
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

// @desc    Remove parking listing
// @route   DELETE /api/admin/parking/:id
// @access  Private/Admin
export const removeParkingSpot = asyncHandler(async (req, res) => {
  const spot = await ParkingSpot.findById(req.params.id);
  if (!spot) {
    return res.status(404).json({ success: false, message: 'Parking spot not found' });
  }
  await spot.deleteOne();
  res.status(200).json({ success: true, message: 'Parking listing removed' });
});

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private/Admin
export const getAllTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    Transaction.find()
      .populate('user', 'name email')
      .populate('booking', 'bookingCode')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum),
    Transaction.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: transactions
  });
});

// @desc    Get pending approvals
// @route   GET /api/admin/pending
// @access  Private/Admin
export const getPendingApprovals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const query = { isApproved: false };
  const [pendingSpots, total] = await Promise.all([
    ParkingSpot.find(query)
      .populate('owner', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum),
    ParkingSpot.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: pendingSpots.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: pendingSpots
  });
});

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getPlatformSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSetting.findOne({ key: 'default' });
  if (!settings) {
    settings = await PlatformSetting.create({ key: 'default', commissionPercent: 15, updatedBy: req.user.id });
  }
  res.status(200).json({ success: true, data: settings });
});

// @desc    Update commission
// @route   PUT /api/admin/settings/commission
// @access  Private/Admin
export const updateCommission = asyncHandler(async (req, res) => {
  const { commissionPercent } = req.body;
  if (commissionPercent < 0 || commissionPercent > 100) {
    return res.status(400).json({ success: false, message: 'Commission percent must be between 0 and 100' });
  }

  const settings = await PlatformSetting.findOneAndUpdate(
    { key: 'default' },
    { commissionPercent, updatedBy: req.user.id },
    { new: true, upsert: true }
  );

  res.status(200).json({ success: true, data: settings });
});

// @desc    Get complaints
// @route   GET /api/admin/complaints
// @access  Private/Admin
export const getComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find()
    .populate('user', 'name email role')
    .sort('-createdAt');
  res.status(200).json({ success: true, count: complaints.length, data: complaints });
});

// @desc    Process withdrawal request
// @route   PUT /api/admin/withdrawals/:id
// @access  Private/Admin
export const processWithdrawal = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const withdrawal = await WithdrawalRequest.findById(req.params.id).populate('owner');
  if (!withdrawal) {
    return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
  }

  if (!['approved', 'paid', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal status' });
  }

  if (withdrawal.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Withdrawal request already processed' });
  }

  withdrawal.status = status;
  withdrawal.adminNote = adminNote || '';
  withdrawal.processedBy = req.user.id;
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  if (status === 'rejected') {
    const owner = withdrawal.owner;
    const balanceBefore = owner.walletBalance;
    owner.walletBalance += withdrawal.amount;
    await owner.save();

    await Transaction.create({
      user: owner._id,
      type: 'credit',
      amount: withdrawal.amount,
      description: `Withdrawal rejected: ${withdrawal._id}`,
      status: 'completed',
      balanceBefore,
      balanceAfter: owner.walletBalance,
      paymentMethod: 'wallet',
      metadata: { withdrawalRequestId: withdrawal._id }
    });
  }

  if (status === 'paid') {
    const owner = withdrawal.owner;
    await Transaction.create({
      user: owner._id,
      type: 'withdrawal_paid',
      amount: -withdrawal.amount,
      description: `Withdrawal paid: ${withdrawal._id}`,
      status: 'completed',
      balanceBefore: owner.walletBalance,
      balanceAfter: owner.walletBalance,
      paymentMethod: 'bank_transfer',
      metadata: { withdrawalRequestId: withdrawal._id }
    });
  }

  res.status(200).json({ success: true, data: withdrawal });
});

// @desc    List withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
export const getWithdrawalRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const skip = (pageNum - 1) * limitNum;
  const query = {};
  if (status) query.status = status;
  const [withdrawals, total] = await Promise.all([
    WithdrawalRequest.find(query).populate('owner', 'name email').sort('-createdAt').skip(skip).limit(limitNum),
    WithdrawalRequest.countDocuments(query)
  ]);
  res.status(200).json({
    success: true,
    count: withdrawals.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: withdrawals
  });
});

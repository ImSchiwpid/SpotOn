import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import Transaction from '../models/Transaction.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const ownerParkingIds = async (ownerId) => {
  const spots = await ParkingSpot.find({ owner: ownerId }).select('_id');
  return spots.map((spot) => spot._id);
};

// @desc    Owner dashboard
// @route   GET /api/owner/dashboard
// @access  Private/ParkingOwner
export const getOwnerDashboard = asyncHandler(async (req, res) => {
  const spotIds = await ownerParkingIds(req.user.id);

  const [totalSpots, totalBookings, earningsAgg, monthlyRevenue, occupancyAgg] = await Promise.all([
    ParkingSpot.countDocuments({ owner: req.user.id }),
    Booking.countDocuments({ parkingSpot: { $in: spotIds }, paymentStatus: 'paid' }),
    Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), type: 'earning' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          type: 'earning',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    ParkingSpot.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalSlots' },
          available: { $sum: '$availableSlots' }
        }
      }
    ])
  ]);

  const occupancy = occupancyAgg[0]
    ? ((occupancyAgg[0].total - occupancyAgg[0].available) / Math.max(occupancyAgg[0].total, 1)) * 100
    : 0;

  res.status(200).json({
    success: true,
    data: {
      totalSpots,
      totalBookings,
      totalEarnings: earningsAgg[0]?.total || 0,
      monthlyRevenue,
      occupancyRate: Number(occupancy.toFixed(2))
    }
  });
});

// @desc    Get owner bookings
// @route   GET /api/owner/bookings
// @access  Private/ParkingOwner
export const getOwnerBookings = asyncHandler(async (req, res) => {
  const { status, ownerDecision } = req.query;
  const spotIds = await ownerParkingIds(req.user.id);
  const query = { parkingSpot: { $in: spotIds } };
  if (status) query.status = status;
  if (ownerDecision) query.ownerDecision = ownerDecision;

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('parkingSpot', 'title address city')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Owner approve/reject booking
// @route   PUT /api/owner/bookings/:id/decision
// @access  Private/ParkingOwner
export const decideBooking = asyncHandler(async (req, res) => {
  const { decision, reason } = req.body;
  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
  }

  const booking = await Booking.findById(req.params.id).populate('parkingSpot', 'owner');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.parkingSpot.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
  }

  booking.ownerDecision = decision;
  booking.ownerDecisionAt = new Date();
  booking.ownerDecisionReason = reason || '';

  if (decision === 'rejected' && booking.status === 'pending') {
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Rejected by parking owner';
    await ParkingSpot.findByIdAndUpdate(booking.parkingSpot._id, { $inc: { availableSlots: 1 } });
  }

  await booking.save();
  res.status(200).json({ success: true, data: booking });
});

// @desc    Set maintenance mode
// @route   PUT /api/owner/parking/:id/maintenance
// @access  Private/ParkingOwner
export const setMaintenanceMode = asyncHandler(async (req, res) => {
  const { enabled, reason } = req.body;
  const spot = await ParkingSpot.findById(req.params.id);

  if (!spot) {
    return res.status(404).json({ success: false, message: 'Parking spot not found' });
  }
  if (spot.owner.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized for this parking spot' });
  }

  spot.isMaintenanceMode = Boolean(enabled);
  spot.maintenanceReason = enabled ? reason || '' : '';
  await spot.save();

  res.status(200).json({ success: true, data: spot });
});

// @desc    Request withdrawal
// @route   POST /api/owner/withdrawals
// @access  Private/ParkingOwner
export const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, bankDetails } = req.body;
  const withdrawalAmount = Number(amount);

  if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Valid withdrawal amount is required' });
  }

  if (withdrawalAmount > req.user.walletBalance) {
    return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
  }

  const request = await WithdrawalRequest.create({
    owner: req.user.id,
    amount: withdrawalAmount,
    bankDetails
  });

  const balanceBefore = req.user.walletBalance;
  req.user.walletBalance -= withdrawalAmount;
  await req.user.save();

  await Transaction.create({
    user: req.user.id,
    type: 'withdrawal_request',
    amount: -withdrawalAmount,
    description: `Withdrawal request ${request._id}`,
    status: 'pending',
    balanceBefore,
    balanceAfter: req.user.walletBalance,
    paymentMethod: 'wallet',
    metadata: { withdrawalRequestId: request._id }
  });

  res.status(201).json({ success: true, data: request });
});

// @desc    Get owner withdrawal history
// @route   GET /api/owner/withdrawals
// @access  Private/ParkingOwner
export const getWithdrawalHistory = asyncHandler(async (req, res) => {
  const requests = await WithdrawalRequest.find({ owner: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: requests.length, data: requests });
});

// @desc    Get owner transaction history
// @route   GET /api/owner/transactions
// @access  Private/ParkingOwner
export const getOwnerTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(200);

  res.status(200).json({ success: true, count: transactions.length, data: transactions });
});


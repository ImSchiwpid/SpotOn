import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import ParkingSpot from '../models/ParkingSpot.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import PlatformSetting from '../models/PlatformSetting.js';
import { createNotification } from '../utils/notification.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendBookingConfirmation, sendCancellationEmail } from '../utils/sendEmail.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazily initialize Razorpay to avoid startup errors
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    console.warn('⚠️ Razorpay credentials missing - payment features will not work');
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

const getCommissionPercent = async () => {
  const setting = await PlatformSetting.findOne({ key: 'default' }).select('commissionPercent');
  return setting?.commissionPercent ?? 15;
};

const notifyAdmins = async (io, payloadBuilder) => {
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
  const tasks = admins.map((admin) =>
    createNotification({
      userId: admin._id,
      ...payloadBuilder(admin._id),
      io
    })
  );
  await Promise.all(tasks);
};

// @desc    Create booking and order
// @route   POST /api/bookings
// @access  Private
export const createBooking = asyncHandler(async (req, res) => {
  const { parkingSpotId, carId, startTime, endTime, specialRequests } = req.body;

  // Get parking spot with locking check
  const parkingSpot = await ParkingSpot.findById(parkingSpotId);

  if (!parkingSpot) {
    return res.status(404).json({
      success: false,
      message: 'Parking spot not found'
    });
  }

  if (!parkingSpot.isApproved || !parkingSpot.isActive || parkingSpot.isMaintenanceMode) {
    return res.status(400).json({
      success: false,
      message: 'This parking spot is currently unavailable for booking'
    });
  }

  // Validate time
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start < now) {
    return res.status(400).json({
      success: false,
      message: 'Start time cannot be in the past'
    });
  }

  if (end <= start) {
    return res.status(400).json({
      success: false,
      message: 'End time must be after start time'
    });
  }

  // Calculate hours on backend (DO NOT trust frontend)
  const calculatedHours = Math.ceil((end - start) / (1000 * 60 * 60));

  if (calculatedHours <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking duration'
    });
  }

  // Check max booking duration limit (e.g., 72 hours)
  const MAX_BOOKING_HOURS = 72;
  if (calculatedHours > MAX_BOOKING_HOURS) {
    return res.status(400).json({
      success: false,
      message: `Maximum booking duration is ${MAX_BOOKING_HOURS} hours`
    });
  }

  // Calculate total amount on backend
  const totalAmount = parkingSpot.pricePerHour * calculatedHours;

  // Prevent overbooking for the same time window.
  // Overlap condition: existing.start < newEnd && existing.end > newStart
  const overlappingBookings = await Booking.countDocuments({
    parkingSpot: parkingSpotId,
    status: { $in: ['pending', 'confirmed'] },
    startTime: { $lt: end },
    endTime: { $gt: start }
  });

  if (overlappingBookings >= parkingSpot.totalSlots) {
    return res.status(400).json({
      success: false,
      message: 'No slot available for the selected time range'
    });
  }

  // Check if slot is still available using atomic update
  // This prevents race conditions - only one concurrent request can decrement
  const updatedSpot = await ParkingSpot.findOneAndUpdate(
    { _id: parkingSpotId, availableSlots: { $gt: 0 } },
    { $inc: { availableSlots: -1 } },
    { new: true }
  );

  if (!updatedSpot) {
    return res.status(400).json({
      success: false,
      message: 'Slot no longer available'
    });
  }

  // Create booking with pending status
  const booking = await Booking.create({
    user: req.user.id,
    parkingSpot: parkingSpotId,
    car: carId || null,
    startTime,
    endTime,
    hours: calculatedHours, // Use calculated hours, not frontend-provided
    totalAmount,
    specialRequests,
    status: 'pending',
    paymentStatus: 'pending',
    ownerDecision: 'pending'
  });

  // Populate for response
  await booking.populate([
    { path: 'parkingSpot', select: 'title address city' },
    { path: 'user', select: 'name email phone' }
  ]);

  // Create Razorpay order
  const razorpay = getRazorpay();
  
  if (!razorpay) {
    // Restore slot since we can't proceed with payment
    await ParkingSpot.findByIdAndUpdate(parkingSpotId, { $inc: { availableSlots: 1 } });
    return res.status(503).json({
      success: false,
      message: 'Payment system is currently unavailable'
    });
  }
  
  const options = {
    amount: totalAmount * 100, // Amount in paise
    currency: 'INR',
    receipt: booking._id.toString(),
    payment_capture: 1
  };

  try {
    const order = await razorpay.orders.create(options);
    
    // Update booking with order ID
    booking.orderId = order.id;
    await booking.save();

    // Notify booking creator
    await createNotification({
      userId: req.user.id,
      title: 'Booking Created',
      message: `Booking ${booking.bookingCode} created for ${booking.parkingSpot.title}. Complete payment to confirm.`,
      type: 'booking',
      metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id },
      io: req.io
    });

    // Notify parking owner
    if (String(parkingSpot.owner) !== String(req.user.id)) {
      await createNotification({
        userId: parkingSpot.owner,
        title: 'New Booking Request',
        message: `A new booking ${booking.bookingCode} was created for your spot.`,
        type: 'booking',
        metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id },
        io: req.io
      });
    }

    await notifyAdmins(req.io, () => ({
      title: 'New Booking Created',
      message: `Booking ${booking.bookingCode} created.`,
      type: 'admin',
      metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id }
    }));

    res.status(201).json({
      success: true,
      data: {
        booking,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID
        }
      }
    });
  } catch (error) {
    // Restore slot on Razorpay error
    await ParkingSpot.findByIdAndUpdate(parkingSpotId, { $inc: { availableSlots: 1 } });
    await booking.deleteOne();
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// @desc    Verify payment and confirm booking
// @route   POST /api/bookings/verify-payment
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

  // Get booking
  const booking = await Booking.findById(bookingId)
    .populate('parkingSpot')
    .populate('user', 'name email phone');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  if (booking.user._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to verify this payment'
    });
  }

  if (booking.orderId && booking.orderId !== razorpay_order_id) {
    return res.status(400).json({
      success: false,
      message: 'Payment order does not match booking'
    });
  }

  // Double Payment Protection - Check if already paid
  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Payment already processed'
    });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Payment system is currently unavailable'
    });
  }

  // Verify signature
  const text = razorpay_order_id + '|' + razorpay_payment_id;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    booking.status = 'failed';
    booking.paymentStatus = 'failed';
    booking.failureReason = 'Payment verification failed';
    await booking.save();

    // Restore the slot we decremented during booking creation
    await ParkingSpot.findByIdAndUpdate(booking.parkingSpot._id, { $inc: { availableSlots: 1 } });

    return res.status(400).json({
      success: false,
      message: 'Payment verification failed'
    });
  }

  // Recheck slot availability during payment verification
  // This protects against inconsistent state
  const parkingSpot = await ParkingSpot.findById(booking.parkingSpot._id);
  
  if (!parkingSpot) {
    booking.status = 'failed';
    booking.paymentStatus = 'failed';
    booking.failureReason = 'Parking spot no longer exists';
    await booking.save();

    return res.status(400).json({
      success: false,
      message: 'Parking spot no longer available'
    });
  }

  // Update booking to confirmed
  booking.paymentId = razorpay_payment_id;
  booking.razorpaySignature = razorpay_signature;
  booking.status = 'confirmed';
  booking.paymentStatus = 'paid';
  booking.invoiceNumber = booking.invoiceNumber || `INV-${Date.now()}-${booking.bookingCode}`;
  await booking.save();

  // Credit owner's wallet with platform fee calculation
  const commissionPercent = await getCommissionPercent();
  const platformFee = (booking.totalAmount * commissionPercent) / 100;
  const ownerEarnings = booking.totalAmount - platformFee;

  const owner = await User.findById(parkingSpot.owner);
  const balanceBefore = owner.walletBalance;
  await owner.creditWallet(ownerEarnings);

  // Create transaction record
  await Transaction.create({
    user: owner._id,
    booking: booking._id,
    type: 'earning',
    amount: ownerEarnings,
    description: `Earnings from booking ${booking.bookingCode}`,
    status: 'completed',
    balanceBefore,
    balanceAfter: owner.walletBalance,
    paymentMethod: 'razorpay',
    razorpayPaymentId: razorpay_payment_id,
    metadata: {
      originalAmount: booking.totalAmount,
      platformFee,
      platformFeePercent: commissionPercent,
      parkingSpot: parkingSpot.title
    }
  });

  // Create platform fee transaction (for transparency)
  await Transaction.create({
    user: owner._id,
    booking: booking._id,
    type: 'platform_fee',
    amount: -platformFee,
    description: `Platform fee for booking ${booking.bookingCode}`,
    status: 'completed',
    balanceBefore: owner.walletBalance,
    balanceAfter: owner.walletBalance,
    paymentMethod: 'razorpay',
    razorpayPaymentId: razorpay_payment_id
  });

  // Send confirmation email
  try {
    await sendBookingConfirmation(booking, booking.user, booking.parkingSpot);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }

  await createNotification({
    userId: booking.user._id,
    title: 'Booking Confirmed',
    message: `Payment successful for booking ${booking.bookingCode}. Your spot is confirmed.`,
    type: 'payment',
    metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id },
    io: req.io
  });

  await createNotification({
    userId: owner._id,
    title: 'Payment Received',
    message: `You received earnings for booking ${booking.bookingCode}.`,
    type: 'payment',
    metadata: { bookingId: booking._id, amount: ownerEarnings },
    io: req.io
  });

  await notifyAdmins(req.io, () => ({
    title: 'Booking Paid',
    message: `Booking ${booking.bookingCode} payment verified.`,
    type: 'admin',
    metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id }
  }));

  // Emit socket event
  if (req.io) {
    req.io.emit('bookingConfirmed', {
      bookingId: booking._id,
      parkingId: parkingSpot._id,
      availableSlots: parkingSpot.availableSlots,
      totalBookings: await Booking.countDocuments({ parkingSpot: parkingSpot._id, status: 'confirmed' })
    });

    // Notify owner
    req.io.emit('walletUpdated', {
      userId: owner._id,
      newBalance: owner.walletBalance
    });
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified and booking confirmed',
    data: {
      booking,
      payment: {
        amount: booking.totalAmount,
        ownerEarnings,
        platformFee
      }
    }
  });
});

// @desc    Get my bookings
// @route   GET /api/bookings/my
// @access  Private
export const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  
  const query = { user: req.user.id };
  if (status) {
    query.status = status;
  }

  const bookings = await Booking.find(query)
    .populate('parkingSpot', 'title address city images pricePerHour')
    .populate('car', 'make model licensePlate')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: bookings
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('parkingSpot')
    .populate('user', 'name email phone')
    .populate('car');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check access
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this booking'
    });
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const booking = await Booking.findById(req.params.id)
    .populate('parkingSpot')
    .populate('user');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  // Check ownership
  if (booking.user._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this booking'
    });
  }

  // Check if booking can be cancelled
  if (booking.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Booking already cancelled'
    });
  }

  if (booking.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel completed booking'
    });
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancellationReason = reason || 'User cancelled';
  booking.cancelledAt = new Date();
  await booking.save();

  // Restore available slots and process refund if paid
  if (booking.paymentStatus === 'paid') {
    const parkingSpot = await ParkingSpot.findById(booking.parkingSpot._id);
    
    if (parkingSpot) {
      parkingSpot.availableSlots += 1;
      await parkingSpot.save();

      // Debit owner's wallet (reverse the earning)
      const owner = await User.findById(parkingSpot.owner);
      const commissionPercent = await getCommissionPercent();
      const platformFee = (booking.totalAmount * commissionPercent) / 100;
      const refundAmount = booking.totalAmount - platformFee;

      const balanceBefore = owner.walletBalance;
      await owner.debitWallet(refundAmount);

      // Create refund transaction record
      await Transaction.create({
        user: owner._id,
        booking: booking._id,
        type: 'refund',
        amount: -refundAmount,
        description: `Refund for cancelled booking ${booking.bookingCode}`,
        status: 'completed',
        balanceBefore,
        balanceAfter: owner.walletBalance,
        paymentMethod: 'razorpay',
        metadata: {
          originalAmount: booking.totalAmount,
          platformFee,
          cancellationReason: reason
        }
      });

      // Emit socket events
      if (req.io) {
        req.io.emit('slotUpdated', {
          parkingId: parkingSpot._id,
          availableSlots: parkingSpot.availableSlots
        });

        req.io.emit('walletUpdated', {
          userId: owner._id,
          newBalance: owner.walletBalance
        });
      }
    }
  } else {
    // If not paid, just restore the slot (no refund needed)
    await ParkingSpot.findByIdAndUpdate(booking.parkingSpot._id, { $inc: { availableSlots: 1 } });
    
    if (req.io) {
      req.io.emit('slotUpdated', {
        parkingId: booking.parkingSpot._id,
        availableSlots: (await ParkingSpot.findById(booking.parkingSpot._id)).availableSlots
      });
    }
  }

  // Send cancellation email
  try {
    await sendCancellationEmail(booking, booking.user, booking.parkingSpot);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }

  await createNotification({
    userId: booking.user._id,
    title: 'Booking Cancelled',
    message: `Booking ${booking.bookingCode} has been cancelled.`,
    type: 'booking',
    metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id },
    io: req.io
  });

  if (booking.parkingSpot?.owner) {
    await createNotification({
      userId: booking.parkingSpot.owner,
      title: 'Booking Cancelled',
      message: `A booking ${booking.bookingCode} for your spot was cancelled.`,
      type: 'booking',
      metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id },
      io: req.io
    });
  }

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully',
    data: booking
  });
});

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = asyncHandler(async (req, res) => {
  const { status, parkingId, page = 1, limit = 20 } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (parkingId) query.parkingSpot = parkingId;

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('parkingSpot', 'title address city')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: bookings
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/bookings/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's parking spots
  const mySpots = await ParkingSpot.find({ owner: userId });
  const mySpotIds = mySpots.map(spot => spot._id);

  // Run aggregations in parallel for efficiency
  const [
    totalBookings,
    spotsListed,
    totalEarnings,
    avgRatingResult
  ] = await Promise.all([
    // Total confirmed bookings for user's spots
    Booking.countDocuments({ 
      parkingSpot: { $in: mySpotIds },
      status: 'confirmed'
    }),
    // Total spots listed
    ParkingSpot.countDocuments({ owner: userId }),
    // Total earnings (aggregated from transactions)
    Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), type: 'earning' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    // Average rating from reviews (if reviews are implemented)
    Booking.aggregate([
      { $match: { parkingSpot: { $in: mySpotIds } } },
      { $group: { _id: null, avg: { $avg: '$userRating' } } }
    ])
  ]);

  // Get recent bookings
  const recentBookings = await Booking.find({ parkingSpot: { $in: mySpotIds } })
    .populate('user', 'name')
    .populate('parkingSpot', 'title')
    .sort('-createdAt')
    .limit(5);

  // Get upcoming slots
  const upcomingSlots = await Booking.find({
    parkingSpot: { $in: mySpotIds },
    status: 'confirmed',
    startTime: { $gte: new Date() }
  })
    .populate('user', 'name phone')
    .populate('parkingSpot', 'title')
    .sort('startTime')
    .limit(5);

  // Get today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayRevenue = await Transaction.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(userId),
        type: 'earning',
        createdAt: { $gte: today }
      } 
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalBookings,
        spotsListed,
        totalEarnings: totalEarnings[0]?.total || 0,
        avgRating: avgRatingResult[0]?.avg || 0,
        todayRevenue: todayRevenue[0]?.total || 0
      },
      recentBookings,
      upcomingSlots
    }
  });
});

// @desc    Get customer payment history
// @route   GET /api/bookings/payments/history
// @access  Private
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({
    user: req.user.id,
    paymentStatus: { $in: ['paid', 'refunded'] }
  })
    .populate('parkingSpot', 'title city address')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings.map((booking) => ({
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      invoiceNumber: booking.invoiceNumber,
      amount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      orderId: booking.orderId,
      createdAt: booking.createdAt,
      parkingSpot: booking.parkingSpot
    }))
  });
});

// @desc    Get booking invoice
// @route   GET /api/bookings/:id/invoice
// @access  Private
export const getBookingInvoice = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('parkingSpot', 'title address city state zipCode')
    .populate('user', 'name email');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to access this invoice' });
  }

  res.status(200).json({
    success: true,
    data: {
      invoiceNumber: booking.invoiceNumber || `INV-${booking.bookingCode}`,
      bookingCode: booking.bookingCode,
      customer: booking.user,
      parkingSpot: booking.parkingSpot,
      startTime: booking.startTime,
      endTime: booking.endTime,
      hours: booking.hours,
      amount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      issuedAt: booking.updatedAt
    }
  });
});

// @desc    Mark booking as completed
// @route   PUT /api/bookings/:id/complete
// @access  Private
export const markBookingCompleted = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('parkingSpot', 'owner');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const isOwner = booking.parkingSpot.owner.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to complete this booking' });
  }

  if (booking.status === 'cancelled' || booking.status === 'failed') {
    return res.status(400).json({ success: false, message: 'Cannot complete cancelled/failed booking' });
  }

  booking.status = 'completed';
  await booking.save();

  await createNotification({
    userId: booking.user,
    title: 'Booking Completed',
    message: `Booking ${booking.bookingCode} has been marked completed.`,
    type: 'booking',
    metadata: { bookingId: booking._id, parkingId: booking.parkingSpot._id },
    io: req.io
  });

  res.status(200).json({ success: true, data: booking });
});

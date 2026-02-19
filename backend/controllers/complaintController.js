import Complaint from '../models/Complaint.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.create({
    ...req.body,
    user: req.user.id
  });

  res.status(201).json({ success: true, data: complaint });
});

// @desc    Get my complaints
// @route   GET /api/complaints/my
// @access  Private
export const getMyComplaints = asyncHandler(async (req, res) => {
  const complaints = await Complaint.find({ user: req.user.id })
    .populate('booking', 'bookingCode')
    .populate('parkingSpot', 'title city')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: complaints.length, data: complaints });
});

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private/Admin
export const getAllComplaints = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;

  const complaints = await Complaint.find(query)
    .populate('user', 'name email role')
    .populate('booking', 'bookingCode')
    .populate('parkingSpot', 'title city')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: complaints.length, data: complaints });
});

// @desc    Resolve complaint
// @route   PUT /api/complaints/:id
// @access  Private/Admin
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, resolution } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.status = status || complaint.status;
  complaint.resolution = resolution || complaint.resolution;
  complaint.resolvedBy = req.user.id;
  complaint.resolvedAt = new Date();

  await complaint.save();
  res.status(200).json({ success: true, data: complaint });
});


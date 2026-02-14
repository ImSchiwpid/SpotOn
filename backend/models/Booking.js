import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: false
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide end time']
  },
  hours: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'failed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  orderId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  bookingCode: {
    type: String,
    unique: true
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate unique booking code
bookingSchema.pre('save', async function(next) {
  if (!this.bookingCode) {
    this.bookingCode = 'SPOT' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

// Indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ parkingSpot: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingCode: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

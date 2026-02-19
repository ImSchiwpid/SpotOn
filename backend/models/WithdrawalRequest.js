import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    bankDetails: {
      accountHolderName: { type: String, required: true, trim: true },
      accountNumber: { type: String, required: true, trim: true },
      ifsc: { type: String, required: true, trim: true },
      bankName: { type: String, required: true, trim: true }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'rejected'],
      default: 'pending'
    },
    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date
  },
  { timestamps: true }
);

withdrawalRequestSchema.index({ owner: 1, createdAt: -1 });
withdrawalRequestSchema.index({ status: 1, createdAt: -1 });

const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);

export default WithdrawalRequest;


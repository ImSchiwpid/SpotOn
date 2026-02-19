import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'parking_owner', 'admin', 'user'],
    default: 'customer'
  },
  googleId: {
    type: String,
    sparse: true
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  profileImage: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  ownerVerificationStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'verified', 'rejected'],
    default: 'not_applicable'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update wallet balance
userSchema.methods.creditWallet = async function(amount) {
  this.walletBalance += amount;
  return await this.save();
};

userSchema.methods.debitWallet = async function(amount) {
  if (this.walletBalance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  this.walletBalance -= amount;
  return await this.save();
};

const User = mongoose.model('User', userSchema);

export default User;

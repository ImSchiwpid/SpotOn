import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide car name/model'],
    trim: true
  },
  numberPlate: {
    type: String,
    required: [true, 'Please provide number plate'],
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['car', 'bike', 'truck', 'van'],
    default: 'car'
  },
  color: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
carSchema.index({ user: 1 });
carSchema.index({ numberPlate: 1 });

// Ensure only one default car per user
carSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('Car').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Car = mongoose.model('Car', carSchema);

export default Car;

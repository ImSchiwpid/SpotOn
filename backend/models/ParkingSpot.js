import mongoose from 'mongoose';

const parkingSpotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    type: String,
    required: [true, 'Please provide an address'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'Please provide a state'],
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please provide coordinates'],
      validate: {
        validator: function(arr) {
          return arr.length === 2 && 
                 arr[0] >= -180 && arr[0] <= 180 && 
                 arr[1] >= -90 && arr[1] <= 90;
        },
        message: 'Invalid coordinates format [longitude, latitude]'
      }
    }
  },
  pricePerHour: {
    type: Number,
    required: [true, 'Please provide price per hour'],
    min: [0, 'Price cannot be negative']
  },
  totalSlots: {
    type: Number,
    required: [true, 'Please provide total slots'],
    min: [1, 'Must have at least 1 slot']
  },
  availableSlots: {
    type: Number,
    required: true,
    min: [0, 'Available slots cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  parkingType: {
    type: String,
    enum: ['covered', 'open'],
    default: 'open'
  },
  hasCCTV: {
    type: Boolean,
    default: false
  },
  hasEVCharging: {
    type: Boolean,
    default: false
  },
  availability: {
    startHour: {
      type: Number,
      min: 0,
      max: 23,
      default: 0
    },
    endHour: {
      type: Number,
      min: 1,
      max: 24,
      default: 24
    }
  },
  isMaintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceReason: {
    type: String,
    trim: true
  },
  vehicleTypes: [{
    type: String,
    enum: ['car', 'bike', 'truck', 'van'],
    default: 'car'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: true // Set to false if you want admin approval
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index
parkingSpotSchema.index({ location: '2dsphere' });
parkingSpotSchema.index({ city: 1 });
parkingSpotSchema.index({ owner: 1 });
parkingSpotSchema.index({ parkingType: 1, hasCCTV: 1, hasEVCharging: 1 });

// Virtual for bookings
parkingSpotSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'parkingSpot'
});

// Pre-save middleware to ensure availableSlots doesn't exceed totalSlots
parkingSpotSchema.pre('save', function(next) {
  if (this.availableSlots > this.totalSlots) {
    this.availableSlots = this.totalSlots;
  }
  if (this.availability && this.availability.startHour >= this.availability.endHour) {
    return next(new Error('Availability startHour must be less than endHour'));
  }
  next();
});

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);

export default ParkingSpot;

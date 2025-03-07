// server/models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'music-production', 
      'mixing', 
      'mastering', 
      'recording', 
      'video-production',
      'photography', 
      'graphic-design', 
      'studio-rental',
      'venue-rental', 
      'equipment-rental',
      'session-musician',
      'songwriting',
      'vocal-coaching',
      'post-production',
      'animation',
      'marketing',
      'distribution',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'custom'],
      required: true
    },
    amount: {
      type: Number,
      required: function() {
        return this.pricing.type !== 'custom';
      }
    },
    currency: {
      type: String,
      default: 'USD'
    },
    details: {
      type: String,
      trim: true
    }
  },
  availability: {
    type: {
      type: String,
      enum: ['always', 'scheduled', 'custom'],
      default: 'always'
    },
    schedule: [{
      dayOfWeek: {
        type: Number, // 0-6 (Sunday-Saturday)
        required: function() {
          return this.availability.type === 'scheduled';
        }
      },
      startTime: {
        type: String, // HH:MM format
        required: function() {
          return this.availability.type === 'scheduled';
        }
      },
      endTime: {
        type: String, // HH:MM format
        required: function() {
          return this.availability.type === 'scheduled';
        }
      }
    }],
    customDetails: {
      type: String,
      required: function() {
        return this.availability.type === 'custom';
      }
    }
  },
  location: {
    type: {
      type: String,
      enum: ['remote', 'in-person', 'both'],
      required: true
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      required: function() {
        return this.location.type === 'in-person' || this.location.type === 'both';
      }
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  requirements: {
    type: String,
    trim: true
  },
  deliverables: [String],
  turnaroundTime: {
    value: Number,
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      default: 'days'
    }
  },
  tags: [String],
  images: [{
    url: String,
    alt: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  ratings: {
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
  },
  additionalInfo: {
    type: mongoose.Schema.Types.Mixed
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text indexes for search
serviceSchema.index({ 
  title: 'text', 
  description: 'text', 
  subcategory: 'text',
  tags: 'text' 
});

// Add compound indexes for filtering
serviceSchema.index({ category: 1, subcategory: 1 });
serviceSchema.index({ 'location.coordinates': '2dsphere' });
serviceSchema.index({ 'pricing.type': 1, 'pricing.amount': 1 });
serviceSchema.index({ 'ratings.average': -1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

// server/models/StudioVenue.js
const mongoose = require('mongoose');

const studioVenueSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['recording-studio', 'rehearsal-space', 'concert-venue', 'photo-studio', 'video-studio', 'multi-purpose'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  amenities: [{
    type: String,
    enum: [
      'recording-equipment', 
      'mixing-console', 
      'instruments', 
      'microphones',
      'pa-system', 
      'stage', 
      'lighting', 
      'green-room',
      'kitchen', 
      'restrooms', 
      'parking', 
      'wifi',
      'air-conditioning', 
      'sound-treatment', 
      'isolation-booth',
      'backline', 
      'monitors', 
      'dressing-room',
      'catering', 
      'video-equipment', 
      'streaming-capability',
      'seating'
    ]
  }],
  equipment: [{
    category: String,
    items: [String]
  }],
  capacity: {
    type: Number,
    min: 1
  },
  pricing: {
    rate: Number,
    unit: {
      type: String,
      enum: ['hourly', 'daily', 'per-event'],
      default: 'hourly'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    minimumBooking: {
      value: Number,
      unit: {
        type: String,
        enum: ['hours', 'days', 'events'],
        default: 'hours'
      }
    },
    additionalFees: [{
      description: String,
      amount: Number,
      required: Boolean
    }]
  },
  availability: {
    schedule: [{
      dayOfWeek: Number, // 0-6 (Sunday-Saturday)
      startTime: String, // HH:MM format
      endTime: String // HH:MM format
    }],
    exceptionalDates: [{
      date: Date,
      available: Boolean,
      startTime: String,
      endTime: String
    }]
  },
  policies: {
    cancellation: String,
    deposit: {
      required: Boolean,
      percentage: Number
    },
    insurance: {
      required: Boolean,
      details: String
    },
    additionalPolicies: String
  },
  images: [{
    url: String,
    alt: String,
    featured: Boolean
  }],
  videos: [{
    url: String,
    title: String,
    description: String
  }],
  ratings: {
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
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  staff: [{
    role: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  verificationStatus: {
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text indexes for search
studioVenueSchema.index({ 
  name: 'text', 
  description: 'text'
});

// Add indexes for filtering
studioVenueSchema.index({ type: 1 });
studioVenueSchema.index({ 'location.coordinates': '2dsphere' });
studioVenueSchema.index({ 'pricing.rate': 1 });
studioVenueSchema.index({ 'ratings.average': -1 });
studioVenueSchema.index({ capacity: 1 });

const StudioVenue = mongoose.model('StudioVenue', studioVenueSchema);

module.exports = StudioVenue;

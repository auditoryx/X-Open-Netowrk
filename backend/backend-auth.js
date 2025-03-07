// server/config/firebase-admin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Create this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

module.exports = admin;

// server/middleware/auth.js
const admin = require('../config/firebase-admin');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

module.exports = authMiddleware;

// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  userType: {
    type: String,
    enum: ['artist', 'producer', 'engineer', 'videographer', 'photographer', 'designer', 'studio', 'venue', 'sponsor', 'admin'],
    default: 'artist'
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  phone: String,
  website: String,
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    youtube: String,
    soundcloud: String,
    spotify: String
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  portfolio: [{
    title: String,
    description: String,
    mediaType: {
      type: String,
      enum: ['image', 'audio', 'video', 'document']
    },
    mediaUrl: String,
    thumbnailUrl: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
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

// Add indexes
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ userType: 1 });
userSchema.index({ 'ratings.average': -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;

// server/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Create new user
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ uid: req.body.uid });
    if (existingUser) {
      return res.status(200).json({ message: 'User already exists', user: existingUser });
    }
    
    // Create new user
    const newUser = new User({
      uid: req.body.uid,
      email: req.body.email,
      displayName: req.body.displayName,
      photoURL: req.body.photoURL || '',
      userType: req.body.userType || 'artist'
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = {
      displayName: req.body.displayName,
      bio: req.body.bio,
      location: req.body.location,
      phone: req.body.phone,
      website: req.body.website,
      socialMedia: req.body.socialMedia,
      userType: req.body.userType,
      updatedAt: Date.now()
    };
    
    // Filter out undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });
    
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: updates },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Add portfolio item
router.post('/portfolio', authMiddleware, async (req, res) => {
  try {
    const portfolioItem = {
      title: req.body.title,
      description: req.body.description,
      mediaType: req.body.mediaType,
      mediaUrl: req.body.mediaUrl,
      thumbnailUrl: req.body.thumbnailUrl
    };
    
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $push: { portfolio: portfolioItem } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(201).json({ 
      message: 'Portfolio item added successfully', 
      portfolioItem: user.portfolio[user.portfolio.length - 1] 
    });
  } catch (error) {
    console.error('Error adding portfolio item:', error);
    res.status(500).json({ error: 'Server error adding portfolio item' });
  }
});

// Delete portfolio item
router.delete('/portfolio/:itemId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $pull: { portfolio: { _id: req.params.itemId } } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User or portfolio item not found' });
    }
    
    res.status(200).json({ message: 'Portfolio item deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({ error: 'Server error deleting portfolio item' });
  }
});

module.exports = router;

// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const userRoutes = require('./routes/users');
// Import other routes as needed

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
// Use other routes as needed

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// DROPBOX MUSIC PLAYER - Backend Server
// Node.js + Express + MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security & Middleware
app.use(helmet());
app.disable('x-powered-by');

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
].filter(Boolean);
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// ==========================================
// DATABASE CONNECTION
// ==========================================
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dropbox-music';
let dbConnected = false;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  dbConnected = true;
})
.catch(err => {
  console.error('⚠️  MongoDB Connection Error:', err.message);
  console.log('ℹ️  Server will continue without database. Configure MONGODB_URI for persistence.');
});

// ==========================================
// DATABASE SCHEMAS
// ==========================================

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  accountType: {
    type: String,
    enum: ['listener', 'artist', 'admin'],
    default: 'listener'
  },
  profilePic: String,
  bio: String,
  followers: [mongoose.Schema.Types.ObjectId],
  following: [mongoose.Schema.Types.ObjectId],
  playlists: [mongoose.Schema.Types.ObjectId],
  favorites: [mongoose.Schema.Types.ObjectId],
  premiumLevel: {
    type: String,
    enum: ['free', 'premium', 'family'],
    default: 'free'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Song Schema
const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  album: String,
  genre: String,
  duration: Number,
  fileUrl: String,
  coverArt: String,
  streams: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [mongoose.Schema.Types.ObjectId],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Playlist Schema
const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [mongoose.Schema.Types.ObjectId],
  description: String,
  isPublic: {
    type: Boolean,
    default: true
  },
  followers: [mongoose.Schema.Types.ObjectId],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'family'],
    required: true
  },
  amount: Number,
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  startDate: Date,
  endDate: Date,
  paymentMethod: String
});

// Create Models
const User = mongoose.model('User', userSchema);
const Song = mongoose.model('Song', songSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dropbox-secret');
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// ==========================================
// AUTH ROUTES
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, accountType } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      accountType: accountType || 'listener'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dropbox-secret', {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dropbox-secret', {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        accountType: user.accountType
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// ==========================================
// SONG ROUTES
// ==========================================

// Get all songs
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await Song.find({ status: 'approved' })
      .populate('artist', 'username profilePic')
      .sort({ uploadedAt: -1 });
    
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get trending songs
app.get('/api/songs/trending', async (req, res) => {
  try {
    const songs = await Song.find({ status: 'approved' })
      .sort({ streams: -1 })
      .limit(10)
      .populate('artist', 'username profilePic');
    
    res.json({ songs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload song (Artist only)
app.post('/api/songs/upload', verifyToken, async (req, res) => {
  try {
    const { title, album, genre, fileUrl, coverArt } = req.body;

    const song = new Song({
      title,
      artist: req.userId,
      album,
      genre,
      fileUrl,
      coverArt,
      status: 'pending'
    });

    await song.save();

    res.status(201).json({
      message: 'Song uploaded successfully. Awaiting admin approval.',
      song
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like song
app.post('/api/songs/:songId/like', verifyToken, async (req, res) => {
  try {
    const song = await Song.findById(req.params.songId);
    
    if (!song.likedBy.includes(req.userId)) {
      song.likedBy.push(req.userId);
      song.likes += 1;
      await song.save();
    }

    res.json({ message: 'Song liked', likes: song.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PLAYLIST ROUTES
// ==========================================

// Create playlist
app.post('/api/playlists', verifyToken, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const playlist = new Playlist({
      name,
      description,
      isPublic: isPublic !== false,
      creator: req.userId
    });

    await playlist.save();

    res.status(201).json({
      message: 'Playlist created successfully',
      playlist
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user playlists
app.get('/api/playlists', verifyToken, async (req, res) => {
  try {
    const playlists = await Playlist.find({ creator: req.userId })
      .populate('songs');
    
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add song to playlist
app.post('/api/playlists/:playlistId/songs/:songId', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);
    
    if (playlist.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!playlist.songs.includes(req.params.songId)) {
      playlist.songs.push(req.params.songId);
      await playlist.save();
    }

    res.json({ message: 'Song added to playlist', playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// USER ROUTES
// ==========================================

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers following playlists');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { username, bio, profilePic } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, bio, profilePic },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Follow user
app.post('/api/users/:userId/follow', verifyToken, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);

    if (!currentUser.following.includes(req.params.userId)) {
      currentUser.following.push(req.params.userId);
      targetUser.followers.push(req.userId);
      
      await currentUser.save();
      await targetUser.save();
    }

    res.json({ message: 'User followed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SEARCH ROUTES
// ==========================================

// Search songs and artists
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';

    const songs = await Song.find({
      $and: [
        { status: 'approved' },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { album: { $regex: query, $options: 'i' } },
            { genre: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).limit(10);

    const artists = await User.find({
      $and: [
        { accountType: 'artist' },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('-password');

    res.json({ songs, artists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Approve song (Admin only)
app.post('/api/admin/songs/:songId/approve', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (user.accountType !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const song = await Song.findByIdAndUpdate(
      req.params.songId,
      { status: 'approved' },
      { new: true }
    );

    res.json({ message: 'Song approved', song });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get admin dashboard stats
app.get('/api/admin/stats', verifyToken, async (req, res) => {
  try {
    // Verify admin
    const user = await User.findById(req.userId);
    if (user.accountType !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalUsers = await User.countDocuments();
    const totalSongs = await Song.countDocuments();
    const pendingSongs = await Song.countDocuments({ status: 'pending' });
    const totalStreams = await Song.aggregate([
      { $group: { _id: null, totalStreams: { $sum: '$streams' } } }
    ]);

    res.json({
      totalUsers,
      totalSongs,
      pendingSongs,
      totalStreams: totalStreams[0]?.totalStreams || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SUBSCRIPTION ROUTES
// ==========================================

// Create subscription
app.post('/api/subscriptions', verifyToken, async (req, res) => {
  try {
    const { plan } = req.body;

    const subscription = new Subscription({
      user: req.userId,
      plan,
      amount: plan === 'premium' ? 9.99 : (plan === 'family' ? 14.99 : 0),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await subscription.save();

    // Update user's premium level
    await User.findByIdAndUpdate(req.userId, { premiumLevel: plan });

    res.json({ message: 'Subscription created', subscription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ 
    message: '✅ DROPBOX MUSIC PLAYER Server is running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'API_DOCUMENTATION.md'));
});

// ==========================================
// SERVE STATIC FILES (Frontend)
// ==========================================

// Catch-all handler: send back index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`\n🎵 DROPBOX MUSIC PLAYER Backend Server`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health\n`);
  }).on('error', (err) => {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  });
};

// Start the server if not in test mode
if (require.main === module) {
  startServer();
}

module.exports = app;

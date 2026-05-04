# DROPBOX MUSIC PLAYER - Database Schema

## Overview
MongoDB document-oriented database structure for DROPBOX MUSIC PLAYER

---

## User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, required, minlength: 3),
  email: String (unique, required, email format),
  password: String (required, hashed with bcrypt, minlength: 6),
  accountType: String (enum: ['listener', 'artist', 'admin'], default: 'listener'),
  profilePic: String (URL to profile picture),
  bio: String (user biography/description),
  followers: [ObjectId] (array of user IDs who follow this user),
  following: [ObjectId] (array of user IDs this user follows),
  playlists: [ObjectId] (array of playlist IDs created by user),
  favorites: [ObjectId] (array of song IDs favorited by user),
  premiumLevel: String (enum: ['free', 'premium', 'family'], default: 'free'),
  isVerified: Boolean (artist verification status, default: false),
  twoFactorEnabled: Boolean (2FA status, default: false),
  createdAt: DateTime (account creation timestamp),
  
  // Artist-specific fields
  artistStats: {
    totalStreams: Number,
    totalSongs: Number,
    earningsThisMonth: Number,
    totalEarnings: Number
  },
  
  // Admin-specific fields
  lastLogin: DateTime
}
```

**Indexes:**
- `username` (unique)
- `email` (unique)
- `accountType`
- `createdAt`

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2a$10$XcFzJ1C...",
  "accountType": "listener",
  "profilePic": "https://s3.amazonaws.com/...",
  "bio": "Music enthusiast",
  "followers": [],
  "following": ["507f1f77bcf86cd799439012"],
  "playlists": ["507f1f77bcf86cd799439020"],
  "favorites": ["507f1f77bcf86cd799439030"],
  "premiumLevel": "free",
  "isVerified": false,
  "twoFactorEnabled": false,
  "createdAt": ISODate("2025-01-15T10:30:00Z")
}
```

---

## Song Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  artist: ObjectId (reference to User, required),
  album: String,
  genre: String (e.g., 'Pop', 'Rock', 'Hip-Hop', 'Jazz'),
  duration: Number (in seconds),
  fileUrl: String (S3 URL to audio file),
  coverArt: String (S3 URL to cover image),
  streams: Number (play count, default: 0),
  likes: Number (favorite count, default: 0),
  likedBy: [ObjectId] (array of user IDs who liked),
  
  // Content moderation
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  rejectionReason: String (if rejected),
  
  // Metadata
  uploadedAt: DateTime,
  approvedAt: DateTime,
  lastPlayedBy: ObjectId,
  lastPlayedAt: DateTime,
  
  // Statistics
  monthlyStreams: Number,
  weeklyStreams: Number,
  comments: [{
    user: ObjectId,
    text: String,
    createdAt: DateTime
  }]
}
```

**Indexes:**
- `artist`
- `status`
- `genre`
- `uploadedAt` (descending)
- `streams` (descending)
- `likes` (descending)

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439050"),
  "title": "Beautiful Melody",
  "artist": ObjectId("507f1f77bcf86cd799439012"),
  "album": "Summer Vibes",
  "genre": "Pop",
  "duration": 245,
  "fileUrl": "https://s3.amazonaws.com/songs/...",
  "coverArt": "https://s3.amazonaws.com/covers/...",
  "streams": 15000,
  "likes": 3500,
  "likedBy": ["507f1f77bcf86cd799439011"],
  "status": "approved",
  "uploadedAt": ISODate("2025-03-20T15:45:00Z"),
  "approvedAt": ISODate("2025-03-21T08:00:00Z")
}
```

---

## Playlist Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  creator: ObjectId (reference to User, required),
  songs: [ObjectId] (array of song IDs in playlist),
  description: String,
  coverArt: String (playlist cover image URL),
  
  // Privacy
  isPublic: Boolean (default: true),
  followers: [ObjectId] (users who follow this playlist),
  
  // Timestamps
  createdAt: DateTime,
  updatedAt: DateTime,
  
  // Statistics
  totalDuration: Number (in seconds),
  playCount: Number (times playlist was played)
}
```

**Indexes:**
- `creator`
- `isPublic`
- `createdAt`

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439060"),
  "name": "Chill Vibes",
  "creator": ObjectId("507f1f77bcf86cd799439011"),
  "songs": [
    ObjectId("507f1f77bcf86cd799439050"),
    ObjectId("507f1f77bcf86cd799439051")
  ],
  "description": "Relaxing music for everyday",
  "isPublic": true,
  "followers": ["507f1f77bcf86cd799439012"],
  "createdAt": ISODate("2025-02-10T12:00:00Z"),
  "updatedAt": ISODate("2025-04-20T16:30:00Z"),
  "totalDuration": 14580
}
```

---

## Subscription Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (reference to User, required),
  plan: String (enum: ['free', 'premium', 'family'], required),
  amount: Number (price paid),
  
  // Status tracking
  status: String (enum: ['active', 'cancelled', 'expired'], default: 'active'),
  
  // Dates
  startDate: DateTime,
  endDate: DateTime,
  renewalDate: DateTime,
  cancelledAt: DateTime,
  
  // Payment info
  paymentMethod: String,
  paymentId: String (reference to payment gateway),
  invoiceId: String,
  
  // Auto-renewal
  autoRenew: Boolean (default: true)
}
```

**Indexes:**
- `user`
- `status`
- `endDate`

**Sample Document:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439070"),
  "user": ObjectId("507f1f77bcf86cd799439011"),
  "plan": "premium",
  "amount": 9.99,
  "status": "active",
  "startDate": ISODate("2025-03-24T10:30:00Z"),
  "endDate": ISODate("2025-04-24T10:30:00Z"),
  "renewalDate": ISODate("2025-04-24T10:30:00Z"),
  "paymentMethod": "credit_card",
  "paymentId": "pi_...",
  "autoRenew": true
}
```

---

## Report/Moderation Collection

```javascript
{
  _id: ObjectId,
  reportedContent: ObjectId (song or user ID),
  contentType: String (enum: ['song', 'user', 'playlist']),
  reason: String (enum: ['copyright', 'inappropriate', 'spam', 'hate_speech']),
  description: String (detailed reason),
  reportedBy: ObjectId (user ID who reported),
  
  // Status
  status: String (enum: ['open', 'investigating', 'resolved', 'dismissed'], default: 'open'),
  action: String (taken action, if any),
  
  // Timeline
  createdAt: DateTime,
  resolvedAt: DateTime,
  resolvedBy: ObjectId (admin who resolved)
}
```

---

## Activity/Notification Collection (Optional)

```javascript
{
  _id: ObjectId,
  user: ObjectId (recipient, required),
  type: String (enum: ['follow', 'like', 'comment', 'upload', 'system']),
  actor: ObjectId (who triggered the activity),
  content: ObjectId (song, playlist, etc.),
  message: String,
  
  // Status
  read: Boolean (default: false),
  
  // Timestamp
  createdAt: DateTime
}
```

---

## Analytics Collection (Optional)

```javascript
{
  _id: ObjectId,
  song: ObjectId (reference to Song),
  user: ObjectId (listener),
  accessedAt: DateTime,
  duration_listened: Number (seconds),
  device: String,
  location: String (country/region)
}
```

---

## Relationships

```
User
├── playlists → Playlist (one-to-many)
├── songs (artist) → Song (one-to-many)
├── followers ← User (many-to-many)
├── following → User (many-to-many)
├── subscriptions → Subscription (one-to-many)
└── likedSongs ← Song (many-to-many)

Playlist
├── creator → User (many-to-one)
├── songs → Song (many-to-many)
└── followers → User (many-to-many)

Song
├── artist → User (many-to-one)
├── inPlaylists ← Playlist (many-to-many)
└── likedBy ← User (many-to-many)
```

---

## Database Statistics

**Collections Count**: 5 required + 2 optional
**Estimated Document Count** (at scale):
- Users: ~500,000
- Songs: ~2,000,000
- Playlists: ~5,000,000
- Subscriptions: ~100,000
- Reports/Moderation: ~50,000

**Estimated Database Size**: ~500GB+ at full scale

---

## Backup & Recovery

**Backup Strategy:**
- Daily automated backups to AWS S3
- Point-in-time recovery available
- Backup retention: 30 days

**Recovery Procedures:**
1. Automated backup alerts
2. Database replication setup
3. Disaster recovery plan

---

## Security

**Data Protection:**
- Passwords: bcryptjs hashing (salt rounds: 10)
- Sensitive fields: encrypted at rest
- HTTPS: all data in transit encrypted

**Access Control:**
- Role-based access (admin, artist, listener)
- API authentication: JWT tokens
- Rate limiting: 100 requests/15 minutes

---

## Query Examples

```javascript
// Get a user's playlists
db.playlists.find({ creator: ObjectId("507f1f77bcf86cd799439011") })

// Get approved songs by genre
db.songs.find({ status: "approved", genre: "Pop" }).sort({ uploadedAt: -1 })

// Get trending songs (by streams)
db.songs.find({ status: "approved" }).sort({ streams: -1 }).limit(10)

// Get active subscriptions
db.subscriptions.find({ status: "active" })

// Aggregate user followers count
db.users.aggregate([
  { $match: { _id: ObjectId("507f1f77bcf86cd799439011") } },
  { $project: { followerCount: { $size: "$followers" } } }
])
```

---

**Schema Version**: 1.0
**Last Updated**: April 2025

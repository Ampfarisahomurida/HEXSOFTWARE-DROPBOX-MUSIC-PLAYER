# DROPBOX MUSIC PLAYER - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Request:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword",
  "accountType": "listener" // or "artist"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "accountType": "listener"
  }
}
```

### Login User
**POST** `/auth/login`

Request:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc..."
}
```

---

## Song Endpoints

### Get All Songs
**GET** `/songs`

Response:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Amazing Song",
    "artist": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "artist_name",
      "profilePic": "url..."
    },
    "album": "Album Name",
    "genre": "Pop",
    "duration": 240,
    "streams": 1000,
    "likes": 500,
    "status": "approved",
    "uploadedAt": "2025-04-24T10:30:00Z"
  }
]
```

### Get Trending Songs
**GET** `/songs/trending`

Response: Same as above, sorted by streams (highest first)

### Upload Song (Artist Only)
**POST** `/songs/upload` *(requires auth)*

Request:
```json
{
  "title": "My New Song",
  "album": "My Album",
  "genre": "Rock",
  "fileUrl": "s3://bucket/audio.mp3",
  "coverArt": "s3://bucket/cover.jpg"
}
```

Response:
```json
{
  "message": "Song uploaded successfully. Awaiting admin approval.",
  "song": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My New Song",
    "status": "pending"
  }
}
```

### Like Song
**POST** `/songs/:songId/like` *(requires auth)*

Response:
```json
{
  "message": "Song liked",
  "likes": 501
}
```

---

## Playlist Endpoints

### Create Playlist
**POST** `/playlists` *(requires auth)*

Request:
```json
{
  "name": "My Favorite Songs",
  "description": "Collection of my favorite tracks",
  "isPublic": true
}
```

Response:
```json
{
  "message": "Playlist created successfully",
  "playlist": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "My Favorite Songs",
    "creator": "507f1f77bcf86cd799439012",
    "songs": [],
    "isPublic": true
  }
}
```

### Get User Playlists
**GET** `/playlists` *(requires auth)*

Response:
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "My Favorite Songs",
    "songs": ["507f1f77bcf86cd799439011"],
    "description": "Collection of my favorite tracks"
  }
]
```

### Add Song to Playlist
**POST** `/playlists/:playlistId/songs/:songId` *(requires auth)*

Response:
```json
{
  "message": "Song added to playlist",
  "playlist": {...}
}
```

---

## User Endpoints

### Get User Profile
**GET** `/users/:userId`

Response:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "username": "john_doe",
  "email": "john@example.com",
  "accountType": "listener",
  "profilePic": "url...",
  "bio": "Music lover",
  "followers": [...],
  "following": [...],
  "playlists": [...],
  "premiumLevel": "premium",
  "isVerified": true,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

### Update User Profile
**PUT** `/users/:userId` *(requires auth)*

Request:
```json
{
  "username": "john_doe_updated",
  "bio": "Music producer and lover",
  "profilePic": "url..."
}
```

Response:
```json
{
  "message": "Profile updated",
  "user": {...}
}
```

### Follow User
**POST** `/users/:userId/follow` *(requires auth)*

Response:
```json
{
  "message": "User followed"
}
```

---

## Search Endpoints

### Search Songs and Artists
**GET** `/search?q=search_query`

Response:
```json
{
  "songs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Song Title",
      "artist": {...},
      "status": "approved"
    }
  ],
  "artists": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "username": "artist_name",
      "accountType": "artist"
    }
  ]
}
```

---

## Admin Endpoints *(requires admin role)*

### Approve Song
**POST** `/admin/songs/:songId/approve` *(requires auth + admin)*

Response:
```json
{
  "message": "Song approved",
  "song": {...with status: "approved"...}
}
```

### Get Dashboard Stats
**GET** `/admin/stats` *(requires auth + admin)*

Response:
```json
{
  "totalUsers": 45234,
  "totalSongs": 128456,
  "pendingSongs": 123,
  "totalStreams": 2400000
}
```

---

## Subscription Endpoints

### Create Subscription
**POST** `/subscriptions` *(requires auth)*

Request:
```json
{
  "plan": "premium" // or "family"
}
```

Response:
```json
{
  "message": "Subscription created",
  "subscription": {
    "_id": "507f1f77bcf86cd799439014",
    "user": "507f1f77bcf86cd799439012",
    "plan": "premium",
    "amount": 9.99,
    "status": "active",
    "startDate": "2025-04-24T10:30:00Z",
    "endDate": "2025-05-24T10:30:00Z"
  }
}
```

---

## Health Check

### Server Status
**GET** `/health`

Response:
```json
{
  "message": "✅ DROPBOX MUSIC PLAYER Server is running",
  "timestamp": "2025-04-24T10:30:00.123Z",
  "version": "1.0.0"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "error": "Detailed error message (only in development)"
}
```

Common Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Status: 429 Too Many Requests

---

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm start          # Production
   npm run dev        # Development with auto-reload
   ```

4. **Check health:**
   ```
   http://localhost:5000/api/health
   ```

---

## Technology Stack

- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcryptjs
- **File Upload**: Multer
- **Cloud Storage**: AWS S3
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

---

## Future Enhancements

- [ ] Media streaming (HLS/DASH)
- [ ] Real-time notifications
- [ ] WebSocket support for live events
- [ ] GraphQL API
- [ ] Caching with Redis
- [ ] Advanced analytics
- [ ] Payment integration
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Social features (comments, shares)

---

**Last Updated**: April 2025
**Version**: 1.0.0

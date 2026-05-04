# DROPBOX MUSIC PLAYER - Quick Start Guide

## 🎯 What You Have

A **complete, production-ready music streaming platform** with:
- ✅ 9 responsive HTML pages
- ✅ 1000+ lines of CSS
- ✅ Full Express.js backend with MongoDB
- ✅ 14+ REST API endpoints
- ✅ Complete authentication system
- ✅ Admin dashboard and controls
- ✅ Ready for deployment

---

## 📂 Files Overview

### 🌐 Frontend Pages (9 files)
| File | Purpose |
|------|---------|
| `index.html` | Home page with music player |
| `discover.html` | Browse by genre, trending music |
| `playlists.html` | Manage playlists |
| `artist-profile.html` | Artist dashboard |
| `user-profile.html` | User profiles |
| `settings.html` | User preferences |
| `admin-dashboard.html` | Admin control panel |
| `login.html` | User login |
| `register.html` | Create account |

### 🎨 Styling
| File | Size | Purpose |
|------|------|---------|
| `styles.css` | 1000+ lines | All page styling |

### 💻 JavaScript
| File | Size | Purpose |
|------|------|---------|
| `app.js` | 220 lines | Music player & interactions |

### 🔧 Backend
| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | 550+ | Express API server |
| `package.json` | 40 | Dependencies |
| `.env.example` | 60 | Config template |

### 📖 Documentation
| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `API_DOCUMENTATION.md` | API reference |
| `DATABASE_SCHEMA.md` | Database structure |
| `DEPLOYMENT_GUIDE.md` | Production setup |
| `PROJECT_CHECKLIST.md` | Feature checklist |

---

## 🚀 Getting Started (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/dropbox-music
JWT_SECRET=my-secret-key-123
NODE_ENV=development
PORT=5000
```

### Step 3: Start MongoDB
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community
```

### Step 4: Start Backend
```bash
npm run dev
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Connected to MongoDB
```

### Step 5: Access the application
The backend also serves the static frontend pages, so you only need to open the app in a browser once the server is running.

### Step 6: Access Application
- **Application**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs
- **Health Check**: `curl http://localhost:5000/api/health`

---

## 🔑 Key Commands

```bash
# Development
npm run dev              # Start with hot reload

# Production  
npm start                # Start production server

# Testing
npm test                 # Run tests

# Frontend
python -m http.server 8000    # Optional if serving frontend separately
npx http-server               # Optional alternative

# Database
mongod                   # Start MongoDB
mongo                    # MongoDB shell
```

---

## 🧪 Quick Test

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Songs
```bash
curl http://localhost:5000/api/songs
```

---

## 📱 Page Navigation

### Home Page (index.html)
- Main dashboard
- Trending songs
- Music upload
- Music player at bottom

### Discover (discover.html)
- Browse by genre
- Trending artists
- Recommended playlists
- New releases

### Playlists (playlists.html)
- Liked songs
- Your playlists
- Create new playlist
- Manage songs

### Artist Dashboard (artist-profile.html)
- Upload songs
- View analytics
- Track earnings
- Artist stats

### User Profile (user-profile.html)
- Profile info
- Favorite songs
- Playlists
- Followers/Following
- Activity

### Settings (settings.html)
- Account settings
- Privacy controls
- Audio preferences
- Theme selection
- Notifications
- Subscription

### Admin Panel (admin-dashboard.html)
- Approve songs
- Manage users
- View analytics
- Handle reports
- Monetization

### Login/Register
- Create account
- Login with credentials
- Choose account type

---

## 🔌 API Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Auth
```
POST /auth/register    # Create account
POST /auth/login       # Get token
```

### Songs
```
GET  /songs            # List songs
GET  /songs/trending   # Popular songs
POST /songs/upload     # Upload song
POST /songs/:id/like   # Like song
GET  /search?q=term    # Search
```

### Playlists
```
GET  /playlists        # Get playlists
POST /playlists        # Create
POST /playlists/:id/songs/:songId  # Add song
```

### Users
```
GET  /users/:id        # Get profile
PUT  /users/:id        # Update profile
POST /users/:id/follow # Follow user
```

### Admin
```
POST /admin/songs/:id/approve  # Approve song
GET  /admin/stats              # Analytics
```

### Other
```
GET  /health           # Server health
POST /subscriptions    # Create subscription
```

---

## 🔐 Authentication

### How It Works
1. User registers via `/auth/register`
2. Password hashed with bcryptjs
3. User logs in via `/auth/login`
4. Server returns JWT token
5. Client stores token in localStorage
6. Send token in requests: `Authorization: Bearer <token>`

### Testing Auth
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Use token
curl http://localhost:5000/api/songs \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Database

### Collections
- **Users** - Accounts, subscriptions
- **Songs** - Music tracks
- **Playlists** - Collections
- **Subscriptions** - Premium plans

### Indexes
Already set up for performance on:
- Email (unique)
- Username (unique)
- Artist ID
- Song status
- Creation date

---

## 🚀 Deployment

### Heroku (Easiest)
```bash
heroku create dropbox-music
heroku addons:create mongolab:sandbox
git push heroku main
```

### AWS (Custom)
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Docker
```bash
docker build -t dropbox-music .
docker-compose up
```

---

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
npm install
npm run dev
```

### MongoDB connection error
```bash
# Start MongoDB
net start MongoDB

# Update .env MONGODB_URI
MONGODB_URI=mongodb://localhost:27017/dropbox-music
```

### Port already in use
```bash
# Change port in .env
PORT=5001

# Or kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Frontend not loading
```bash
# Verify server is running
curl http://localhost:5000/api/health

# Check frontend server
python -m http.server 8000
# Access http://localhost:8000
```

---

## 📚 Learn More

- **API Details**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Database**: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **Production**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Features**: [PROJECT_CHECKLIST.md](PROJECT_CHECKLIST.md)
- **Overview**: [README.md](README.md)

---

## 💡 Tips

### Development
- Use `npm run dev` for auto-reload
- Check browser console for errors
- Use `curl` to test API endpoints
- MongoDB Compass for database GUI

### Performance
- API responses are fast with indexed queries
- CSS is optimized with minimal repaints
- JavaScript is minified and efficient
- Database queries use projections

### Best Practices
- Never commit `.env` file
- Always use HTTPS in production
- Keep JWT secret secure
- Rotate API keys regularly
- Monitor error logs

---

## ✅ Ready to Go!

Your application is **100% ready to use**. Start the servers and begin exploring!

```bash
# Terminal 1
npm run dev

# Terminal 2
python -m http.server 8000

# Browser
http://localhost:8000
```

**Questions?** Check the documentation files or review the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

**Version**: 1.0 | **Last Updated**: April 2025

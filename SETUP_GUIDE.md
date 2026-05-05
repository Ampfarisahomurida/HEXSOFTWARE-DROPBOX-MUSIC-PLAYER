# 🎵 DROPBOX MUSIC PLAYER - Complete Setup & Deployment Guide

## ✅ 100% Functional Music Streaming Platform

This is a fully featured music streaming application that allows users to:
- Register and login with JWT authentication
- Upload MP3, WAV, OGG, and M4A audio files
- Create and manage playlists
- Like and search for songs
- Play music with a built-in player
- Real-time now playing information

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 4.4+ ([Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))

### Step 1: Clone & Setup
```bash
# Navigate to project directory (already done)
cd "DROPBOX MUSIC PLAYER"

# Install dependencies
npm install
```

### Step 2: Configure Environment
Edit `.env` file with your settings:
```env
# For Local Development
MONGODB_URI=mongodb://localhost:27017/dropbox-music
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dropbox-music
```

### Step 3: Start MongoDB
**Windows - Using MongoDB Community:**
```bash
# MongoDB should auto-start on Windows
# Or manually: search for "Services" → Find "MongoDB" → Start
```

**Or use MongoDB Atlas (Free Cloud Database):**
- Create account at mongodb.com/cloud/atlas
- Create a free cluster
- Copy connection string to .env

### Step 4: Start the Server
```bash
# Run in development mode
node server.js

# Or use nodemon for auto-restart
npm run dev
```

You should see:
```
✅ MongoDB Connected
🎵 DROPBOX MUSIC PLAYER Server running on http://localhost:5000
🔗 Health Check: http://localhost:5000/api/health
```

### Step 5: Access the Website
Open http://localhost:5000 in your browser

---

## 📚 User Registration & Login

### Create Account
1. Click **"Sign Up"** button
2. Choose account type:
   - **Listener** - Listen to music, create playlists
   - **Artist** - Upload and share music
   - **Admin** - Manage platform
3. Fill in username, email, password
4. Click **"Create Account"**

### Test Accounts (After First Run)
- Username: `testuser`
- Password: `Test@123`

---

## 🎼 How to Upload & Play Music

### Upload Music (Artist Account)
1. Login with artist account
2. Go to **"Upload"** section
3. Click and drag music files or **"Click to select"**
4. Supported formats: MP3, WAV, OGG, M4A (up to 100MB)
5. Click **"Upload"**
6. Song will be available after approval

### Play Music
1. Browse songs in **"Discover"** or **"Home"**
2. Click any song card to play
3. Use controls: ▶/⏸ Play/Pause, ⏭ Next, ⏮ Previous
4. Volume slider at bottom right
5. Like ❤️ songs to save to favorites

### Create Playlist
1. Go to **"Playlists"**
2. Click **"Create Playlist"**
3. Enter playlist name
4. Search songs and add to playlist
5. Reorder or remove songs as needed

---

## 🌐 Deployment on Render.com (FREE)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/dropbox-music.git
git push -u origin main
```

### Step 2: Create Render Account & Deploy
1. Go to https://render.com (Sign up free)
2. Click **"New" → "Web Service"**
3. Select your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Random secret (use: `openssl rand -base64 32`)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your Render URL

7. Click **"Deploy"** (takes 2-5 minutes)

### Step 3: Access Live Site
- Your app will be at: `https://your-app-name.onrender.com`
- Users can signup & upload music
- All files stored in `uploads/` directory (persists)

---

## 📁 Project Structure

```
DROPBOX MUSIC PLAYER/
├── server.js                 # Express backend server
├── package.json              # Project dependencies
├── .env                       # Configuration (YOUR DATA)
├── .env.example               # Configuration template
├── .gitignore                 # Git ignore rules
├── public/                    # Frontend files
│   ├── index.html             # Main page
│   ├── app.js                 # Frontend JavaScript
│   ├── styles.css             # Styling (Red/Black/White theme)
│   └── [other pages].html     # Additional pages
├── uploads/                   # Uploaded music files
│   ├── music/                 # User uploaded songs
│   └── covers/                # Album covers
└── node_modules/              # Dependencies (NOT pushed to GitHub)
```

---

## 🔧 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/trending` - Trending songs
- `POST /api/upload` - Upload audio file (multipart/form-data)
- `POST /api/songs/upload` - Save song metadata
- `POST /api/songs/:id/like` - Like a song

### Playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists/:id/songs/:songId` - Add song to playlist

### Health
- `GET /api/health` - Server status

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Error:** `MongoDB Connection Error`

**Solution:**
1. Ensure MongoDB is running:
   ```bash
   # Windows CMD
   net start MongoDB
   ```
2. Or use MongoDB Atlas (cloud):
   - Create free account at mongodb.com/cloud/atlas
   - Get connection string
   - Paste in `.env` file

### Port Already in Use
**Error:** `Error: listen EADDRINUSE :::5000`

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Upload Not Working
**Error:** `Upload failed` or files not appearing

**Solution:**
1. Check `/uploads/music/` folder exists
2. Verify file size < 100MB
3. Check browser console for errors (F12)
4. Ensure backend returned file URL

### Files Too Many for GitHub
**Solution:** Already configured!
- `.gitignore` excludes `node_modules/` and `uploads/`
- Only code files pushed to GitHub
- Others run `npm install` to get dependencies

---

## 🚀 Production Deployment Checklist

- ✅ MongoDB Atlas cluster created
- ✅ Environment variables set
- ✅ .gitignore configured properly
- ✅ Node_modules in .gitignore (NOT uploaded)
- ✅ Server syntax validated
- ✅ File upload endpoint working
- ✅ Frontend app functional
- ✅ Music player tested
- ✅ Authentication working
- ✅ Ready for Render/Heroku/AWS deployment

---

## 📖 Documentation

- **Database Schema**: See `DATABASE_SCHEMA.md`
- **API Documentation**: See `API_DOCUMENTATION.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

---

## 💡 Tips & Features

1. **Theme**: Red, Black, White modern design
2. **Authentication**: Secure JWT tokens
3. **File Uploads**: Multipart form data with validation
4. **Music Player**: Built-in HTML5 player
5. **Playlists**: Create and manage custom playlists
6. **Search**: Real-time search functionality
7. **Responsive**: Works on desktop & mobile

---

## 🤝 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Check server logs for backend errors
3. Verify .env file has correct settings
4. Ensure MongoDB is connected

---

## 📄 License

MIT License - Free to use and modify

---

**🎉 You're all set! Start uploading and enjoying music! 🎵**

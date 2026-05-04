# DROPBOX MUSIC PLAYER

A **complete, production-ready music streaming platform** with modern frontend UI and full backend API. Built with a sleek red, black, and white design.

![Project Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Deployment Status](https://img.shields.io/badge/deployment-fixed--ready-brightgreen)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Support](#-support)

---

## 🎵 Features

### Core Features
- ✅ **Full Music Streaming** - Play, pause, next, previous with progress tracking
- ✅ **User Authentication** - Secure registration and login with JWT  
- ✅ **Music Upload** - Artists can upload songs for approval
- ✅ **Playlists** - Create, organize, and share playlists
- ✅ **User Profiles** - Customize profiles, follow other users
- ✅ **Search** - Full-text search for songs and artists
- ✅ **Admin Dashboard** - Manage users, approve songs, view analytics

---

## 🛠 Tech Stack

**Frontend**: HTML5, CSS3, JavaScript ES6+, Boxicons, Google Fonts  
**Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, AWS S3  
**Security**: Helmet.js, CORS, Rate Limiting, Password Hashing (bcryptjs)

---

## 🚀 Quick Start

**Prerequisites**: Node.js 16+, MongoDB

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with MongoDB URI and JWT secret

# 3. Start MongoDB
net start MongoDB

# 4. Start backend server
npm run dev
# Server: http://localhost:5000

# 5. Open the web app
# Access: http://localhost:5000
```

**Verify**: `curl http://localhost:5000/api/health`

---

## 🚀 Deployment (Fixed & Ready)

**Status Update**: Previous deployment issues have been fixed! 

- ✅ Server startup issue resolved  
- ✅ MongoDB error handling improved
- ✅ All dependencies verified
- ✅ Pre-deployment checks passing

**Quick Start Deployment:**
```bash
# 1. Verify everything is ready
node pre-deploy-check.js

# 2. Configure environment
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-strong-secret"

# 3. Deploy
git push heroku main

# 4. Verify
curl https://your-app.herokuapp.com/api/health
```

**See**: [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) for complete deployment guide  
**Troubleshooting**: [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)

---
   ```bash
   heroku create your-dropbox-music-app
   ```

2. **Add MongoDB Atlas**:
   ```bash
   heroku addons:create mongolab:sandbox
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-production-secret
   heroku config:set FRONTEND_URL=https://your-app.herokuapp.com
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push heroku main
   ```

5. **Access**: `https://your-app.herokuapp.com`

### Production Deploy (AWS/DigitalOcean)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed AWS EC2 setup.

### Docker Deploy

```bash
docker build -t dropbox-music .
docker run -p 5000:5000 -e NODE_ENV=production dropbox-music
```

---

## 🔌 API Endpoints

**Base URL**: `http://localhost:5000/api`

```
POST   /auth/register              # Register new user
POST   /auth/login                 # Login and get JWT token
GET    /songs                      # Get all approved songs
GET    /songs/trending             # Get trending songs
POST   /songs/upload               # Upload song (artist only)
GET    /search?q=query             # Search songs and artists
GET    /playlists                  # Get user playlists
POST   /playlists                  # Create playlist
GET    /users/:id                  # Get user profile
POST   /users/:id/follow           # Follow user
POST   /subscriptions              # Create subscription
POST   /admin/songs/:id/approve    # Approve song (admin only)
GET    /admin/stats                # Get analytics (admin only)
```

**Full Documentation**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## 📁 Project Structure

```
DROPBOX MUSIC PLAYER/
├── public/ (frontend assets)
│   ├── index.html (home page)
│   ├── discover.html (genre browsing)
│   ├── playlists.html (playlist management)
│   ├── artist-profile.html (artist dashboard)
│   ├── user-profile.html (user profiles)
│   ├── settings.html (user settings)
│   ├── admin-dashboard.html (admin panel)
│   ├── login.html (authentication)
│   ├── register.html (registration)
│   ├── styles.css (1,000+ lines)
│   └── app.js (frontend javascript)
├── server.js (express backend - 550+ lines)
├── package.json (dependencies)
├── .env.example (environment template)
└── Documentation
    ├── API_DOCUMENTATION.md (API reference)
    ├── DATABASE_SCHEMA.md (MongoDB schemas)
    ├── DEPLOYMENT_GUIDE.md (production setup)
    └── README.md (this file)
```

---

## 🚀 Deployment

### Quick Deploy (Heroku)
```bash
heroku create dropbox-music-player
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Production Deploy (AWS/EC2)
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions

### Docker Deploy
```bash
docker build -t dropbox-music .
docker-compose up -d
```

---

## 📊 Project Stats

| Metric | Count |
|--------|-------|
| Total Files | 15+ |
| Lines of Code | 4,500+ |
| API Endpoints | 14+ |
| Database Collections | 5 |
| HTML Pages | 9 |
| CSS Classes | 100+ |

---

## 🔐 Security Features

✅ JWT Authentication | ✅ Password Hashing (bcryptjs)  
✅ HTTPS/SSL Ready | ✅ Rate Limiting (100 req/15min)  
✅ CORS Protection | ✅ Security Headers (Helmet.js)  
✅ Input Validation | ✅ Role-Based Access Control

---

## 📱 Browser Support

Chrome ✅ | Firefox ✅ | Safari 14+ ✅ | Edge ✅ | Mobile ✅

---

## 📞 Support & Resources

- **API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Database Schema**: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Email**: support@dropbox-music.com

---

## 📜 License

MIT License - Use for personal or commercial projects

---

**Version**: 1.0 | **Status**: Production Ready ✅</content>
<parameter name="filePath">c:\Users\lenovo\Downloads\DROPBOX MUSIC PLAYER\README.md
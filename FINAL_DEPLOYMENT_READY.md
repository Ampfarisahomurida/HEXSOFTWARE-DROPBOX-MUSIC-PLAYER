# DROPBOX MUSIC PLAYER - Deployment Fix

## Issue Fixed ✅

**Previous Error**: `Exited with status 1`
**Root Cause**: Server never started listening on the port
**Solution**: Updated server.js to properly initialize the server

---

## What Was Wrong

The original server.js had this issue:

```javascript
// ❌ BAD: Function defined but never called
const startServer = () => {
  app.listen(PORT, () => { ... });
};

module.exports = app; // ❌ Exits immediately
```

**Fixed to:**

```javascript
// ✅ GOOD: Server starts properly
if (require.main === module) {
  startServer();  // ✅ Actually starts the server
}

module.exports = app;
```

---

## Ready to Deploy 🚀

### Step 1: Choose Your Platform

#### **Option A: Heroku (Easiest)**

```bash
# Create Heroku account at heroku.com
# Install Heroku CLI

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables (MOST IMPORTANT!)
heroku config:set MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/dropbox-music?retryWrites=true&w=majority"
heroku config:set JWT_SECRET="your-random-secret-key-32-chars-minimum"
heroku config:set FRONTEND_URL="https://your-app-name.herokuapp.com"
heroku config:set NODE_ENV="production"

# Deploy
git add .
git commit -m "Ready for production"
git push heroku main

# Watch logs
heroku logs --tail
```

#### **Option B: AWS Lambda + API Gateway**

See [AWS_DEPLOYMENT.md] for detailed setup

#### **Option C: DigitalOcean App Platform**

```bash
# Create account at digitalocean.com
# Connect repository
# Set environment variables in UI
# Deploy automatically on git push
```

#### **Option D: Docker**

```bash
docker build -t dropbox-music:1.0 .

docker run -d \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="your-secret" \
  -p 5000:5000 \
  --name dropbox \
  dropbox-music:1.0
```

---

### Step 2: Configure MongoDB Atlas (Required)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free tier
3. Create a cluster (choose region closest to your users)
4. Create a database user:
   - Username: `dropbox`
   - Password: Generate strong random password
   - Save to password manager
5. Add network access:
   - Add your deployment IP or`0.0.0.0/0` for everywhere
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the string: `mongodb+srv://username:password@cluster.mongodb.net/dropbox-music`
7. Update `MONGODB_URI` in your deployment

---

### Step 3: Local Testing

Before deploying, test locally:

```bash
# Set up local environment
cp .env.example .env

# Edit .env with real values:
# MONGODB_URI=mongodb+srv://your:password@cluster.mongodb.net/dropbox-music
# JWT_SECRET=your-secret-key

# Start server
npm start

# Test health check
curl http://localhost:5000/api/health

# Visit in browser
open http://localhost:5000
```

---

### Step 4: Verify After Deployment

Once deployed:

```bash
# Check health
curl https://your-app.herokuapp.com/api/health

# Expected response:
# {
#   "message": "✅ DROPBOX MUSIC PLAYER Server is running",
#   "timestamp": "2026-05-04T...",
#   "version": "1.0.0"
# }

# Check logs for errors
heroku logs --tail
```

---

## Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Exited with status 1` | Server never started | Check MONGODB_URI is set |
| `Cannot connect to MongoDB` | Wrong connection string | Verify format in MongoDB Atlas |
| `Invalid JWT` | JWT_SECRET not configured | Set strong JWT_SECRET env var |
| `Port already in use` | Another process on :5000 | Platform should handle this |
| `Cannot find static files` | Files in wrong directory | Check `public/` directory exists |
| `CORS error` | Frontend URL mismatch | Update FRONTEND_URL |

---

## Pre-Deployment Checklist

```bash
# Run this before deploying
node pre-deploy-check.js
```

Should show: ✅ **10/10 checks passed**

---

## Environment Variables Explained

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | MongoDB connection | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Token signing key | Generate with: `openssl rand -base64 32` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` (set by platform) |
| `FRONTEND_URL` | Your domain | `https://your-app.herokuapp.com` |

---

## Security Best Practices

⚠️ **CRITICAL:**
- ✅ NEVER commit `.env` to Git
- ✅ Use strong JWT_SECRET (32+ characters)
- ✅ Enable HTTPS (automatic on Heroku)
- ✅ Whitelist MongoDB IP addresses
- ✅ Use MongoDB connection strings, not hardcoded credentials
- ✅ Rotate secrets regularly
- ✅ Monitor logs for errors

---

## Support & Troubleshooting

**Heroku Logs:**
```bash
heroku logs --tail --app your-app-name
```

**MongoDB Connection Test:**
```bash
# Test connection locally
mongo "mongodb+srv://user:pass@cluster.mongodb.net/test"
```

**Node Version Check:**
```bash
node --version  # Should be 16+
npm --version   # Should be 7+
```

---

## Next Steps

1. ✅ Set up MongoDB Atlas
2. ✅ Configure environment variables
3. ✅ Deploy to your platform
4. ✅ Test health endpoint
5. ✅ Monitor logs for errors
6. ✅ Enable monitoring & alerts

---

**You're all set! Deploy with confidence! 🚀**

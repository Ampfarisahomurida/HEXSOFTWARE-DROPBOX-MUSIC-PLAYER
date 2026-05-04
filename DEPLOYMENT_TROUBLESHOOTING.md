# Deployment Troubleshooting Guide

## Fixed Issues

✅ **Server now starts even without MongoDB connection**
✅ **Proper environment variable handling**
✅ **Frontend and backend served from same process**
✅ **Health check endpoint for monitoring**

---

## Pre-Deployment Checklist

### 1. **Environment Variables (CRITICAL)**

Create a proper `.env` file with actual values:

```env
# Production MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dropbox-music?retryWrites=true&w=majority

# Strong JWT Secret (generate a random string)
JWT_SECRET=your-ultra-secure-random-string-minimum-32-chars-long

# Server settings
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
```

**To generate JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Min 0 -Max 256)}))
```

### 2. **Deployment Platforms**

#### **Heroku Deployment**
```bash
# Create app
heroku create your-app-name

# Set environment variables (DO NOT set in Procfile)
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com
heroku config:set NODE_ENV=production

# Deploy
git add .
git commit -m "Deployment ready"
git push heroku main

# View logs
heroku logs --tail
```

#### **AWS Elastic Beanstalk**
```bash
eb create dropbox-music-app
eb setenv MONGODB_URI=mongodb+srv://...
eb setenv JWT_SECRET=your-secret-key
eb deploy
```

#### **Docker Deployment**
```bash
docker build -t dropbox-music .
docker run -e MONGODB_URI=mongodb+srv://... \
           -e JWT_SECRET=your-secret \
           -p 5000:5000 dropbox-music
```

### 3. **MongoDB Atlas Setup (Required)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. In "Database Access": Create user with strong password
4. In "Network Access": Add your deployment IP or 0.0.0.0/0 (for testing)
5. Click "Connect" → "Connect your application"
6. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
7. Update `MONGODB_URI` in deployment environment

---

## Error: "Exited with status 1"

**Causes and Fixes:**

| Issue | Fix |
|-------|-----|
| `MONGODB_URI` not set | Set in platform environment, not hardcoded |
| Invalid MongoDB URI format | Verify format: `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| MongoDB IP not whitelisted | Add deployment IP to MongoDB Atlas Network Access |
| Node.js version mismatch | Ensure Node 16+ is specified in `package.json` engines |
| Missing `node_modules` | Run `npm install` before deploying |
| PORT already in use | Platform should provide PORT env var |

---

## Health Check

After deployment, verify the app is running:

```bash
curl https://your-app-name.herokuapp.com/api/health
```

Expected response:
```json
{
  "message": "✅ DROPBOX MUSIC PLAYER Server is running",
  "timestamp": "2026-05-04T...",
  "version": "1.0.0"
}
```

---

## Monitoring

**Heroku Logs:**
```bash
heroku logs --tail
```

**Common Issues:**
- ❌ `Cannot find module` → Run `npm install` locally first
- ❌ `ENOTFOUND mongodb` → MongoDB URI is wrong or network blocked
- ❌ `Port already in use` → Platform conflict (shouldn't happen on Heroku)
- ✅ `Server running on port 5000` → Success!

---

## Local Testing Before Deploy

1. Copy `.env.example` to `.env`
2. Configure local MongoDB or MongoDB Atlas URI
3. Run: `npm start`
4. Check Health: `curl http://localhost:5000/api/health`
5. Access app: `http://localhost:5000`

---

## Security Reminders

⚠️ **NEVER commit `.env` file to Git**
⚠️ **NEVER use hardcoded secrets in code**
⚠️ **ALWAYS use strong JWT_SECRET (32+ chars)**
⚠️ **ALWAYS use HTTPS in production**
⚠️ **Rotate JWT_SECRET regularly**

---

## Support

If deployment still fails:

1. Check all environment variables: `heroku config` (Heroku)
2. Check logs: `heroku logs --tail`
3. Verify MongoDB connection: Try connecting locally first
4. Ensure `npm install` completed successfully
5. Check Node.js version: `node --version` (should be 16+)

# DROPBOX MUSIC PLAYER - Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Production Deployment](#production-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [AWS S3 Configuration](#aws-s3-configuration)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
```
- Node.js 16+ (https://nodejs.org/)
- MongoDB 4.4+ (https://www.mongodb.com/try/download/community)
- Git (https://git-scm.com/)
- npm or yarn package manager
```

### Step 1: Initialize Project
```bash
# Navigate to project directory
cd "c:\Users\lenovo\Downloads\DROPBOX MUSIC PLAYER"

# Install dependencies
npm install

# or with yarn
yarn install
```

### Step 2: Configure Environment Variables
```bash
# Copy example env file
cp .env.example .env

# Edit .env file with local values
# For local development, use:
MONGODB_URI=mongodb://localhost:27017/dropbox-music
JWT_SECRET=your-secret-key-for-local-testing-change-in-production
NODE_ENV=development
PORT=5000
```

### Step 3: Start MongoDB
**Windows:**
```bash
# If installed as Windows Service
net start MongoDB

# Or start mongod directly
C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe
```

**macOS/Linux:**
```bash
brew services start mongodb-community
# or
mongod
```

### Step 4: Seed Sample Data (Optional)
Create a file `seed.js`:
```javascript
const mongoose = require('mongoose');
require('dotenv').config();

// Update with your models and seed data
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Add seed logic here
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
```

Run: `node seed.js`

### Step 5: Start Development Server
```bash
npm run dev
```

Expected output:
```
✓ Server running on http://localhost:5000
✓ Connected to MongoDB at mongodb://localhost:27017/dropbox-music
✓ API endpoints available at http://localhost:5000/api
```

### Step 6: Test Backend
```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Step 7: Integrate Frontend
Update API URLs in `app.js`:
```javascript
// Before
const API_BASE = '/api';

// After
const API_BASE = 'http://localhost:5000/api';
```

Serve the app with the backend server:
```bash
npm run dev
```

Access: `http://localhost:5000`

---

## Pre-Deployment Checklist

- [ ] All dependencies listed in `package.json`
- [ ] Environment variables defined in `.env.example`
- [ ] Database migrations tested locally
- [ ] All API endpoints tested with Postman/Insomnia
- [ ] Frontend authentication integration tested
- [ ] File uploads to S3 tested
- [ ] Rate limiting configured
- [ ] Security headers (Helmet) enabled
- [ ] HTTPS enabled
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Database backups configured
- [ ] CDN configured for static assets
- [ ] Email notifications functional
- [ ] Payment gateway (Stripe/PayPal) configured
- [ ] Domain SSL certificate obtained
- [ ] Performance tested under load

---

## Production Deployment

### Option 1: Heroku (Recommended for Beginners)

**Prerequisites:**
- Heroku account (https://www.heroku.com/)
- Heroku CLI installed

```bash
# Login to Heroku
heroku login

# Create new app
heroku create dropbox-music-player

# Add MongoDB Atlas database
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret-key
heroku config:set AWS_SECRET_ACCESS_KEY=xxx
# ... set all vars from .env

# Deploy code
git push heroku main

# View logs
heroku logs --tail

# Check app status
heroku ps
```

**Heroku.yml** (optional improved config):
```yaml
build:
  docker:
    web: Dockerfile
release:
  image: web
  command:
    - npm run migrate
run:
  web: npm run start
```

### Option 2: AWS EC2

**Instance Setup:**
```bash
# Launch Ubuntu 22.04 LTS instance (t3.medium recommended)
# Security group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd your-project

# Install dependencies
npm install

# Create .env file
nano .env
# Add production values

# Start with PM2
pm2 start server.js --name "dropbox-music"
pm2 save
pm2 startup

# Install Nginx as reverse proxy
sudo apt install -y nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Install SSL cert with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Option 3: AWS ECS (Docker Container)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    image: dropbox-music-player:latest
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/dropbox-music
    depends_on:
      - mongo
    restart: always

  mongo:
    image: mongo:6.0
    volumes:
      - mongo-data:/data/db
    restart: always

volumes:
  mongo-data:
```

```bash
docker build -t dropbox-music-player:latest .
docker compose up -d
```

---

## Database Setup

### MongoDB Atlas (Recommended for Production)

1. **Create Cluster:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create account and new cluster
   - Choose cloud provider (AWS recommended)
   - Select region closest to users

2. **Configure Security:**
   - Add IP whitelist (or use 0.0.0.0/0 for development only)
   - Create database user with strong password
   - Enable authentication

3. **Get Connection String:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dropbox-music?retryWrites=true&w=majority
   ```

4. **Update .env:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dropbox-music?retryWrites=true&w=majority
   ```

### Database Indexes

Create indexes for performance:

```bash
# Connect to MongoDB
mongo <connection_string>

# Use database
use dropbox-music

# Create indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.songs.createIndex({ "artist": 1 })
db.songs.createIndex({ "status": 1 })
db.songs.createIndex({ "createdAt": -1 })
db.songs.createIndex({ "streams": -1 })
db.playlists.createIndex({ "creator": 1 })
db.subscriptions.createIndex({ "user": 1 })
db.subscriptions.createIndex({ "status": 1 })
```

---

## Environment Configuration

### Production .env

```env
# Server
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dropbox-music

# JWT
JWT_SECRET=your-long-random-production-secret-key-min-32-chars
JWT_EXPIRE_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_BUCKET_NAME=dropbox-music-prod
AWS_REGION=us-east-1

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# PayPal
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_SECRET_KEY=xxxxx

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@dropbox-music.com
EMAIL_PASSWORD=xxxxx

# SMS (Twilio)
TWILIO_ACCOUNT_SID=xxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxx

# Redis Caching
REDIS_URL=redis://cache.xxxx.ng.0001.use1.cache.amazonaws.com:6379

# Frontend
FRONTEND_URL=https://www.dropbox-music.com
CORS_ORIGINS=https://www.dropbox-music.com,https://dropbox-music.com

# Logging
LOG_LEVEL=info
SENTRY_DSN=xxxxx

# Admin Config
ADMIN_EMAIL=admin@dropbox-music.com
```

---

## AWS S3 Configuration

### Create S3 Bucket

```bash
aws s3 mb s3://dropbox-music-prod --region us-east-1
```

### Configure Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::dropbox-music-prod/*"
    },
    {
      "Sid": "AllowAppUpload",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:user/app-user"
      },
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::dropbox-music-prod/*"
    }
  ]
}
```

### Enable CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://www.dropbox-music.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### Create CloudFront Distribution

- Origin: S3 bucket
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Allowed Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
- Cache Policy: Optimized for forward compatibility

---

## Security Hardening

### API Security

```javascript
// Rate limiting (implemented in server.js)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use(limiter);
```

### Database Security

- [ ] Enable MongoDB authentication
- [ ] Enforce strong passwords (min 12 characters, complexity rules)
- [ ] Use SSL/TLS for all connections
- [ ] Enable database encryption at rest
- [ ] Implement regular backups
- [ ] Use VPN for database access

### Application Security

- [ ] Enable HTTPS/SSL (Let's Encrypt free certificates)
- [ ] Set secure HTTP headers (Helmet.js enabled)
- [ ] Implement CSRF protection
- [ ] Validate and sanitize all inputs
- [ ] Use prepared statements (Mongoose handles this)
- [ ] Implement API key authentication for admin endpoints
- [ ] Enable CORS restrictively
- [ ] Use environment variables (never commit secrets)
- [ ] Implement request logging and monitoring
- [ ] Set up intrusion detection

### Infrastructure Security

- [ ] Security group: Allow only required ports
- [ ] SSH: Disable password auth, use key pairs
- [ ] Firewall: Enable and configure
- [ ] DDoS protection: Use CloudFlare/AWS Shield
- [ ] Web Application Firewall: Enable AWS WAF
- [ ] Regular security audits
- [ ] Keep dependencies updated: `npm audit fix`

---

## Monitoring & Maintenance

### Application Monitoring

**Sentry Integration:**
```bash
npm install @sentry/node
```

```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});
```

### Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dropbox-music' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Uptime Monitoring

- [ ] Set up StatusPage.io for status updates
- [ ] Configure Pingdom or Uptime Robot for alerts
- [ ] Set up PagerDuty for on-call notifications

### Database Maintenance

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dropbox-music" --out=./backup

# Restore MongoDB
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/dropbox-music" ./backup
```

### Performance Monitoring

- CloudWatch for AWS metrics
- New Relic for APM
- DataDog for infrastructure monitoring

---

## Troubleshooting

### Common Issues

**Issue: MongoDB Connection Refused**
```bash
# Check MongoDB is running
net start MongoDB

# Check connection string in .env
# Whitelist IP in MongoDB Atlas
```

**Issue: CORS Errors**
```javascript
// Update CORS configuration in server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Issue: File Upload Fails**
```bash
# Check S3 credentials
# Verify bucket policy allows uploads
# Check file size limits in Multer config
```

**Issue: High Memory Usage**
```javascript
// Enable clustering
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }
}
```

**Issue: Slow Queries**
```bash
# Enable MongoDB profiling
db.setProfilingLevel(1)

# Check slow queries
db.system.profile.find(
  { millis: { $gt: 100 } }
).pretty()
```

---

## Performance Optimization

1. **Caching with Redis**
   ```javascript
   const redis = require('redis');
   const client = redis.createClient({
     url: process.env.REDIS_URL
   });
   ```

2. **Database Indexing** - Done ✓

3. **API Response Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

4. **CDN for Static Assets** - CloudFront configured ✓

5. **Load Balancing** - Nginx reverse proxy configured ✓

---

## Support & Resources

- API Documentation: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Database Schema: See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- GitHub: [repository-url]
- Documentation: https://docs.dropbox-music.com
- Support Email: support@dropbox-music.com

---

**Last Updated**: April 2025
**Version**: 1.0

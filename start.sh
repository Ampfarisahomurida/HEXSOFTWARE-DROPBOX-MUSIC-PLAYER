#!/bin/bash
# Startup script for DROPBOX MUSIC PLAYER

# Check if MONGODB_URI is set, if not use local MongoDB
if [ -z "$MONGODB_URI" ]; then
  export MONGODB_URI="mongodb://localhost:27017/dropbox-music"
  echo "⚠️  MONGODB_URI not set. Using local MongoDB."
fi

# Check if JWT_SECRET is set, if not use a default (NOT for production)
if [ -z "$JWT_SECRET" ]; then
  export JWT_SECRET="dev-secret-change-in-production"
  echo "⚠️  JWT_SECRET not set. Using development secret."
fi

# Start the server
npm start
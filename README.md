# DROPBOX MUSIC PLAYER

DROPBOX MUSIC PLAYER is a modern music streaming and media platform designed for phones, computers, tablets, smart TVs, and other digital devices.

## Features
- Music streaming with responsive player controls
- Upload and share music files
- Create playlists and manage favorites
- Discover trending songs and featured artists
- Login / registration with JWT authentication
- Drag-and-drop upload support
- Dark premium red/black/white theme
- Mobile, tablet, and desktop responsive layout
- Backend API for songs, search, playlists, uploads, and users

## Technology Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Data persistence: local JSON file store
- File uploads: Multer
- Authentication: JWT

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the server:
   ```bash
   npm start
   ```
3. Open the app in your browser:
   ```text
   http://localhost:5000
   ```

## Deployment
- Use any Node.js compatible hosting provider
- Ensure the `uploads/` folder is writable
- Set `PORT` and `JWT_SECRET` as environment variables in production

## Notes
- The backend persists app data to `data.json` automatically.
- Uploaded audio files are saved to `uploads/` and served via `/uploads`.
- The project is designed to support mobile, tablet, desktop, and smart TV form factors.

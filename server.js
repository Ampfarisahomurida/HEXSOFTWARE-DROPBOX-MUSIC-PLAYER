const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'dropbox-music-secret';
const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/aac'];
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    if (SUPPORTED_FORMATS.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio format')); 
    }
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, 'public')));

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (err) {
    const defaultData = {
      users: [
        {
          _id: createId(),
          username: 'demoartist',
          email: 'artist@dropboxmusic.com',
          passwordHash: await bcrypt.hash('Password123!', 10),
          accountType: 'artist',
          profileImage: 'https://via.placeholder.com/150x150/111/ff0a0a?text=Artist',
          followers: 3240,
          createdAt: new Date().toISOString()
        }
      ],
      songs: [
        {
          _id: createId(),
          title: 'Electric Horizon',
          artist: 'Nova Star',
          artistId: 'artist-1',
          duration: 212,
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          coverUrl: 'https://via.placeholder.com/300x300/111/ff0000?text=Electric+Horizon',
          streams: 12894,
          status: 'approved',
          genre: 'Electronic',
          uploadedAt: new Date().toISOString()
        },
        {
          _id: createId(),
          title: 'Midnight Drive',
          artist: 'Luna Beats',
          artistId: 'artist-2',
          duration: 245,
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          coverUrl: 'https://via.placeholder.com/300x300/111/ff0000?text=Midnight+Drive',
          streams: 9802,
          status: 'approved',
          genre: 'Hip Hop',
          uploadedAt: new Date().toISOString()
        },
        {
          _id: createId(),
          title: 'Neon Skyline',
          artist: 'Pulse Theory',
          artistId: 'artist-3',
          duration: 198,
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          coverUrl: 'https://via.placeholder.com/300x300/111/ff0000?text=Neon+Skyline',
          streams: 7468,
          status: 'approved',
          genre: 'Pop',
          uploadedAt: new Date().toISOString()
        }
      ],
      artists: [
        {
          _id: 'artist-1',
          name: 'Nova Star',
          profileImage: 'https://via.placeholder.com/150x150/111/ff0000?text=Nova+Star',
          followers: 12400,
          bio: 'Futuristic electronic artist crafting immersive soundscapes.'
        },
        {
          _id: 'artist-2',
          name: 'Luna Beats',
          profileImage: 'https://via.placeholder.com/150x150/111/ff0000?text=Luna+Beats',
          followers: 8700,
          bio: 'A soulful fusion of hip-hop, R&B and neon rhythms.'
        },
        {
          _id: 'artist-3',
          name: 'Pulse Theory',
          profileImage: 'https://via.placeholder.com/150x150/111/ff0000?text=Pulse+Theory',
          followers: 6200,
          bio: 'Pop productions for the next generation of listeners.'
        }
      ],
      playlists: [
        {
          _id: createId(),
          name: 'Prime Drops',
          creatorId: null,
          songIds: [],
          description: 'High-energy tracks for your next playlist.',
          isPublic: true,
          createdAt: new Date().toISOString()
        }
      ],
      recentPlays: []
    };

    await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    await ensureDataFile();
    return readData();
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function normalizeSong(song) {
  return {
    ...song,
    duration: song.duration || 0,
    coverUrl: song.coverUrl || 'https://via.placeholder.com/300x300/111/ff0000?text=Now+Playing'
  };
}

app.get('/api/songs/trending', async (req, res) => {
  const data = await readData();
  const songs = data.songs
    .filter(song => song.status === 'approved')
    .sort((a, b) => (b.streams || 0) - (a.streams || 0))
    .slice(0, 10)
    .map(normalizeSong);
  res.json({ songs });
});

app.get('/api/songs/:songId', async (req, res) => {
  const data = await readData();
  const song = data.songs.find(item => item._id === req.params.songId);
  if (!song) {
    return res.status(404).json({ message: 'Song not found' });
  }
  res.json({ song: normalizeSong(song) });
});

app.get('/api/artists/featured', async (req, res) => {
  const data = await readData();
  res.json({ artists: data.artists });
});

app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const data = await readData();
  if (!query) {
    return res.json({ results: [] });
  }

  const results = data.songs.filter(song => {
    return song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      (song.genre || '').toLowerCase().includes(query);
  }).slice(0, 20).map(normalizeSong);

  res.json({ results });
});

app.get('/api/playlists', verifyToken, async (req, res) => {
  const data = await readData();
  const playlists = data.playlists
    .filter(list => list.creatorId === req.userId || list.isPublic)
    .map(list => ({
      _id: list._id,
      name: list.name,
      description: list.description,
      songCount: list.songIds.length,
      isPublic: list.isPublic
    }));
  res.json({ playlists });
});

app.get('/api/playlists/:playlistId', async (req, res) => {
  const data = await readData();
  const playlist = data.playlists.find(item => item._id === req.params.playlistId);
  if (!playlist) {
    return res.status(404).json({ message: 'Playlist not found' });
  }

  const songs = playlist.songIds.map(songId => {
    const song = data.songs.find(item => item._id === songId);
    return song ? normalizeSong(song) : null;
  }).filter(Boolean);

  res.json({ playlist: { ...playlist, songs } });
});

app.get('/api/user/recently-played', verifyToken, async (req, res) => {
  const data = await readData();
  const recentIds = data.recentPlays.slice(-8).reverse();
  const songs = recentIds
    .map(id => data.songs.find(song => song._id === id))
    .filter(Boolean)
    .map(normalizeSong);
  res.json({ songs });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, accountType } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  const data = await readData();
  const existing = data.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    _id: createId(),
    username,
    email,
    passwordHash,
    accountType: accountType || 'listener',
    profileImage: `https://via.placeholder.com/150x150/111/ff0000?text=${encodeURIComponent(username[0].toUpperCase())}`,
    followers: 0,
    createdAt: new Date().toISOString()
  };

  data.users.push(user);
  await writeData(data);

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      accountType: user.accountType
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const data = await readData();
  const user = data.users.find(user => user.email.toLowerCase() === (email || '').toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      accountType: user.accountType
    }
  });
});

app.post('/api/upload', verifyToken, upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl });
});

app.post('/api/songs/upload', verifyToken, async (req, res) => {
  const { title, album, genre, fileUrl, coverUrl } = req.body;
  if (!title || !fileUrl) {
    return res.status(400).json({ message: 'Song title and file URL are required' });
  }

  const data = await readData();
  const artist = data.users.find(user => user._id === req.userId);

  const song = {
    _id: createId(),
    title,
    artist: artist ? artist.username : 'Uploaded Artist',
    artistId: req.userId,
    album: album || 'Single',
    genre: genre || 'Various',
    duration: 0,
    audioUrl: fileUrl,
    coverUrl: coverUrl || 'https://via.placeholder.com/300x300/111/ff0000?text=Uploaded',
    streams: 0,
    status: 'approved',
    uploadedAt: new Date().toISOString()
  };

  data.songs.unshift(song);
  await writeData(data);

  res.status(201).json({ song: normalizeSong(song) });
});

app.post('/api/playlists', verifyToken, async (req, res) => {
  const { name, songIds = [], description, isPublic } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Playlist name is required' });
  }

  const data = await readData();
  const playlist = {
    _id: createId(),
    name,
    creatorId: req.userId,
    songIds,
    description: description || '',
    isPublic: isPublic !== false,
    createdAt: new Date().toISOString()
  };

  data.playlists.push(playlist);
  await writeData(data);

  res.status(201).json({ playlist });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  next();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

(async () => {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await ensureDataFile();
    app.listen(PORT, () => {
      console.log(`✅ Dropbox Music Player backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
})();

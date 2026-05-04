// DROPBOX MUSIC PLAYER - Frontend JavaScript

// API Configuration
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progress = document.getElementById('progress');
const progressBar = document.querySelector('.progress-bar');
const volumeSlider = document.getElementById('volumeSlider');
const currentSongTitle = document.getElementById('currentSongTitle');
const currentSongArtist = document.getElementById('currentSongArtist');
const currentSongImg = document.getElementById('currentSongImg');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.querySelector('.upload-btn');
const searchInput = document.getElementById('searchInput');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');

// Music Library (will be loaded from API)
let musicLibrary = [];
let currentSongIndex = 0;
let isPlaying = false;

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function loadSongsFromAPI() {
    try {
        const data = await apiRequest('/songs');
        musicLibrary = data.songs || [];
        if (musicLibrary.length === 0) {
            musicLibrary = [
                {
                    title: 'Demo Song 1',
                    artist: 'Artist 1',
                    duration: '3:45',
                    src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                    img: 'https://via.placeholder.com/200x200/333/fff?text=Song+1'
                }
            ];
        }
        updateSongGrid();
    } catch (error) {
        console.error('Failed to load songs:', error);
        musicLibrary = [
            {
                title: 'Demo Song 1',
                artist: 'Artist 1',
                duration: '3:45',
                src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
                img: 'https://via.placeholder.com/200x200/333/fff?text=Song+1'
            }
        ];
        updateSongGrid();
    }
}

function formatSongDuration(value) {
    if (typeof value === 'number') {
        return formatTime(value);
    }

    return value || '0:00';
}

function updateSongGrid() {
    const songGrid = document.querySelector('.song-grid');
    if (!songGrid) return;

    songGrid.innerHTML = '';
    musicLibrary.forEach((song, index) => {
        const songCard = document.createElement('div');
        songCard.className = 'song-card';
        songCard.innerHTML = `
            <img src="${song.coverArt || song.img || 'https://via.placeholder.com/200x200/333/fff?text=Song'}" alt="${song.title}">
            <h4>${song.title}</h4>
            <p>${song.artist?.username || song.artist || 'Unknown artist'}</p>
            <span class="duration">${formatSongDuration(song.duration)}</span>
            <button class="play-btn" title="Play song" data-index="${index}"><i class='bx bx-play'></i></button>
        `;
        songCard.querySelector('.play-btn').addEventListener('click', () => playSong(index));
        songGrid.appendChild(songCard);
    });
}

function playSong(index) {
    currentSongIndex = index;
    loadSong(index);
    audioPlayer.play();
    isPlaying = true;
    updatePlayPauseButton();
}

// Initialize player
async function initPlayer() {
    await loadStoredSongs();
    await loadSongsFromAPI();
    if (musicLibrary.length > 0) {
        loadSong(currentSongIndex);
    }
    updatePlayPauseButton();
}

// Load song
function loadSong(index) {
    const song = musicLibrary[index];
    audioPlayer.src = song.fileUrl || song.src || '';
    currentSongTitle.textContent = song.title || 'Unknown title';
    currentSongArtist.textContent = song.artist?.username || song.artist || 'Unknown artist';
    currentSongImg.src = song.coverArt || song.img || 'https://via.placeholder.com/200x200/333/fff?text=Cover';

    // Update total time when metadata loads
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
    }, { once: true });
}

// Play/Pause toggle
function togglePlayPause() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayPauseButton();
}

// Update play/pause button icon
function updatePlayPauseButton() {
    const icon = playPauseBtn.querySelector('i');
    if (isPlaying) {
        icon.className = 'bx bx-pause';
    } else {
        icon.className = 'bx bx-play';
    }
}

// Next song
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % musicLibrary.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
}

// Previous song
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + musicLibrary.length) % musicLibrary.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        audioPlayer.play();
    }
}

// Format time in MM:SS format
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('dropbox-music-player', 1);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('uploads')) {
                const store = db.createObjectStore('uploads', { keyPath: 'id' });
                store.createIndex('title', 'title', { unique: false });
            }
        };

        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

async function saveSongToStore(song) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('uploads', 'readwrite');
        const store = transaction.objectStore('uploads');
        const request = store.put(song);
        request.onsuccess = () => resolve();
        request.onerror = event => reject(event.target.error);
    });
}

async function getStoredSongs() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('uploads', 'readonly');
        const store = transaction.objectStore('uploads');
        const request = store.getAll();
        request.onsuccess = event => resolve(event.target.result);
        request.onerror = event => reject(event.target.error);
    });
}

async function deleteSongFromStore(songId) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('uploads', 'readwrite');
        const store = transaction.objectStore('uploads');
        const request = store.delete(songId);
        request.onsuccess = () => resolve();
        request.onerror = event => reject(event.target.error);
    });
}

function generateId() {
    return (crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function getAudioDuration(file) {
    return new Promise((resolve, reject) => {
        const tempAudio = document.createElement('audio');
        const url = URL.createObjectURL(file);
        tempAudio.src = url;

        tempAudio.addEventListener('loadedmetadata', () => {
            resolve(formatTime(tempAudio.duration));
            URL.revokeObjectURL(url);
        }, { once: true });

        tempAudio.addEventListener('error', () => {
            URL.revokeObjectURL(url);
            reject(new Error('Unable to read audio duration'));
        }, { once: true });
    });
}

async function processUploadedFile(file) {
    const id = generateId();
    const src = URL.createObjectURL(file);
    let duration = '0:00';

    try {
        duration = await getAudioDuration(file);
    } catch (err) {
        console.warn('Could not determine duration for uploaded file:', file.name);
    }

    const song = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Uploaded',
        duration,
        src,
        img: 'https://via.placeholder.com/200x200/333/fff?text=Upload',
        file,
        source: 'local'
    };

    musicLibrary.push(song);
    await saveSongToStore({ ...song, src: undefined });
    addSongToUI(song);
}

async function deleteUploadedSong(songId, songCard) {
    await deleteSongFromStore(songId);
    musicLibrary = musicLibrary.filter(song => song.id !== songId);
    if (songCard) {
        songCard.remove();
    }
    if (currentSongIndex >= musicLibrary.length) {
        currentSongIndex = 0;
    }
    if (musicLibrary.length === 0) {
        audioPlayer.src = '';
        currentSongTitle.textContent = 'No song playing';
        currentSongArtist.textContent = 'Artist';
        currentSongImg.src = 'https://via.placeholder.com/50x50/333/fff?text=Now+Playing';
    }
}

async function loadStoredSongs() {
    const storedSongs = await getStoredSongs();
    storedSongs.forEach(song => {
        song.src = URL.createObjectURL(song.file);
        song.source = 'local';
        musicLibrary.push(song);
        addSongToUI(song);
    });
}

// Update progress bar and time displays
function updateProgress() {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = `${progressPercent}%`;

    // Update time displays
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration || 0);
}

// Set progress on click
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

// Volume control
function setVolume() {
    audioPlayer.volume = volumeSlider.value;
}

// Handle file upload
async function handleFileUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        if (file.type.startsWith('audio/')) {
            await processUploadedFile(file);
        }
    }
    fileInput.value = '';
}

// Add uploaded song to UI
function addSongToUI(song) {
    const songGrid = document.querySelector('.song-grid');
    const songCard = document.createElement('div');
    songCard.className = 'song-card';
    songCard.innerHTML = `
        <img src="${song.img}" alt="Song">
        <h4>${song.title}</h4>
        <p>${song.artist}</p>
        <span class="duration">${song.duration || '0:00'}</span>
        <button class="play-btn" title="Play song"><i class='bx bx-play'></i></button>
    `;
    songCard.querySelector('.play-btn').addEventListener('click', () => {
        const index = musicLibrary.findIndex(s => s.id === song.id || s.title === song.title && s.artist === song.artist);
        if (index === -1) return;
        currentSongIndex = index;
        loadSong(currentSongIndex);
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
    });

    if (song.source === 'local') {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Delete uploaded song';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', async (event) => {
            event.stopPropagation();
            await deleteUploadedSong(song.id, songCard);
        });
        songCard.appendChild(deleteBtn);
    }

    songGrid.appendChild(songCard);
}

// Search functionality
function searchSongs() {
    const query = searchInput.value.toLowerCase();
    const songCards = document.querySelectorAll('.song-card');

    songCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const artist = card.querySelector('p').textContent.toLowerCase();

        if (title.includes(query) || artist.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);
document.querySelector('.next-btn').addEventListener('click', nextSong);
document.querySelector('.prev-btn').addEventListener('click', prevSong);
audioPlayer.addEventListener('timeupdate', updateProgress);
progressBar.addEventListener('click', setProgress);
volumeSlider.addEventListener('input', setVolume);
fileInput.addEventListener('change', handleFileUpload);
uploadBtn.addEventListener('click', () => fileInput.click());
searchInput.addEventListener('input', searchSongs);

// Auto-play next song when current ends
audioPlayer.addEventListener('ended', nextSong);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initPlayer);

// Add click events to existing song cards
document.querySelectorAll('.play-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        currentSongIndex = index;
        loadSong(currentSongIndex);
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
    });
});

// Login/Register functionality (redirect to pages)
document.querySelector('.login-btn').addEventListener('click', () => {
    window.location.href = 'login.html';
});

document.querySelector('.register-btn').addEventListener('click', () => {
    window.location.href = 'register.html';
});

// Navigation menu active state
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

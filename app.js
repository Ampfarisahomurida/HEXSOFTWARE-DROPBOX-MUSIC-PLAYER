// DROPBOX MUSIC PLAYER - Complete Frontend Application
// Professional music streaming platform with full feature set

// ==========================================
// CONFIGURATION & STATE MANAGEMENT
// ==========================================

const CONFIG = {
    API_BASE: window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api',
    STORAGE_KEYS: {
        AUTH_TOKEN: 'authToken',
        CURRENT_USER: 'currentUser',
        CURRENT_PLAYLIST: 'currentPlaylist',
        VOLUME: 'volume',
        SHUFFLE: 'shuffle',
        REPEAT: 'repeat'
    },
    MAX_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_FORMATS: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/aac']
};

// Global State
let STATE = {
    authToken: localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN),
    currentUser: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER)) || null,
    currentSong: null,
    currentPlaylist: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_PLAYLIST)) || [],
    isPlaying: false,
    currentIndex: 0,
    volume: parseFloat(localStorage.getItem(CONFIG.STORAGE_KEYS.VOLUME)) || 0.7,
    shuffle: JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.SHUFFLE)) || false,
    repeat: localStorage.getItem(CONFIG.STORAGE_KEYS.REPEAT) || 'none', // none, one, all
    searchResults: [],
    trendingSongs: [],
    featuredArtists: [],
    userPlaylists: [],
    recentlyPlayed: [],
    currentPage: 'home'
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const ELEMENTS = {
    // Loading & Modals
    loadingScreen: document.getElementById('loadingScreen'),
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    notificationContainer: document.getElementById('notificationContainer'),

    // Navigation
    navLinks: document.querySelectorAll('.nav-link, .nav-item'),
    pages: document.querySelectorAll('.page'),

    // Search
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    searchResults: document.getElementById('searchResults'),

    // User Actions
    userActions: document.getElementById('userActions'),
    loginBtn: document.querySelector('.login-btn'),
    registerBtn: document.querySelector('.register-btn'),

    // Music Player
    audioPlayer: document.getElementById('audioPlayer'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    progress: document.getElementById('progress'),
    progressBar: document.querySelector('.progress-bar'),
    currentTime: document.getElementById('currentTime'),
    totalTime: document.getElementById('totalTime'),
    volumeBtn: document.getElementById('volumeBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    likeBtn: document.getElementById('likeBtn'),
    currentSongImg: document.getElementById('currentSongImg'),
    currentSongTitle: document.getElementById('currentSongTitle'),
    currentSongArtist: document.getElementById('currentSongArtist'),

    // Playlist Panel
    playlistPanel: document.getElementById('playlistPanel'),
    playlistToggleBtn: document.getElementById('playlistToggleBtn'),
    closePlaylistBtn: document.getElementById('closePlaylistBtn'),
    currentPlaylist: document.getElementById('currentPlaylist'),

    // Content Areas
    trendingSongs: document.getElementById('trendingSongs'),
    featuredArtists: document.getElementById('featuredArtists'),
    recentSongs: document.getElementById('recentSongs'),
    userPlaylists: document.getElementById('userPlaylists'),
    recentlyPlayed: document.getElementById('recentlyPlayed'),

    // Upload
    uploadDropZone: document.getElementById('uploadDropZone'),
    fileInput: document.getElementById('fileInput'),
    uploadQueue: document.getElementById('uploadQueue'),

    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),

    // Genre & Mood Cards
    genreCards: document.querySelectorAll('.genre-card'),
    moodCards: document.querySelectorAll('.mood-card')
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (STATE.authToken) {
        config.headers.Authorization = `Bearer ${STATE.authToken}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// Notification System
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class='bx bx-${type === 'success' ? 'check-circle' : type === 'error' ? 'error-circle' : 'info-circle'}'></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class='bx bx-x'></i>
        </button>
    `;

    ELEMENTS.notificationContainer.appendChild(notification);

    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
}

// Format Time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

async function login(email, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        STATE.authToken = data.token;
        STATE.currentUser = data.user;

        localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));

        showNotification('Login successful!', 'success');
        updateUI();
        closeModal('loginModal');
        loadUserData();

    } catch (error) {
        showNotification('Login failed: ' + error.message, 'error');
    }
}

async function register(userData) {
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        showNotification('Registration successful! Please login.', 'success');
        closeModal('registerModal');
        openModal('loginModal');

    } catch (error) {
        showNotification('Registration failed: ' + error.message, 'error');
    }
}

function logout() {
    STATE.authToken = null;
    STATE.currentUser = null;
    STATE.currentPlaylist = [];
    STATE.currentSong = null;
    STATE.isPlaying = false;

    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_PLAYLIST);

    updateUI();
    showNotification('Logged out successfully', 'info');
}

// ==========================================
// MUSIC PLAYER FUNCTIONS
// ==========================================

function loadSong(song) {
    if (!song) return;

    STATE.currentSong = song;
    ELEMENTS.audioPlayer.src = song.audioUrl || song.url;
    ELEMENTS.currentSongTitle.textContent = song.title;
    ELEMENTS.currentSongArtist.textContent = song.artist;
    ELEMENTS.currentSongImg.src = song.coverUrl || song.albumArt || 'https://via.placeholder.com/60x60/333/fff?text=🎵';

    // Update like button
    updateLikeButton(song);

    // Add to recently played
    addToRecentlyPlayed(song);
}

function playSong() {
    if (!STATE.currentSong) return;

    ELEMENTS.audioPlayer.play();
    STATE.isPlaying = true;
    updatePlayPauseButton();
}

function pauseSong() {
    ELEMENTS.audioPlayer.pause();
    STATE.isPlaying = false;
    updatePlayPauseButton();
}

function nextSong() {
    if (STATE.currentPlaylist.length === 0) return;

    if (STATE.shuffle) {
        STATE.currentIndex = Math.floor(Math.random() * STATE.currentPlaylist.length);
    } else {
        STATE.currentIndex = (STATE.currentIndex + 1) % STATE.currentPlaylist.length;
    }

    loadSong(STATE.currentPlaylist[STATE.currentIndex]);
    if (STATE.isPlaying) playSong();
}

function prevSong() {
    if (STATE.currentPlaylist.length === 0) return;

    STATE.currentIndex = STATE.currentIndex > 0 ? STATE.currentIndex - 1 : STATE.currentPlaylist.length - 1;
    loadSong(STATE.currentPlaylist[STATE.currentIndex]);
    if (STATE.isPlaying) playSong();
}

function toggleShuffle() {
    STATE.shuffle = !STATE.shuffle;
    localStorage.setItem(CONFIG.STORAGE_KEYS.SHUFFLE, STATE.shuffle);
    updateShuffleButton();
}

function toggleRepeat() {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(STATE.repeat);
    STATE.repeat = modes[(currentIndex + 1) % modes.length];
    localStorage.setItem(CONFIG.STORAGE_KEYS.REPEAT, STATE.repeat);
    updateRepeatButton();
}

function setVolume(volume) {
    STATE.volume = volume;
    ELEMENTS.audioPlayer.volume = volume;
    localStorage.setItem(CONFIG.STORAGE_KEYS.VOLUME, volume);
    updateVolumeButton();
}

function updateProgress() {
    const { currentTime, duration } = ELEMENTS.audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    ELEMENTS.progress.style.width = `${progressPercent}%`;
    ELEMENTS.currentTime.textContent = formatTime(currentTime);
    ELEMENTS.totalTime.textContent = formatTime(duration);
}

function seekTo(e) {
    const width = ELEMENTS.progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = ELEMENTS.audioPlayer.duration;
    ELEMENTS.audioPlayer.currentTime = (clickX / width) * duration;
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateUI() {
    updateUserActions();
    updatePlayPauseButton();
    updateShuffleButton();
    updateRepeatButton();
    updateVolumeButton();
    updatePlaylistPanel();
}

function updateUserActions() {
    if (STATE.currentUser) {
        ELEMENTS.userActions.innerHTML = `
            <div class="user-info">
                <span>Welcome, ${STATE.currentUser.username}</span>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        ELEMENTS.userActions.innerHTML = `
            <button class="login-btn" onclick="openModal('loginModal')">Login</button>
            <button class="register-btn" onclick="openModal('registerModal')">Register</button>
        `;
    }
}

function updatePlayPauseButton() {
    ELEMENTS.playPauseBtn.innerHTML = STATE.isPlaying ?
        '<i class="bx bx-pause"></i>' : '<i class="bx bx-play"></i>';
}

function updateShuffleButton() {
    ELEMENTS.shuffleBtn.classList.toggle('active', STATE.shuffle);
}

function updateRepeatButton() {
    ELEMENTS.repeatBtn.classList.remove('active', 'repeat-one');
    if (STATE.repeat === 'all') ELEMENTS.repeatBtn.classList.add('active');
    if (STATE.repeat === 'one') ELEMENTS.repeatBtn.classList.add('active', 'repeat-one');
}

function updateVolumeButton() {
    const volumeIcon = STATE.volume === 0 ? 'bx-volume-mute' :
                      STATE.volume < 0.5 ? 'bx-volume-low' : 'bx-volume-full';
    ELEMENTS.volumeBtn.innerHTML = `<i class='bx ${volumeIcon}'></i>`;
}

function updateLikeButton(song) {
    if (!song) return;
    // This would check if the song is liked by the user
    const isLiked = false; // TODO: Implement like checking
    ELEMENTS.likeBtn.innerHTML = `<i class='bx bxs-heart'></i>`;
    ELEMENTS.likeBtn.classList.toggle('liked', isLiked);
}

// ==========================================
// MODAL FUNCTIONS
// ==========================================

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================

function navigateTo(pageId) {
    // Hide all pages
    ELEMENTS.pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const targetPage = document.getElementById(pageId + 'Page') || document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Update navigation
    document.querySelectorAll('.nav-link, .nav-item').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });

    STATE.currentPage = pageId;
}

// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================

async function loadTrendingSongs() {
    try {
        const data = await apiRequest('/songs/trending');
        STATE.trendingSongs = data.songs;
        renderSongGrid(ELEMENTS.trendingSongs, data.songs);
    } catch (error) {
        console.error('Failed to load trending songs:', error);
        renderSongGrid(ELEMENTS.trendingSongs, []); // Show empty state
    }
}

async function loadFeaturedArtists() {
    try {
        const data = await apiRequest('/artists/featured');
        STATE.featuredArtists = data.artists;
        renderArtistGrid(ELEMENTS.featuredArtists, data.artists);
    } catch (error) {
        console.error('Failed to load featured artists:', error);
        renderArtistGrid(ELEMENTS.featuredArtists, []);
    }
}

async function loadUserData() {
    if (!STATE.currentUser) return;

    try {
        // Load user playlists
        const playlistsData = await apiRequest('/playlists');
        STATE.userPlaylists = playlistsData.playlists;
        renderUserPlaylists();

        // Load recently played
        const recentData = await apiRequest('/user/recently-played');
        STATE.recentlyPlayed = recentData.songs;
        renderRecentlyPlayed();

    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// ==========================================
// RENDERING FUNCTIONS
// ==========================================

function renderSongGrid(container, songs) {
    if (!songs || songs.length === 0) {
        container.innerHTML = '<p class="empty-state">No songs available</p>';
        return;
    }

    container.innerHTML = songs.map(song => `
        <div class="song-card" data-song-id="${song._id}" onclick="playSongById('${song._id}')">
            <img src="${song.coverUrl || song.albumArt || 'https://via.placeholder.com/200x200/333/fff?text=🎵'}" alt="${song.title}">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
            <span class="duration">${formatTime(song.duration || 0)}</span>
            <button class="play-btn" onclick="event.stopPropagation(); playSongById('${song._id}')">
                <i class='bx bx-play'></i>
            </button>
        </div>
    `).join('');
}

function renderArtistGrid(container, artists) {
    if (!artists || artists.length === 0) {
        container.innerHTML = '<p class="empty-state">No artists available</p>';
        return;
    }

    container.innerHTML = artists.map(artist => `
        <div class="artist-card" onclick="viewArtist('${artist._id}')">
            <img src="${artist.profileImage || 'https://via.placeholder.com/150x150/333/fff?text=👤'}" alt="${artist.name}">
            <h4>${artist.name}</h4>
            <p>${artist.followers || 0} followers</p>
        </div>
    `).join('');
}

function renderUserPlaylists() {
    const container = ELEMENTS.userPlaylists;
    if (!STATE.userPlaylists || STATE.userPlaylists.length === 0) {
        container.innerHTML = '<p class="empty-state">No playlists yet</p>';
        return;
    }

    container.innerHTML = STATE.userPlaylists.map(playlist => `
        <div class="playlist-item" onclick="loadPlaylist('${playlist._id}')">
            <i class='bx bx-list-ul'></i>
            <span>${playlist.name}</span>
            <span class="playlist-count">${playlist.songCount || 0} songs</span>
        </div>
    `).join('');
}

function renderRecentlyPlayed() {
    const container = ELEMENTS.recentlyPlayed;
    if (!STATE.recentlyPlayed || STATE.recentlyPlayed.length === 0) {
        container.innerHTML = '<p class="empty-state">No recently played songs</p>';
        return;
    }

    container.innerHTML = STATE.recentlyPlayed.slice(0, 5).map(song => `
        <div class="recent-item" onclick="playSongById('${song._id}')">
            <img src="${song.coverUrl || 'https://via.placeholder.com/40x40/333/fff?text=🎵'}" alt="${song.title}">
            <div class="recent-info">
                <span class="recent-title">${song.title}</span>
                <span class="recent-artist">${song.artist}</span>
            </div>
        </div>
    `).join('');
}

function updatePlaylistPanel() {
    const container = ELEMENTS.currentPlaylist;
    if (!STATE.currentPlaylist || STATE.currentPlaylist.length === 0) {
        container.innerHTML = '<p class="empty-state">No songs in playlist</p>';
        return;
    }

    container.innerHTML = STATE.currentPlaylist.map((song, index) => `
        <div class="playlist-song ${index === STATE.currentIndex ? 'active' : ''}" onclick="playSongAtIndex(${index})">
            <img src="${song.coverUrl || 'https://via.placeholder.com/40x40/333/fff?text=🎵'}" alt="${song.title}">
            <div class="playlist-song-info">
                <span class="playlist-song-title">${song.title}</span>
                <span class="playlist-song-artist">${song.artist}</span>
            </div>
            <button class="remove-song-btn" onclick="event.stopPropagation(); removeFromPlaylist(${index})">
                <i class='bx bx-x'></i>
            </button>
        </div>
    `).join('');
}

// ==========================================
// SEARCH FUNCTIONS
// ==========================================

const debouncedSearch = debounce(async (query) => {
    if (!query.trim()) {
        ELEMENTS.searchResults.style.display = 'none';
        return;
    }

    try {
        const data = await apiRequest(`/search?q=${encodeURIComponent(query)}`);
        STATE.searchResults = data.results;
        renderSearchResults(data.results);
    } catch (error) {
        console.error('Search failed:', error);
    }
}, 300);

function renderSearchResults(results) {
    if (!results || results.length === 0) {
        ELEMENTS.searchResults.innerHTML = '<div class="search-item">No results found</div>';
    } else {
        ELEMENTS.searchResults.innerHTML = results.map(result => `
            <div class="search-item" onclick="playSongById('${result._id}')">
                <img src="${result.coverUrl || 'https://via.placeholder.com/40x40/333/fff?text=🎵'}" alt="${result.title}">
                <div class="search-info">
                    <span class="search-title">${result.title}</span>
                    <span class="search-artist">${result.artist}</span>
                </div>
            </div>
        `).join('');
    }
    ELEMENTS.searchResults.style.display = 'block';
}

// ==========================================
// UPLOAD FUNCTIONS
// ==========================================

function handleFileUpload(files) {
    const validFiles = Array.from(files).filter(file => {
        if (file.size > CONFIG.MAX_UPLOAD_SIZE) {
            showNotification(`File ${file.name} is too large. Max size: 50MB`, 'error');
            return false;
        }
        if (!CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
            showNotification(`File ${file.name} has unsupported format`, 'error');
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
        const uploadItem = createUploadItem(file);
        ELEMENTS.uploadQueue.appendChild(uploadItem);
        uploadFile(file, uploadItem);
    });
}

function createUploadItem(file) {
    const item = document.createElement('div');
    item.className = 'upload-item';
    item.innerHTML = `
        <div class="upload-info">
            <i class='bx bx-music'></i>
            <div class="upload-details">
                <span class="upload-filename">${file.name}</span>
                <span class="upload-size">${formatFileSize(file.size)}</span>
            </div>
        </div>
        <div class="upload-progress">
            <div class="upload-bar">
                <div class="upload-fill" style="width: 0%"></div>
            </div>
            <span class="upload-percent">0%</span>
        </div>
        <button class="upload-cancel" onclick="cancelUpload(this)">
            <i class='bx bx-x'></i>
        </button>
    `;
    return item;
}

async function uploadFile(file, uploadItem) {
    const formData = new FormData();
    formData.append('audio', file);

    try {
        const response = await fetch(`${CONFIG.API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': STATE.authToken
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        showNotification(`Successfully uploaded ${file.name}`, 'success');
        uploadItem.remove();

        // Refresh data
        loadTrendingSongs();

    } catch (error) {
        showNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
        uploadItem.classList.add('error');
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    // Loading screen
    window.addEventListener('load', () => {
        setTimeout(() => {
            ELEMENTS.loadingScreen.style.display = 'none';
        }, 2000);
    });

    // Navigation
    ELEMENTS.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            navigateTo(page);
        });
    });

    // Search
    ELEMENTS.searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    ELEMENTS.searchInput.addEventListener('focus', () => {
        if (STATE.searchResults.length > 0) {
            ELEMENTS.searchResults.style.display = 'block';
        }
    });

    document.addEventListener('click', (e) => {
        if (!ELEMENTS.searchInput.contains(e.target) && !ELEMENTS.searchResults.contains(e.target)) {
            ELEMENTS.searchResults.style.display = 'none';
        }
    });

    // Music Player Controls
    ELEMENTS.playPauseBtn.addEventListener('click', () => {
        STATE.isPlaying ? pauseSong() : playSong();
    });

    ELEMENTS.nextBtn.addEventListener('click', nextSong);
    ELEMENTS.prevBtn.addEventListener('click', prevSong);
    ELEMENTS.shuffleBtn.addEventListener('click', toggleShuffle);
    ELEMENTS.repeatBtn.addEventListener('click', toggleRepeat);

    // Progress Bar
    ELEMENTS.progressBar.addEventListener('click', seekTo);

    // Volume
    ELEMENTS.volumeSlider.addEventListener('input', (e) => {
        setVolume(e.target.value);
    });

    ELEMENTS.volumeBtn.addEventListener('click', () => {
        setVolume(STATE.volume > 0 ? 0 : 0.7);
    });

    // Audio Events
    ELEMENTS.audioPlayer.addEventListener('timeupdate', updateProgress);
    ELEMENTS.audioPlayer.addEventListener('ended', () => {
        if (STATE.repeat === 'one') {
            ELEMENTS.audioPlayer.currentTime = 0;
            playSong();
        } else {
            nextSong();
        }
    });

    ELEMENTS.audioPlayer.addEventListener('loadedmetadata', () => {
        ELEMENTS.totalTime.textContent = formatTime(ELEMENTS.audioPlayer.duration);
    });

    // Playlist Panel
    ELEMENTS.playlistToggleBtn.addEventListener('click', () => {
        ELEMENTS.playlistPanel.classList.toggle('open');
    });

    ELEMENTS.closePlaylistBtn.addEventListener('click', () => {
        ELEMENTS.playlistPanel.classList.remove('open');
    });

    // Upload
    ELEMENTS.uploadDropZone.addEventListener('click', () => {
        ELEMENTS.fileInput.click();
    });

    ELEMENTS.uploadDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        ELEMENTS.uploadDropZone.classList.add('drag-over');
    });

    ELEMENTS.uploadDropZone.addEventListener('dragleave', () => {
        ELEMENTS.uploadDropZone.classList.remove('drag-over');
    });

    ELEMENTS.uploadDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        ELEMENTS.uploadDropZone.classList.remove('drag-over');
        handleFileUpload(e.dataTransfer.files);
    });

    ELEMENTS.fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files);
    });

    // Forms
    ELEMENTS.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        await login(email, password);
    });

    ELEMENTS.registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            accountType: formData.get('accountType')
        };
        await register(userData);
    });

    // Modal Close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Genre & Mood Cards
    ELEMENTS.genreCards.forEach(card => {
        card.addEventListener('click', () => {
            const genre = card.getAttribute('data-genre');
            navigateTo('discover');
            // TODO: Filter by genre
        });
    });

    ELEMENTS.moodCards.forEach(card => {
        card.addEventListener('click', () => {
            const mood = card.getAttribute('data-mood');
            navigateTo('discover');
            // TODO: Filter by mood
        });
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                STATE.isPlaying ? pauseSong() : playSong();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevSong();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSong();
                break;
        }
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

async function initializeApp() {
    // Set initial volume
    ELEMENTS.audioPlayer.volume = STATE.volume;
    ELEMENTS.volumeSlider.value = STATE.volume;

    // Initialize UI
    updateUI();

    // Load initial data
    await Promise.all([
        loadTrendingSongs(),
        loadFeaturedArtists()
    ]);

    // Load user data if logged in
    if (STATE.currentUser) {
        loadUserData();
    }

    // Initialize event listeners
    initializeEventListeners();

    // Hide loading screen
    setTimeout(() => {
        ELEMENTS.loadingScreen.style.display = 'none';
    }, 1500);
}

// Global functions for onclick handlers
window.playSongById = async (songId) => {
    try {
        const data = await apiRequest(`/songs/${songId}`);
        STATE.currentPlaylist = [data.song];
        STATE.currentIndex = 0;
        loadSong(data.song);
        playSong();
        updatePlaylistPanel();
    } catch (error) {
        showNotification('Failed to load song', 'error');
    }
};

window.playSongAtIndex = (index) => {
    STATE.currentIndex = index;
    loadSong(STATE.currentPlaylist[index]);
    playSong();
};

window.removeFromPlaylist = (index) => {
    STATE.currentPlaylist.splice(index, 1);
    if (index <= STATE.currentIndex) {
        STATE.currentIndex = Math.max(0, STATE.currentIndex - 1);
    }
    updatePlaylistPanel();
};

window.loadPlaylist = async (playlistId) => {
    try {
        const data = await apiRequest(`/playlists/${playlistId}`);
        STATE.currentPlaylist = data.playlist.songs;
        STATE.currentIndex = 0;
        if (STATE.currentPlaylist.length > 0) {
            loadSong(STATE.currentPlaylist[0]);
        }
        updatePlaylistPanel();
        showNotification(`Loaded playlist: ${data.playlist.name}`, 'success');
    } catch (error) {
        showNotification('Failed to load playlist', 'error');
    }
};

window.viewArtist = (artistId) => {
    // TODO: Implement artist view
    showNotification('Artist view coming soon!', 'info');
};

window.cancelUpload = (btn) => {
    btn.closest('.upload-item').remove();
};

window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);

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

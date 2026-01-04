// src/services/api.js - Platform Links System (Clean Code)
import axios from 'axios';

// ========== CONFIGURATION ==========
const API_BASE_URL = 'https://api.trackbangserver.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ========== INTERCEPTORS ==========
// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Token varsa ekle
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired - redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== HELPER FUNCTIONS ==========
const createAuthHeader = (token) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const createMultipartHeader = (token) => ({
    headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` })
    }
});

// ========== API SERVICES ==========
export default {
    // ========== MUSIC SERVICES ==========
    music: {
        // Get all music
        getAll: (params) => api.get('/music', { params }),

        // Get single music
        getById: (id) => api.get(`/music/${id}`),

        // Get featured music
        getFeatured: (params) => api.get('/music/featured', { params }),

        // Get popular music
        getPopular: (params) => api.get('/music/popular', { params }),

        // Get new releases
        getNewReleases: (params) => api.get('/music/new-releases', { params }),

        // Get by genre
        getByGenre: (genre, params) => api.get(`/music/genre/${genre}`, { params }),

        // Get top 10 by category
        getTop10: (params) => api.get('/music/top10', { params }),

        // Create music (Admin)
        create: (data) => api.post('/music', data),

        // Update music (Admin)
        update: (id, data) => api.put(`/music/${id}`, data),

        // Delete music (Admin)
        delete: (id) => api.delete(`/music/${id}`),

        // Soft delete (Admin)
        softDelete: (id) => api.put(`/music/${id}/soft-delete`),

        // Like/Unlike music (Auth required)
        like: (id, token) => api.post(`/music/${id}/like`, {}, createAuthHeader(token)),

        // Add to playlist (Auth required)
        addToPlaylist: (id, playlistId, token) =>
            api.post(`/music/${id}/add-to-playlist`, { playlistId }, createAuthHeader(token)),

        // Search music
        search: (query, params) => api.get('/music/search', { params: { query, ...params } }),

        // Search by artist
        searchByArtist: (artist) => api.get('/music/search/artist', { params: { artist } })
    },

    // ========== PLAYLIST SERVICES ==========
    playlists: {
        // Admin Playlists
        admin: {
            getAll: (params) => api.get('/playlists/admin', { params }),
            create: (data) => api.post('/playlists/admin', data),
            update: (id, data) => api.put(`/playlists/admin/${id}`, data),
            delete: (id) => api.delete(`/playlists/admin/${id}`)
        },

        // User Playlists (Auth required)
        user: {
            getByUserId: (userId, token, params) =>
                api.get(`/playlists/user/${userId}`, {
                    ...createAuthHeader(token),
                    params
                }),
            create: (data, token) =>
                api.post('/playlists', data, createAuthHeader(token)),
            update: (id, data, token) =>
                api.put(`/playlists/user/${id}`, data, createAuthHeader(token)),
            delete: (id, token) =>
                api.delete(`/playlists/user/${id}`, createAuthHeader(token))
        },

        // Public playlists
        getPublic: (params) => api.get('/playlists/public', { params }),

        // Public world playlists
        getPublicWorld: (params) => api.get('/playlists/public-world', { params }),

        // Get by category/genre
        getByCategory: (category, params) =>
            api.get(`/playlists/category/${category}`, { params }),

        // HOT page - Latest by category
        getLatestByCategory: () => api.get('/playlists/hot/latest'),

        // Following playlists (Auth required)
        getFollowing: (userId, token, params) =>
            api.get(`/playlists/following/${userId}`, {
                ...createAuthHeader(token),
                params
            }),

        // Search playlists
        search: (query, params) => api.get('/playlists/search', { params: { query, ...params } }),

        // Search private playlists (Auth required)
        searchPrivate: (query, userId, token) =>
            api.get('/playlists/search-private', {
                ...createAuthHeader(token),
                params: { query, userId }
            })
    },

    // ========== HOT SERVICES ==========
    hot: {
        // Get hot playlists (latest from each genre)
        getHotPlaylists: () => api.get('/hot'),

        // Get by genre
        getByGenre: (genre) => api.get(`/hot/genre/${genre}/latest`),

        // Get by category (Backward compatibility)
        getByCategory: (category) => api.get(`/hot/category/${category}`),

        // Get trending playlists
        getTrending: (params) => api.get('/hot/trending', { params }),

        // Get new releases
        getNewReleases: (params) => api.get('/hot/new-releases', { params }),

        // Get stats
        getStats: () => api.get('/hot/stats')
    },

    // ========== SEARCH SERVICES ==========
    search: {
        // Unified search
        searchAll: (query, params) => api.get('/search', { params: { query, ...params } }),

        // Search users
        searchUsers: (query, params) =>
            api.get('/search/users', { params: { query, ...params } }),

        // Search playlists
        searchPlaylists: (query, params) =>
            api.get('/search/playlists', { params: { query, ...params } }),

        // Search musics
        searchMusics: (query, params) =>
            api.get('/search/musics', { params: { query, ...params } }),

        // Search by artist
        searchByArtist: (artist) => api.get('/search/by-artist', { params: { artist } }),

        // Search by genre
        searchByGenre: (genre, query) =>
            api.get('/search/by-genre', { params: { genre, query } }),

        // Get suggestions (autocomplete)
        getSuggestions: (query, limit) =>
            api.get('/search/suggestions', { params: { query, limit } }),

        // Search private playlists (Auth required)
        searchPrivate: (query, userId, token) =>
            api.get('/search/private-playlists', {
                ...createAuthHeader(token),
                params: { query, userId }
            })
    },

    // ========== SAMPLE SERVICES ==========
    samples: {
        getAll: (params) => api.get('/samples', { params }),

        upload: (formData, token) =>
            api.post('/samples/add', formData, createMultipartHeader(token)),

        delete: (id, token) => api.delete(`/samples/${id}`, createAuthHeader(token)),

        generateDownloadLink: (sampleId, token) =>
            api.post('/samples/download/generate', { sampleId }, createAuthHeader(token)),

        getStats: (token) => api.get('/samples/stats', createAuthHeader(token))
    },

    // ========== PAYMENT SERVICES ==========
    payments: {
        // Verify Google Play purchase
        verifyGooglePlay: (purchaseData, token) =>
            api.post('/payments/verify-google-play', purchaseData, createAuthHeader(token)),

        // Get subscription status
        getSubscriptionStatus: (token) =>
            api.get('/payments/subscription-status', createAuthHeader(token)),

        // Quick premium check
        quickPremiumCheck: (token) =>
            api.get('/payments/premium-check', createAuthHeader(token)),

        // Get payment history
        getHistory: (token, params) =>
            api.get('/payments/history', {
                ...createAuthHeader(token),
                params
            }),

        // Get payment details
        getPaymentDetails: (paymentId, token) =>
            api.get(`/payments/${paymentId}`, createAuthHeader(token)),

        // Test premium (Development only)
        activateTestPremium: (duration, token) =>
            api.post('/payments/test/activate-premium', { duration }, createAuthHeader(token))
    },

    // ========== AUTH SERVICES ==========
    auth: {
        register: (userData) => api.post('/register', userData),
        login: (credentials) => api.post('/login', credentials),
        logout: (token) => api.post('/logout', {}, createAuthHeader(token)),
        getProfile: (token) => api.get('/profile', createAuthHeader(token)),
        updateProfile: (data, token) =>
            api.put('/profile', data, createAuthHeader(token)),
        searchUsers: (query) => api.get('/users/search', { params: { query } })
    },

    // ========== NOTIFICATION SERVICES ==========
    notifications: {
        send: (data, token) =>
            api.post('/notifications/send', data, createAuthHeader(token)),

        getHistory: (token, params) =>
            api.get('/notifications/history', {
                ...createAuthHeader(token),
                params
            }),

        getStats: (token) =>
            api.get('/notifications/stats', createAuthHeader(token))
    },

    // ========== STORE SERVICES ==========
    store: {
        getListings: (params) => api.get('/store/listings', { params }),

        createListing: (data, token) =>
            api.post('/store/listings', data, createAuthHeader(token)),

        updateListing: (id, data, token) =>
            api.put(`/store/listings/${id}`, data, createAuthHeader(token)),

        deleteListing: (id, token) =>
            api.delete(`/store/listings/${id}`, createAuthHeader(token)),

        uploadImage: (formData, token) =>
            api.post('/store/upload', formData, createMultipartHeader(token)),

        getStats: (token) => api.get('/store/admin/stats', createAuthHeader(token))
    },

    // ========== DOWNLOAD SERVICES ==========
    downloads: {
        generateLink: (fileType, fileName, token) =>
            api.post('/download/generate-link', { fileType, fileName }, createAuthHeader(token)),

        getHistory: (token, params) =>
            api.get('/download/history', {
                ...createAuthHeader(token),
                params
            })
    },

    // ========== UTILITY FUNCTIONS ==========
    utils: {
        // Health check
        healthCheck: () => api.get('/health'),

        // Get API documentation
        getDocs: () => api.get('/docs'),

        // Upload image (generic)
        uploadImage: (file, folder = 'general', token) => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('folder', folder);
            return api.post('/upload/image', formData, createMultipartHeader(token));
        }
    }
};

// ========== EXPORT NAMED ==========
export const {
    music,
    playlists,
    hot,
    search,
    samples,
    payments,
    auth,
    notifications,
    store,
    downloads,
    utils
} = {
    music: api.music,
    playlists: api.playlists,
    hot: api.hot,
    search: api.search,
    samples: api.samples,
    payments: api.payments,
    auth: api.auth,
    notifications: api.notifications,
    store: api.store,
    downloads: api.downloads,
    utils: api.utils
};
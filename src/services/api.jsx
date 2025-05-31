// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

export default {
    // Samples
    getSamples: () => api.get('/samples'),
    uploadSample: (formData) => api.post('/samples/add', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    deleteSample: (id) => api.delete(`/samples/${id}`),
    generateDownloadLink: (sampleId) => api.post('/samples/download/generate', { sampleId }),

    // Admin Playlists (Authentication YOK)
    getAdminPlaylists: () => api.get('/playlists/admin'),
    createAdminPlaylist: (data) => api.post('/playlists/admin', data),
    updateAdminPlaylist: (id, data) => api.put(`/playlists/admin/${id}`, data),
    deleteAdminPlaylist: (id) => api.delete(`/playlists/admin/${id}`),

    // User Playlists (Authentication ZORUNLU)
    getUserPlaylists: (userId, token) => api.get(`/playlists/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    createUserPlaylist: (data, token) => api.post('/playlists/user', data, {
        headers: { Authorization: `Bearer ${token}` }
    }),
    deleteUserPlaylist: (id, token) => api.delete(`/playlists/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    }),

    // Music
    getMusic: () => api.get('/music'),
    addMusic: (data) => api.post('/music', data),
    updateMusic: (id, data) => api.put(`/music/${id}`, data),
    deleteMusic: (id) => api.delete(`/music/${id}`),

    // HOT Playlists
    getHotPlaylists: () => api.get('/hot'),
    getHotPlaylistByCategory: (category) => api.get(`/hot/category/${category}`),
    getHotStats: () => api.get('/hot/stats')
};
// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

export default {
    // Samples
    getSamples: () => api.get('/samples'),
    uploadSample: (formData) => api.post('/samples', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }),
    deleteSample: (id) => api.delete(`/samples/${id}`),
    generateDownloadLink: (sampleId) => api.post('/download/generate', { sampleId }),

    // Playlists
    getPlaylists: () => api.get('/playlists'),
    createPlaylist: (data) => api.post('/playlists', data),
    deletePlaylist: (id) => api.delete(`/playlists/${id}`)
};
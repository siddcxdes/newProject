import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// User APIs
export const getUser = () => api.get('/profile');
export const updateUser = (data) => api.put('/profile', data);
export const updateSettings = (data) => api.put('/settings', data);

// Activity APIs
export const logActivity = (data) => api.post('/activities/log', data);
export const getTodayActivities = () => api.get('/activities/today');
export const getHeatmapData = () => api.get('/activities/heatmap');

// Analytics APIs
export const getAnalytics = () => api.get('/analytics');

export default api;

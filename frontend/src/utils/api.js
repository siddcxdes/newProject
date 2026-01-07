import axios from 'axios';

// In dev, Vite proxy handles `/api` -> localhost backend.
// In prod, you MUST set VITE_API_URL to your deployed backend base (including `/api`).
const API_BASE = import.meta.env.VITE_API_URL || '/api';

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
    // eslint-disable-next-line no-console
    console.warn('[api] VITE_API_URL is not set. Requests will go to same-origin /api and likely fail on Vercel.');
}

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach JWT on every request (stored client-side) so refresh/new device works after login
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('ascension_token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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

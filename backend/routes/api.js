import express from 'express';
import {
    getUser,
    updateUser,
    updateSettings,
    logActivity,
    getTodayActivities,
    getHeatmapData,
    getAnalytics
} from '../controllers/userController.js';

const router = express.Router();

// User routes
router.get('/profile', getUser);
router.put('/profile', updateUser);
router.put('/settings', updateSettings);

// Activity routes
router.post('/activities/log', logActivity);
router.get('/activities/today', getTodayActivities);
router.get('/activities/heatmap', getHeatmapData);

// Analytics routes
router.get('/analytics', getAnalytics);

export default router;

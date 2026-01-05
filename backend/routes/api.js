import express from 'express';
import { protect } from '../middleware/auth.js';
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

// All routes require authentication
router.use(protect);

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

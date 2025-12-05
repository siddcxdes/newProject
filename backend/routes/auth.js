import express from 'express';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name: name || 'Champion',
            email: email.toLowerCase(),
            password
        });

        res.status(201).json({
            user: user.toJSON(),
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            user: user.toJSON(),
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json({ user: req.user });
});

// @route   PUT /api/auth/sync
// @desc    Sync user data from client
// @access  Private
router.put('/sync', protect, async (req, res) => {
    try {
        const { name, dsaTopics, aiModules, workouts, goals, activities, stats, streak, xp, level, xpToNextLevel, settings } = req.body;

        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (dsaTopics) user.dsaTopics = dsaTopics;
        if (aiModules) user.aiModules = aiModules;
        if (workouts) user.workouts = workouts;
        if (goals) user.goals = goals;
        if (activities) user.activities = activities;
        if (stats) user.stats = stats;
        if (streak) user.streak = streak;
        if (xp !== undefined) user.xp = xp;
        if (level !== undefined) user.level = level;
        if (xpToNextLevel !== undefined) user.xpToNextLevel = xpToNextLevel;
        if (settings) user.settings = settings;

        await user.save();
        res.json({ user: user.toJSON(), message: 'Data synced' });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ message: 'Sync failed' });
    }
});

export default router;

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
        console.log('📥 SYNC REQUEST from user:', req.user?.email);
        console.log('📥 Body received:', JSON.stringify({
            workouts: req.body.workouts?.length || 0,
            dsaTopics: req.body.dsaTopics?.length || 0,
            aiModules: req.body.aiModules?.length || 0
        }));

        const { name, dsaTopics, aiModules, workouts, goals, activities, stats, streak, xp, level, xpToNextLevel, settings } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            console.error('❌ User not found:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }

        // Always update these fields (don't skip if empty array)
        if (name !== undefined) user.name = name;
        if (dsaTopics !== undefined) user.dsaTopics = dsaTopics;
        if (aiModules !== undefined) user.aiModules = aiModules;
        if (workouts !== undefined) user.workouts = workouts;
        if (goals !== undefined) user.goals = goals;
        if (activities !== undefined) user.activities = activities;
        if (stats !== undefined) user.stats = stats;
        if (streak !== undefined) user.streak = streak;
        if (xp !== undefined) user.xp = xp;
        if (level !== undefined) user.level = level;
        if (xpToNextLevel !== undefined) user.xpToNextLevel = xpToNextLevel;
        if (settings !== undefined) user.settings = settings;

        console.log('💾 Saving user with workouts:', user.workouts?.length || 0);
        await user.save();
        console.log('✅ SYNC SAVED for:', user.email);

        res.json({ user: user.toJSON(), message: 'Data synced' });
    } catch (error) {
        console.error('❌ Sync error:', error);
        res.status(500).json({ message: 'Sync failed' });
    }
});

export default router;

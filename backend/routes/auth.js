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
            aiModules: req.body.aiModules?.length || 0,
            learningDomains: req.body.learningDomains?.length || 0,
            goals: req.body.goals?.length || 0,
            activities: req.body.activities?.length || 0
        }));

        const { name, dsaTopics, aiModules, workouts, goals, activities, dailyTasks, heatmapData, learningDomains, stats, streak, xp, level, xpToNextLevel, settings, quote } = req.body;

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
        if (dailyTasks !== undefined) user.dailyTasks = dailyTasks;
        if (heatmapData !== undefined) user.heatmapData = heatmapData;
        if (learningDomains !== undefined) user.learningDomains = learningDomains;
        if (stats !== undefined) user.stats = stats;
        if (streak !== undefined) user.streak = streak;
        if (xp !== undefined) user.xp = xp;
        if (level !== undefined) user.level = level;
        if (xpToNextLevel !== undefined) user.xpToNextLevel = xpToNextLevel;
        if (settings !== undefined) user.settings = settings;
        if (quote !== undefined) user.quote = quote;

        console.log('💾 Saving user with:', {
            workouts: user.workouts?.length || 0,
            learningDomains: user.learningDomains?.length || 0,
            dsaTopics: user.dsaTopics?.length || 0
        });
        await user.save();
        console.log('✅ SYNC SAVED for:', user.email);

        res.json({ user: user.toJSON(), message: 'Data synced' });
    } catch (error) {
        console.error('❌ Sync error:', error);
        res.status(500).json({ message: 'Sync failed' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset (sends reset token via email)
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate reset token (simple random 6-char code for now)
        const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
        const resetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        console.log(`🔐 Password reset token for ${email}: ${resetToken}`);

        res.json({
            message: 'If an account exists, a reset link has been sent.',
            // For development, return the token (remove in production)
            ...(process.env.NODE_ENV !== 'production' && { resetToken })
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        if (!email || !token || !newPassword) {
            return res.status(400).json({ message: 'Email, token, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log(`✅ Password reset successful for ${email}`);

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

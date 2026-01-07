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
    try {
        // IMPORTANT: return the full persisted user state from DB.
        // `protect` attaches a user, but this route is the entrypoint for hydration.
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
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

        // Build update object with only defined fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (dsaTopics !== undefined) updateData.dsaTopics = dsaTopics;
        if (aiModules !== undefined) updateData.aiModules = aiModules;
        if (workouts !== undefined) updateData.workouts = workouts;
        if (goals !== undefined) updateData.goals = goals;
        if (activities !== undefined) updateData.activities = activities;
        if (dailyTasks !== undefined) updateData.dailyTasks = dailyTasks;
        if (heatmapData !== undefined) updateData.heatmapData = heatmapData;
        if (learningDomains !== undefined) updateData.learningDomains = learningDomains;
        if (stats !== undefined) updateData.stats = stats;
        if (streak !== undefined) updateData.streak = streak;
        if (xp !== undefined) updateData.xp = xp;
        if (level !== undefined) updateData.level = level;
        if (xpToNextLevel !== undefined) updateData.xpToNextLevel = xpToNextLevel;
        if (settings !== undefined) updateData.settings = settings;
        if (quote !== undefined) updateData.quote = quote;

        console.log('💾 Saving user with:', {
            workouts: updateData.workouts?.length || 0,
            learningDomains: updateData.learningDomains?.length || 0,
            dsaTopics: updateData.dsaTopics?.length || 0
        });

        // Use findByIdAndUpdate to avoid full document validation (password issue)
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true, runValidators: false }
        );

        if (!user) {
            console.error('❌ User not found:', req.user._id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('✅ SYNC SAVED for:', user.email, '| DB now has:', {
            dsaTopics: user.dsaTopics?.length || 0,
            aiModules: user.aiModules?.length || 0,
            workouts: user.workouts?.length || 0,
            learningDomains: user.learningDomains?.length || 0
        });
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

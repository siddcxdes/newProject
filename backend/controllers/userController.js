import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { protect } from '../middleware/auth.js';

// Helper to get IST date string
const getISTDateString = (date = new Date()) => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(date.getTime() + istOffset);
    return istDate.toISOString().split('T')[0];
};

// Helper to get week start (Monday) in IST
const getWeekStartIST = () => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const day = istDate.getDay();
    const diff = istDate.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(istDate.setDate(diff));
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateUser = async (req, res) => {
    try {
        const { name, quote, dsaTopics, aiModules, workouts, goals, dailyTasks, heatmapData, learningDomains } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name !== undefined) user.name = name;
        if (quote !== undefined) user.quote = quote;
        if (dsaTopics !== undefined) user.dsaTopics = dsaTopics;
        if (aiModules !== undefined) user.aiModules = aiModules;
        if (workouts !== undefined) user.workouts = workouts;
        if (goals !== undefined) user.goals = goals;
        if (dailyTasks !== undefined) user.dailyTasks = dailyTasks;
        if (heatmapData !== undefined) user.heatmapData = heatmapData;
        if (learningDomains !== undefined) user.learningDomains = learningDomains;

        await user.save();
        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res) => {
    try {
        const { settings } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (settings) {
            user.settings = { ...user.settings.toObject(), ...settings };
        }

        await user.save();
        res.json({ user: user.toJSON() });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Log activity and award XP
// @route   POST /api/activities/log
// @access  Private
export const logActivity = async (req, res) => {
    try {
        const { type, details } = req.body;
        const userId = req.user._id;

        // Calculate XP based on activity type
        let xpEarned = 0;
        switch (type) {
            case 'dsa':
                const difficulty = details?.difficulty || 'medium';
                xpEarned = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 50;
                break;
            case 'ai':
                xpEarned = 30;
                break;
            case 'gym':
                xpEarned = 20;
                break;
            case 'job':
                xpEarned = 15;
                break;
            case 'personal':
                xpEarned = 10;
                break;
            default:
                xpEarned = 10;
        }

        // Create activity record
        const activity = await Activity.create({
            userId,
            type,
            xpEarned,
            details
        });

        // Update user XP and stats
        const user = await User.findById(userId);
        user.xp += xpEarned;
        
        // Check for level up
        const xpThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
        let newLevel = 1;
        for (let i = xpThresholds.length - 1; i >= 0; i--) {
            if (user.xp >= xpThresholds[i]) {
                newLevel = i + 1;
                break;
            }
        }
        const leveledUp = newLevel > user.level;
        user.level = newLevel;
        user.xpToNextLevel = xpThresholds[newLevel] || xpThresholds[xpThresholds.length - 1] + 1000;

        // Update streak
        const today = getISTDateString();
        const lastActivity = user.streak.lastActivityDate ? getISTDateString(user.streak.lastActivityDate) : null;
        
        if (lastActivity !== today) {
            if (lastActivity) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastActivity === getISTDateString(yesterday)) {
                    user.streak.current += 1;
                } else {
                    user.streak.current = 1;
                }
            } else {
                user.streak.current = 1;
            }
            user.streak.longest = Math.max(user.streak.longest, user.streak.current);
            user.streak.lastActivityDate = new Date();
        }

        // Update type-specific stats
        const todayDate = getISTDateString();
        if (type === 'dsa') {
            if (user.stats.dsaTodayDate !== todayDate) {
                user.stats.dsaProblemsToday = 0;
                user.stats.dsaTodayDate = todayDate;
            }
            user.stats.dsaProblemsToday += 1;
            user.stats.dsaProblemsTotal += 1;
        } else if (type === 'gym') {
            const weekStart = getWeekStartIST();
            if (!user.stats.gymWeekStart || new Date(user.stats.gymWeekStart) < weekStart) {
                user.stats.gymDaysThisWeek = 0;
                user.stats.gymWeekStart = weekStart;
            }
            user.stats.gymDaysThisWeek += 1;
        } else if (type === 'job') {
            user.stats.jobApplications += 1;
        } else if (type === 'personal') {
            user.stats.personalWins += 1;
        }

        await user.save();

        res.json({
            activity,
            xpEarned,
            leveledUp,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Log activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get today's activities
// @route   GET /api/activities/today
// @access  Private
export const getTodayActivities = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activities = await Activity.find({
            userId,
            date: { $gte: today }
        }).sort({ date: -1 });

        res.json({ activities });
    } catch (error) {
        console.error('Get today activities error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get heatmap data (last 365 days)
// @route   GET /api/activities/heatmap
// @access  Private
export const getHeatmapData = async (req, res) => {
    try {
        const userId = req.user._id;
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);

        const activities = await Activity.aggregate([
            {
                $match: {
                    userId: userId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    count: { $sum: 1 },
                    totalXp: { $sum: '$xpEarned' }
                }
            }
        ]);

        const heatmapData = {};
        activities.forEach(item => {
            heatmapData[item._id] = {
                count: item.count,
                totalXp: item.totalXp
            };
        });

        res.json({ heatmapData });
    } catch (error) {
        console.error('Get heatmap error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = '7d' } = req.query;

        let startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Get activity breakdown by type
        const activityByType = await Activity.aggregate([
            {
                $match: {
                    userId: userId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalXp: { $sum: '$xpEarned' }
                }
            }
        ]);

        // Get daily activity counts
        const dailyActivity = await Activity.aggregate([
            {
                $match: {
                    userId: userId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    count: { $sum: 1 },
                    totalXp: { $sum: '$xpEarned' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            activityByType,
            dailyActivity,
            period
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

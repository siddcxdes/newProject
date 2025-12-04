import User from '../models/User.js';
import Activity from '../models/Activity.js';

// XP values for different activities
const XP_VALUES = {
    dsa: { easy: 10, medium: 25, hard: 50 },
    ai: 30,
    gym: 20,
    job: 15,
    personal: 10
};

// Get or create default user
export const getUser = async (req, res) => {
    try {
        let user = await User.findOne();

        if (!user) {
            user = await User.create({
                name: 'Champion'
            });
        }

        // Reset daily DSA count if it's a new day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (user.stats.dsaTodayDate) {
            const lastDsaDate = new Date(user.stats.dsaTodayDate);
            lastDsaDate.setHours(0, 0, 0, 0);

            if (today > lastDsaDate) {
                user.stats.dsaProblemsToday = 0;
                user.stats.dsaTodayDate = today;
                await user.save();
            }
        }

        // Reset weekly gym count if it's a new week
        const monday = new Date(today);
        monday.setDate(monday.getDate() - monday.getDay() + 1);

        if (user.stats.gymWeekStart) {
            const lastWeekStart = new Date(user.stats.gymWeekStart);
            if (monday > lastWeekStart) {
                user.stats.gymDaysThisWeek = 0;
                user.stats.gymWeekStart = monday;
                await user.save();
            }
        }

        // Calculate current week of journey
        const journeyStart = new Date(user.journey.startDate);
        journeyStart.setHours(0, 0, 0, 0);
        const weeksDiff = Math.floor((today - journeyStart) / (7 * 24 * 60 * 60 * 1000)) + 1;
        user.journey.currentWeek = Math.min(weeksDiff, user.journey.totalWeeks);

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user profile
export const updateUser = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            {},
            req.body,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user settings
export const updateSettings = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            {},
            { settings: req.body },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Log activity and award XP
export const logActivity = async (req, res) => {
    try {
        const { type, difficulty, notes, moduleName } = req.body;

        let user = await User.findOne();
        if (!user) {
            user = await User.create({ name: 'Champion' });
        }

        // Calculate XP
        let xpEarned = 0;
        if (type === 'dsa') {
            xpEarned = XP_VALUES.dsa[difficulty] || XP_VALUES.dsa.medium;
        } else {
            xpEarned = XP_VALUES[type] || 10;
        }

        // Create activity record
        const activity = await Activity.create({
            userId: user._id,
            type,
            xpEarned,
            details: { difficulty, notes, moduleName },
            date: new Date()
        });

        // Update user stats
        user.xp += xpEarned;
        user.updateStreak();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (type) {
            case 'dsa':
                user.stats.dsaProblemsTotal += 1;
                if (!user.stats.dsaTodayDate || new Date(user.stats.dsaTodayDate).setHours(0, 0, 0, 0) < today) {
                    user.stats.dsaProblemsToday = 1;
                    user.stats.dsaTodayDate = today;
                } else {
                    user.stats.dsaProblemsToday += 1;
                }
                break;
            case 'ai':
                user.stats.aiModulesCompleted += 1;
                user.stats.aiProgress = Math.min(100, user.stats.aiModulesCompleted * 5);
                break;
            case 'gym':
                const monday = new Date(today);
                monday.setDate(monday.getDate() - monday.getDay() + 1);
                if (!user.stats.gymWeekStart || new Date(user.stats.gymWeekStart) < monday) {
                    user.stats.gymDaysThisWeek = 1;
                    user.stats.gymWeekStart = monday;
                } else {
                    user.stats.gymDaysThisWeek = Math.min(7, user.stats.gymDaysThisWeek + 1);
                }
                break;
            case 'job':
                user.stats.jobApplications += 1;
                break;
            case 'personal':
                user.stats.personalWins += 1;
                break;
        }

        // Check for level up
        const levelsGained = user.checkLevelUp();

        await user.save();

        res.json({
            activity,
            user,
            xpEarned,
            levelsGained
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get today's activities
export const getTodayActivities = async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) {
            return res.json([]);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const activities = await Activity.find({
            userId: user._id,
            date: { $gte: today, $lt: tomorrow }
        }).sort({ date: -1 });

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get activity heatmap data (last 365 days)
export const getHeatmapData = async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) {
            return res.json({});
        }

        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);

        const activities = await Activity.aggregate([
            {
                $match: {
                    userId: user._id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$date' }
                    },
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

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get analytics overview
export const getAnalytics = async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) {
            return res.json({});
        }

        // Get activities by type
        const activityBreakdown = await Activity.aggregate([
            { $match: { userId: user._id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    totalXp: { $sum: '$xpEarned' }
                }
            }
        ]);

        // Get weekly data for the last 4 weeks
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

        const weeklyData = await Activity.aggregate([
            {
                $match: {
                    userId: user._id,
                    date: { $gte: fourWeeksAgo }
                }
            },
            {
                $group: {
                    _id: {
                        week: { $week: '$date' },
                        year: { $year: '$date' }
                    },
                    count: { $sum: 1 },
                    totalXp: { $sum: '$xpEarned' }
                }
            },
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]);

        res.json({
            user,
            activityBreakdown,
            weeklyData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

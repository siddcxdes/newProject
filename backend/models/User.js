import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Champion'
    },
    phone: {
        type: String,
        unique: true,
        sparse: true, // Allows null values while maintaining uniqueness
        trim: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // Now optional
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 6
        // No longer required
    },
    level: {
        type: Number,
        default: 1
    },
    xp: {
        type: Number,
        default: 0
    },
    xpToNextLevel: {
        type: Number,
        default: 500
    },
    streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActivityDate: { type: Date, default: null }
    },
    stats: {
        dsaProblemsTotal: { type: Number, default: 0 },
        dsaProblemsToday: { type: Number, default: 0 },
        dsaTodayDate: { type: Date, default: null },
        aiModulesCompleted: { type: Number, default: 0 },
        aiProgress: { type: Number, default: 0 },
        gymDaysThisWeek: { type: Number, default: 0 },
        gymWeekStart: { type: Date, default: null },
        jobApplications: { type: Number, default: 0 },
        personalWins: { type: Number, default: 0 }
    },
    journey: {
        startDate: { type: Date, default: Date.now },
        totalWeeks: { type: Number, default: 17 },
        currentWeek: { type: Number, default: 1 }
    },
    settings: {
        dailyDsaGoal: { type: Number, default: 3 },
        weeklyGymGoal: { type: Number, default: 5 },
        theme: { type: String, default: 'dark' }
    },
    // Data storage
    dsaTopics: { type: Array, default: [] },
    aiModules: { type: Array, default: [] },
    workouts: { type: Array, default: [] },
    goals: { type: Array, default: [] },
    activities: { type: Array, default: [] },
    // Heatmap data for activity visualization (keyed by date string, e.g., "2025-01-02")
    heatmapData: { type: Object, default: {} },
    // Daily check-in tasks, keyed by date string (e.g., "2025-12-08")
    // Each date contains: { dsa: [...], ai: [...], other: [...] }
    dailyTasks: { type: Object, default: {} }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate level thresholds
userSchema.methods.calculateXpForLevel = function (level) {
    if (level <= 1) return 0;
    return Math.floor(500 * Math.pow(1.5, level - 2)) + this.calculateXpForLevel(level - 1);
};

// Check and handle level up
userSchema.methods.checkLevelUp = function () {
    let levelsGained = 0;
    while (this.xp >= this.xpToNextLevel) {
        this.level += 1;
        levelsGained += 1;
        this.xpToNextLevel = this.calculateXpForLevel(this.level + 1);
    }
    return levelsGained;
};

// Update streak
userSchema.methods.updateStreak = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (this.streak.lastActivityDate) {
        const lastDate = new Date(this.streak.lastActivityDate);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return;
        else if (diffDays === 1) {
            this.streak.current += 1;
            if (this.streak.current > this.streak.longest) {
                this.streak.longest = this.streak.current;
            }
        } else {
            this.streak.current = 1;
        }
    } else {
        this.streak.current = 1;
    }
    this.streak.lastActivityDate = today;
};

// Return user data without password
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

const User = mongoose.model('User', userSchema);

export default User;

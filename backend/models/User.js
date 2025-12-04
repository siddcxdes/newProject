import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Champion'
    },
    email: {
        type: String,
        unique: true,
        sparse: true
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
    }
}, {
    timestamps: true
});

// Calculate level thresholds
userSchema.methods.calculateXpForLevel = function (level) {
    // Level 1: 0-499, Level 2: 500-1199, etc.
    if (level <= 1) return 0;
    return Math.floor(500 * Math.pow(1.5, level - 2)) + this.calculateXpForLevel(level - 1);
};

// Check and handle level up
userSchema.methods.checkLevelUp = function () {
    let levelsGained = 0;
    while (this.xp >= this.xpToNextLevel) {
        this.level += 1;
        levelsGained += 1;
        // Calculate new XP threshold
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

        const diffTime = today - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Same day, no change
            return;
        } else if (diffDays === 1) {
            // Consecutive day, increment streak
            this.streak.current += 1;
            if (this.streak.current > this.streak.longest) {
                this.streak.longest = this.streak.current;
            }
        } else {
            // Streak broken, reset to 1
            this.streak.current = 1;
        }
    } else {
        // First activity ever
        this.streak.current = 1;
    }

    this.streak.lastActivityDate = today;
};

const User = mongoose.model('User', userSchema);

export default User;

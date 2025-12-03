import { DailyActivity, DSAProblem, DifficultyLevel } from '@/types';

// Calculate current week number (1-17) based on start date
export const calculateWeekNumber = (startDate: string): number => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil(diffDays / 7);
    return Math.min(weekNumber, 17); // Cap at 17 weeks
};

// Calculate expected progress (0-100) based on week number
export const calculateExpectedProgress = (weekNumber: number): number => {
    return Math.min((weekNumber / 17) * 100, 100);
};

// Calculate week progress (completed vs target) - ALWAYS capped at 100%
export const calculateWeekProgress = (completed: number, target: number): number => {
    if (target <= 0) return 0;
    const progress = (completed / target) * 100;
    return Math.min(Math.max(progress, 0), 100); // Cap between 0-100%
};

// Calculate current streak with proper validation
export const calculateStreak = (dailyActivities: DailyActivity[]): number => {
    if (dailyActivities.length === 0) return 0;

    // Sort activities by date (most recent first)
    const sorted = [...dailyActivities].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
        const activityDate = new Date(sorted[i].date);
        activityDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        expectedDate.setHours(0, 0, 0, 0);

        // Check if activity has any meaningful progress
        const hasProgress = sorted[i].dsaProblems > 0 ||
            sorted[i].aiModules > 0 ||
            sorted[i].gymSession ||
            sorted[i].socialActivities > 0 ||
            sorted[i].jobApplications > 0;

        if (activityDate.getTime() === expectedDate.getTime() && hasProgress) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

// Calculate longest streak
export const calculateLongestStreak = (dailyActivities: DailyActivity[]): number => {
    if (dailyActivities.length === 0) return 0;

    const sorted = [...dailyActivities].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const activity of sorted) {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);

        const hasProgress = activity.dsaProblems > 0 ||
            activity.aiModules > 0 ||
            activity.gymSession ||
            activity.socialActivities > 0 ||
            activity.jobApplications > 0;

        if (!hasProgress) continue;

        if (lastDate === null) {
            currentStreak = 1;
        } else {
            const dayDiff = Math.floor((activityDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
        }

        lastDate = activityDate;
    }

    return Math.max(maxStreak, currentStreak);
};

// Calculate XP for an activity
export const calculateXP = (
    type: 'dsa' | 'ai' | 'gym' | 'job',
    difficulty?: DifficultyLevel
): number => {
    switch (type) {
        case 'dsa':
            if (difficulty === 'Easy') return 10;
            if (difficulty === 'Medium') return 25;
            if (difficulty === 'Hard') return 50;
            return 10;
        case 'ai':
            return 30;
        case 'gym':
            return 20;
        case 'job':
            return 15;
        default:
            return 0;
    }
};

// Calculate level from XP
export const calculateLevel = (totalXP: number): number => {
    return Math.min(Math.floor(totalXP / 500) + 1, 20);
};

// Calculate XP needed for next level
export const calculateXPForNextLevel = (currentLevel: number): number => {
    return currentLevel * 500;
};

// Calculate productivity score for a day (0-100)
export const calculateProductivityScore = (activity: DailyActivity): number => {
    let score = 0;

    // DSA problems (max 40 points)
    score += Math.min(activity.dsaProblems * 10, 40);

    // AI modules (max 30 points)
    score += Math.min(activity.aiModules * 15, 30);

    // Gym session (20 points)
    if (activity.gymSession) score += 20;

    // Social activities (max 5 points)
    score += Math.min(activity.socialActivities * 5, 5);

    // Job applications (max 5 points)
    score += Math.min(activity.jobApplications * 5, 5);

    return Math.min(score, 100);
};

// Get activity for a specific date
export const getActivityForDate = (
    dailyActivities: DailyActivity[],
    date: string
): DailyActivity | undefined => {
    return dailyActivities.find(activity => activity.date === date);
};

// Create or update daily activity
export const updateDailyActivity = (
    dailyActivities: DailyActivity[],
    date: string,
    updates: Partial<Omit<DailyActivity, 'date'>>
): DailyActivity[] => {
    const existingIndex = dailyActivities.findIndex(a => a.date === date);

    if (existingIndex >= 0) {
        // Update existing activity
        const updated = [...dailyActivities];
        updated[existingIndex] = {
            ...updated[existingIndex],
            ...updates,
        };
        // Recalculate productivity score
        updated[existingIndex].productivityScore = calculateProductivityScore(updated[existingIndex]);
        return updated;
    } else {
        // Create new activity
        const newActivity: DailyActivity = {
            date,
            dsaProblems: 0,
            aiModules: 0,
            gymSession: false,
            socialActivities: 0,
            jobApplications: 0,
            productivityScore: 0,
            ...updates,
        };
        newActivity.productivityScore = calculateProductivityScore(newActivity);
        return [...dailyActivities, newActivity];
    }
};

// Validate date (cannot be in the future)
export const isValidDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    return date <= now;
};

// Format date for display
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// Format time for display
export const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Get today's date as YYYY-MM-DD
export const getTodayString = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

// Check if it's evening (after 8 PM)
export const isEvening = (): boolean => {
    const now = new Date();
    return now.getHours() >= 20;
};

// Generate unique ID
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

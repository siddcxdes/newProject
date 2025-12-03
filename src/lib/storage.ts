import { AppState, DailyActivity } from '@/types';

const STORAGE_KEY = 'ascension_app_data';
const BACKUP_KEY = 'ascension_backup';

// Initialize default state
export const getDefaultState = (): AppState => {
    const now = new Date();
    const fourMonthsLater = new Date(now);
    fourMonthsLater.setMonth(now.getMonth() + 4);

    return {
        profile: {
            name: 'Champion',
            targetRole: 'Software Engineer',
            targetSalary: '15-25 LPA',
            startDate: now.toISOString(),
            endDate: fourMonthsLater.toISOString(),
            dailyGoals: {
                dsaProblems: 3,
                aiLearningHours: 2,
                gymDaysPerWeek: 5,
            },
        },
        settings: {
            theme: 'dark',
            accentColor: '#6366f1',
            notifications: {
                enabled: true,
                dailyReminder: '09:00',
                streakWarning: true,
                eveningReview: true,
                weeklyReview: true,
                motivational: true,
            },
            cloudSync: {
                enabled: false,
            },
        },
        dsaProblems: [],
        aiModules: [],
        gymSessions: [],
        gymStats: {
            currentStreak: 0,
            longestStreak: 0,
            freezeTokens: 0,
            totalSessions: 0,
        },
        personalGoals: [],
        books: [],
        socialActivities: [],
        weeklyReflections: [],
        jobApplications: [],
        networkingContacts: [],
        rejectionLogs: [],
        dailyCheckIns: [],
        gamification: {
            totalXP: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            streakProtectionTokens: 0,
            badges: [],
            challenges: [],
        },
        dailyActivities: [],
    };
};

// Load data from localStorage
export const loadState = (): AppState => {
    if (typeof window === 'undefined') return getDefaultState();

    try {
        const serializedState = localStorage.getItem(STORAGE_KEY);
        if (serializedState === null) {
            return getDefaultState();
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error('Error loading state:', err);
        return getDefaultState();
    }
};

// Save data to localStorage
export const saveState = (state: AppState): void => {
    if (typeof window === 'undefined') return;

    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (err) {
        console.error('Error saving state:', err);
    }
};

// Create backup
export const createBackup = (state: AppState): void => {
    if (typeof window === 'undefined') return;

    try {
        const backup = {
            timestamp: new Date().toISOString(),
            data: state,
        };
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (err) {
        console.error('Error creating backup:', err);
    }
};

// Restore from backup
export const restoreFromBackup = (): AppState | null => {
    if (typeof window === 'undefined') return null;

    try {
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup === null) return null;
        const parsed = JSON.parse(backup);
        return parsed.data;
    } catch (err) {
        console.error('Error restoring backup:', err);
        return null;
    }
};

// Export data as JSON
export const exportAsJSON = (state: AppState): void => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascension_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
};

// Export data as CSV
export const exportAsCSV = (state: AppState): void => {
    // Export daily activities as CSV
    const headers = ['Date', 'DSA Problems', 'AI Modules', 'Gym Session', 'Social Activities', 'Job Applications', 'Productivity Score'];
    const rows = state.dailyActivities.map(activity => [
        activity.date,
        activity.dsaProblems.toString(),
        activity.aiModules.toString(),
        activity.gymSession ? 'Yes' : 'No',
        activity.socialActivities.toString(),
        activity.jobApplications.toString(),
        activity.productivityScore.toString(),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascension_activities_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

// Import data from JSON
export const importFromJSON = (file: File): Promise<AppState> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                resolve(data);
            } catch (err) {
                reject(new Error('Invalid JSON file'));
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
};

// Clear all data
export const clearAllData = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
};

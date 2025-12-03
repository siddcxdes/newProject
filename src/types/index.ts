// User Profile & Settings
export interface UserProfile {
    name: string;
    targetRole: string;
    targetSalary: string;
    startDate: string; // ISO date string
    endDate: string; // ISO date string (4 months from start)
    dailyGoals: {
        dsaProblems: number;
        aiLearningHours: number;
        gymDaysPerWeek: number;
    };
}

// DSA & Coding
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface DSAProblem {
    id: string;
    title: string;
    difficulty: DifficultyLevel;
    topic: string;
    link?: string;
    solvedDate: string; // ISO date string
    notes?: string;
    needsRevision: boolean;
    nextRevisionDate?: string; // ISO date string
}

// AI/ML Learning
export interface AIModule {
    id: string;
    name: string;
    category: string;
    progress: number; // 0-100
    timeSpent: number; // minutes
    completedDate?: string; // ISO date string
    notes?: string;
    concepts: string[];
    projects: string[];
}

// Gym & Health
export interface GymSession {
    id: string;
    date: string; // ISO date string
    workoutType: string;
    duration: number; // minutes
    feeling: 1 | 2 | 3 | 4 | 5;
    isRestDay: boolean;
    notes?: string;
}

export interface GymStats {
    currentStreak: number;
    longestStreak: number;
    freezeTokens: number;
    totalSessions: number;
}

// Personal Development & Social
export interface PersonalGoal {
    id: string;
    name: string;
    targetDate: string; // ISO date string
    progress: number; // 0-100
    milestones: {
        id: string;
        name: string;
        completed: boolean;
    }[];
}

export interface Book {
    id: string;
    title: string;
    author: string;
    status: 'To Read' | 'Reading' | 'Completed';
    startDate?: string;
    completedDate?: string;
    notes?: string;
}

export interface SocialActivity {
    id: string;
    date: string; // ISO date string
    type: string;
    description: string;
    notes?: string;
}

export interface WeeklyReflection {
    id: string;
    weekNumber: number;
    startDate: string; // ISO date string
    biggestWin: string;
    biggestChallenge: string;
    lessonsLearned: string;
    nextWeekFocus: string;
}

// Job Hunt
export type JobStatus = 'Saved' | 'Applied' | 'Interview Scheduled' | 'Offer' | 'Rejected';

export interface JobApplication {
    id: string;
    company: string;
    role: string;
    salaryRange: string;
    status: JobStatus;
    applicationDate: string; // ISO date string
    statusHistory: {
        status: JobStatus;
        date: string; // ISO date string
    }[];
    interviewPrep: {
        id: string;
        task: string;
        completed: boolean;
    }[];
    skillsGap: string[];
    notes?: string;
}

export interface NetworkingContact {
    id: string;
    name: string;
    company: string;
    platform: 'LinkedIn' | 'Email' | 'Coffee Chat' | 'Other';
    date: string; // ISO date string
    notes?: string;
}

export interface RejectionLog {
    id: string;
    company: string;
    role: string;
    date: string; // ISO date string
    learnings: string;
}

// Daily Check-In
export interface DailyCheckIn {
    id: string;
    date: string; // ISO date string (YYYY-MM-DD)
    morningTasks: {
        id: string;
        task: string;
        completed: boolean;
        completedAt?: string; // ISO timestamp
    }[];
    eveningReview?: {
        whatWentWell: string;
        whatBlocked: string;
        energyLevel: 1 | 2 | 3 | 4 | 5;
        tomorrowPriorities: string[];
    };
    productivityScore: number; // 0-100, calculated
}

// Gamification
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedDate?: string; // ISO date string
}

export interface Challenge {
    id: string;
    name: string;
    description: string;
    target: number;
    current: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    xpReward: number;
    completed: boolean;
}

export interface GamificationState {
    totalXP: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    streakProtectionTokens: number;
    badges: Badge[];
    challenges: Challenge[];
}

// Analytics
export interface DailyActivity {
    date: string; // ISO date string (YYYY-MM-DD)
    dsaProblems: number;
    aiModules: number;
    gymSession: boolean;
    socialActivities: number;
    jobApplications: number;
    productivityScore: number; // 0-100
}

export interface WeeklySummary {
    weekNumber: number;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    dsaProblems: number;
    aiModules: number;
    gymDays: number;
    productivityScore: number; // 0-100
    comparisonToPrevious: {
        dsaProblems: number; // percentage change
        aiModules: number;
        gymDays: number;
        productivityScore: number;
    };
}

// Settings
export interface AppSettings {
    theme: 'light' | 'dark';
    accentColor: string; // hex color
    notifications: {
        enabled: boolean;
        dailyReminder: string; // time in HH:MM format
        streakWarning: boolean;
        eveningReview: boolean;
        weeklyReview: boolean;
        motivational: boolean;
    };
    cloudSync: {
        enabled: boolean;
        lastSync?: string; // ISO timestamp
    };
}

// Main App State
export interface AppState {
    profile: UserProfile;
    settings: AppSettings;
    dsaProblems: DSAProblem[];
    aiModules: AIModule[];
    gymSessions: GymSession[];
    gymStats: GymStats;
    personalGoals: PersonalGoal[];
    books: Book[];
    socialActivities: SocialActivity[];
    weeklyReflections: WeeklyReflection[];
    jobApplications: JobApplication[];
    networkingContacts: NetworkingContact[];
    rejectionLogs: RejectionLog[];
    dailyCheckIns: DailyCheckIn[];
    gamification: GamificationState;
    dailyActivities: DailyActivity[];
}

// Quick Action Types
export type QuickActionType = 'gym' | 'dsa' | 'ai' | 'personal';

export interface QuickActionData {
    type: QuickActionType;
    data: any;
}

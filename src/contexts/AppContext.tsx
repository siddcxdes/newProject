'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, DSAProblem, AIModule, GymSession, PersonalGoal, Book, SocialActivity, WeeklyReflection, JobApplication, NetworkingContact, RejectionLog, DailyCheckIn, UserProfile, AppSettings } from '@/types';
import { loadState, saveState, getDefaultState } from '@/lib/storage';
import { calculateStreak, calculateLongestStreak, calculateXP, calculateLevel, updateDailyActivity, getTodayString, generateId } from '@/lib/calculations';

interface AppContextType {
    state: AppState;
    lastSaved: Date | null;
    updateProfile: (profile: Partial<UserProfile>) => void;
    updateSettings: (settings: Partial<AppSettings>) => void;
    addDSAProblem: (problem: Omit<DSAProblem, 'id'>) => void;
    updateDSAProblem: (id: string, updates: Partial<DSAProblem>) => void;
    deleteDSAProblem: (id: string) => void;
    addAIModule: (module: Omit<AIModule, 'id'>) => void;
    updateAIModule: (id: string, updates: Partial<AIModule>) => void;
    deleteAIModule: (id: string) => void;
    addGymSession: (session: Omit<GymSession, 'id'>) => void;
    updateGymSession: (id: string, updates: Partial<GymSession>) => void;
    deleteGymSession: (id: string) => void;
    addPersonalGoal: (goal: Omit<PersonalGoal, 'id'>) => void;
    updatePersonalGoal: (id: string, updates: Partial<PersonalGoal>) => void;
    deletePersonalGoal: (id: string) => void;
    addBook: (book: Omit<Book, 'id'>) => void;
    updateBook: (id: string, updates: Partial<Book>) => void;
    deleteBook: (id: string) => void;
    addSocialActivity: (activity: Omit<SocialActivity, 'id'>) => void;
    addWeeklyReflection: (reflection: Omit<WeeklyReflection, 'id'>) => void;
    addJobApplication: (job: Omit<JobApplication, 'id'>) => void;
    updateJobApplication: (id: string, updates: Partial<JobApplication>) => void;
    addNetworkingContact: (contact: Omit<NetworkingContact, 'id'>) => void;
    addRejectionLog: (log: Omit<RejectionLog, 'id'>) => void;
    addDailyCheckIn: (checkIn: Omit<DailyCheckIn, 'id'>) => void;
    updateDailyCheckIn: (id: string, updates: Partial<DailyCheckIn>) => void;
    addXP: (amount: number) => void;
    refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<AppState>(getDefaultState());
    const [isClient, setIsClient] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        setIsClient(true);
        const loadedState = loadState();
        setState(loadedState);
        setLastSaved(new Date());

        // Initialize theme
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', loadedState.settings.theme);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isClient) {
            saveState(state);
            setLastSaved(new Date());
        }
    }, [state, isClient]);

    // Recalculate streaks whenever daily activities change
    useEffect(() => {
        if (isClient && state.dailyActivities.length > 0) {
            const currentStreak = calculateStreak(state.dailyActivities);
            const longestStreak = calculateLongestStreak(state.dailyActivities);

            setState(prev => ({
                ...prev,
                gamification: {
                    ...prev.gamification,
                    currentStreak,
                    longestStreak: Math.max(longestStreak, prev.gamification.longestStreak),
                },
            }));
        }
    }, [state.dailyActivities, isClient]);

    const updateProfile = (profile: Partial<UserProfile>) => {
        setState(prev => ({
            ...prev,
            profile: { ...prev.profile, ...profile },
        }));
    };

    const updateSettings = (settings: Partial<AppSettings>) => {
        setState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...settings },
        }));
    };

    const addDSAProblem = (problem: Omit<DSAProblem, 'id'>) => {
        const newProblem: DSAProblem = {
            ...problem,
            id: generateId(),
        };

        setState(prev => {
            const updated = {
                ...prev,
                dsaProblems: [...prev.dsaProblems, newProblem],
            };

            // Update daily activity
            const today = getTodayString();
            const todayActivity = prev.dailyActivities.find(a => a.date === today);
            const currentCount = todayActivity?.dsaProblems || 0;

            updated.dailyActivities = updateDailyActivity(
                prev.dailyActivities,
                today,
                { dsaProblems: currentCount + 1 }
            );

            return updated;
        });

        // Add XP
        addXP(calculateXP('dsa', problem.difficulty));
    };

    const updateDSAProblem = (id: string, updates: Partial<DSAProblem>) => {
        setState(prev => ({
            ...prev,
            dsaProblems: prev.dsaProblems.map(p => p.id === id ? { ...p, ...updates } : p),
        }));
    };

    const deleteDSAProblem = (id: string) => {
        setState(prev => ({
            ...prev,
            dsaProblems: prev.dsaProblems.filter(p => p.id !== id),
        }));
    };

    const addAIModule = (module: Omit<AIModule, 'id'>) => {
        const newModule: AIModule = {
            ...module,
            id: generateId(),
        };

        setState(prev => {
            const updated = {
                ...prev,
                aiModules: [...prev.aiModules, newModule],
            };

            // Update daily activity if module is completed
            if (module.progress === 100) {
                const today = getTodayString();
                const todayActivity = prev.dailyActivities.find(a => a.date === today);
                const currentCount = todayActivity?.aiModules || 0;

                updated.dailyActivities = updateDailyActivity(
                    prev.dailyActivities,
                    today,
                    { aiModules: currentCount + 1 }
                );
            }

            return updated;
        });

        // Add XP if completed
        if (module.progress === 100) {
            addXP(calculateXP('ai'));
        }
    };

    const updateAIModule = (id: string, updates: Partial<AIModule>) => {
        setState(prev => ({
            ...prev,
            aiModules: prev.aiModules.map(m => m.id === id ? { ...m, ...updates } : m),
        }));
    };

    const deleteAIModule = (id: string) => {
        setState(prev => ({
            ...prev,
            aiModules: prev.aiModules.filter(m => m.id !== id),
        }));
    };

    const addGymSession = (session: Omit<GymSession, 'id'>) => {
        const newSession: GymSession = {
            ...session,
            id: generateId(),
        };

        setState(prev => {
            const updated = {
                ...prev,
                gymSessions: [...prev.gymSessions, newSession],
                gymStats: {
                    ...prev.gymStats,
                    totalSessions: prev.gymStats.totalSessions + 1,
                },
            };

            // Update daily activity
            if (!session.isRestDay) {
                updated.dailyActivities = updateDailyActivity(
                    prev.dailyActivities,
                    session.date,
                    { gymSession: true }
                );
            }

            return updated;
        });

        // Add XP
        if (!session.isRestDay) {
            addXP(calculateXP('gym'));
        }
    };

    const updateGymSession = (id: string, updates: Partial<GymSession>) => {
        setState(prev => ({
            ...prev,
            gymSessions: prev.gymSessions.map(s => s.id === id ? { ...s, ...updates } : s),
        }));
    };

    const deleteGymSession = (id: string) => {
        setState(prev => ({
            ...prev,
            gymSessions: prev.gymSessions.filter(s => s.id !== id),
        }));
    };

    const addPersonalGoal = (goal: Omit<PersonalGoal, 'id'>) => {
        setState(prev => ({
            ...prev,
            personalGoals: [...prev.personalGoals, { ...goal, id: generateId() }],
        }));
    };

    const updatePersonalGoal = (id: string, updates: Partial<PersonalGoal>) => {
        setState(prev => ({
            ...prev,
            personalGoals: prev.personalGoals.map(g => g.id === id ? { ...g, ...updates } : g),
        }));
    };

    const deletePersonalGoal = (id: string) => {
        setState(prev => ({
            ...prev,
            personalGoals: prev.personalGoals.filter(g => g.id !== id),
        }));
    };

    const addBook = (book: Omit<Book, 'id'>) => {
        setState(prev => ({
            ...prev,
            books: [...prev.books, { ...book, id: generateId() }],
        }));
    };

    const updateBook = (id: string, updates: Partial<Book>) => {
        setState(prev => ({
            ...prev,
            books: prev.books.map(b => b.id === id ? { ...b, ...updates } : b),
        }));
    };

    const deleteBook = (id: string) => {
        setState(prev => ({
            ...prev,
            books: prev.books.filter(b => b.id !== id),
        }));
    };

    const addSocialActivity = (activity: Omit<SocialActivity, 'id'>) => {
        setState(prev => {
            const updated = {
                ...prev,
                socialActivities: [...prev.socialActivities, { ...activity, id: generateId() }],
            };

            // Update daily activity
            const todayActivity = prev.dailyActivities.find(a => a.date === activity.date);
            const currentCount = todayActivity?.socialActivities || 0;

            updated.dailyActivities = updateDailyActivity(
                prev.dailyActivities,
                activity.date,
                { socialActivities: currentCount + 1 }
            );

            return updated;
        });
    };

    const addWeeklyReflection = (reflection: Omit<WeeklyReflection, 'id'>) => {
        setState(prev => ({
            ...prev,
            weeklyReflections: [...prev.weeklyReflections, { ...reflection, id: generateId() }],
        }));
    };

    const addJobApplication = (job: Omit<JobApplication, 'id'>) => {
        setState(prev => {
            const updated = {
                ...prev,
                jobApplications: [...prev.jobApplications, { ...job, id: generateId() }],
            };

            // Update daily activity
            const today = getTodayString();
            const todayActivity = prev.dailyActivities.find(a => a.date === today);
            const currentCount = todayActivity?.jobApplications || 0;

            updated.dailyActivities = updateDailyActivity(
                prev.dailyActivities,
                today,
                { jobApplications: currentCount + 1 }
            );

            return updated;
        });

        // Add XP
        addXP(calculateXP('job'));
    };

    const updateJobApplication = (id: string, updates: Partial<JobApplication>) => {
        setState(prev => ({
            ...prev,
            jobApplications: prev.jobApplications.map(j => j.id === id ? { ...j, ...updates } : j),
        }));
    };

    const addNetworkingContact = (contact: Omit<NetworkingContact, 'id'>) => {
        setState(prev => ({
            ...prev,
            networkingContacts: [...prev.networkingContacts, { ...contact, id: generateId() }],
        }));
    };

    const addRejectionLog = (log: Omit<RejectionLog, 'id'>) => {
        setState(prev => ({
            ...prev,
            rejectionLogs: [...prev.rejectionLogs, { ...log, id: generateId() }],
        }));
    };

    const addDailyCheckIn = (checkIn: Omit<DailyCheckIn, 'id'>) => {
        setState(prev => ({
            ...prev,
            dailyCheckIns: [...prev.dailyCheckIns, { ...checkIn, id: generateId() }],
        }));
    };

    const updateDailyCheckIn = (id: string, updates: Partial<DailyCheckIn>) => {
        setState(prev => ({
            ...prev,
            dailyCheckIns: prev.dailyCheckIns.map(c => c.id === id ? { ...c, ...updates } : c),
        }));
    };

    const addXP = (amount: number) => {
        setState(prev => {
            const newTotalXP = prev.gamification.totalXP + amount;
            const newLevel = calculateLevel(newTotalXP);

            return {
                ...prev,
                gamification: {
                    ...prev.gamification,
                    totalXP: newTotalXP,
                    level: newLevel,
                },
            };
        });
    };

    const refreshData = () => {
        const loadedState = loadState();
        setState(loadedState);
    };

    const value: AppContextType = {
        state,
        lastSaved,
        updateProfile,
        updateSettings,
        addDSAProblem,
        updateDSAProblem,
        deleteDSAProblem,
        addAIModule,
        updateAIModule,
        deleteAIModule,
        addGymSession,
        updateGymSession,
        deleteGymSession,
        addPersonalGoal,
        updatePersonalGoal,
        deletePersonalGoal,
        addBook,
        updateBook,
        deleteBook,
        addSocialActivity,
        addWeeklyReflection,
        addJobApplication,
        updateJobApplication,
        addNetworkingContact,
        addRejectionLog,
        addDailyCheckIn,
        updateDailyCheckIn,
        addXP,
        refreshData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

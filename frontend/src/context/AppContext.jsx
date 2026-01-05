import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as api from '../utils/api';

const AppContext = createContext();

// Default user data
const DEFAULT_USER = {
    name: 'Champion',
    level: 1,
    xp: 0,
    xpToNextLevel: 500,
    streak: { current: 0, longest: 0, lastActivityDate: null },
    stats: {
        dsaProblemsTotal: 0,
        dsaProblemsToday: 0,
        aiModulesCompleted: 0,
        aiProgress: 0,
        gymDaysThisWeek: 0,
        jobApplications: 0,
        personalWins: 0
    },
    journey: {
        startDate: new Date().toISOString(),
        totalWeeks: 17,
        currentWeek: 1
    },
    settings: {
        dailyDsaGoal: 3,
        weeklyGymGoal: 5,
        theme: 'light'
    }
};

// Default DSA Topics with subtopics
const DEFAULT_DSA_TOPICS = [
    {
        id: 1,
        name: 'Arrays & Hashing',
        icon: '📊',
        completed: 0,
        total: 20,
        subtopics: [
            { id: 101, name: 'Two Sum', difficulty: 'easy', completed: false },
            { id: 102, name: 'Contains Duplicate', difficulty: 'easy', completed: false },
            { id: 103, name: 'Valid Anagram', difficulty: 'easy', completed: false },
            { id: 104, name: 'Group Anagrams', difficulty: 'medium', completed: false },
            { id: 105, name: 'Top K Frequent Elements', difficulty: 'medium', completed: false },
        ]
    },
    {
        id: 2,
        name: 'Two Pointers',
        icon: '👆',
        completed: 0,
        total: 15,
        subtopics: [
            { id: 201, name: 'Valid Palindrome', difficulty: 'easy', completed: false },
            { id: 202, name: 'Two Sum II', difficulty: 'medium', completed: false },
            { id: 203, name: '3Sum', difficulty: 'medium', completed: false },
            { id: 204, name: 'Container With Most Water', difficulty: 'medium', completed: false },
        ]
    },
    {
        id: 3,
        name: 'Sliding Window',
        icon: '🪟',
        completed: 0,
        total: 12,
        subtopics: [
            { id: 301, name: 'Best Time to Buy and Sell Stock', difficulty: 'easy', completed: false },
            { id: 302, name: 'Longest Substring Without Repeating', difficulty: 'medium', completed: false },
            { id: 303, name: 'Minimum Window Substring', difficulty: 'hard', completed: false },
        ]
    },
    { id: 4, name: 'Binary Search', icon: '🔍', completed: 0, total: 15, subtopics: [] },
    { id: 5, name: 'Linked List', icon: '🔗', completed: 0, total: 18, subtopics: [] },
    { id: 6, name: 'Trees', icon: '🌳', completed: 0, total: 25, subtopics: [] },
    { id: 7, name: 'Graphs', icon: '🕸️', completed: 0, total: 20, subtopics: [] },
    { id: 8, name: 'Dynamic Programming', icon: '📈', completed: 0, total: 30, subtopics: [] },
];

// Default AI Modules with lessons
const DEFAULT_AI_MODULES = [
    {
        id: 1,
        name: 'Python Fundamentals',
        icon: '🐍',
        completed: false,
        progress: 0,
        lessons: [
            { id: 101, name: 'Variables & Data Types', completed: false },
            { id: 102, name: 'Control Flow', completed: false },
            { id: 103, name: 'Functions', completed: false },
            { id: 104, name: 'OOP Basics', completed: false },
        ]
    },
    {
        id: 2,
        name: 'NumPy & Pandas',
        icon: '📊',
        completed: false,
        progress: 0,
        lessons: [
            { id: 201, name: 'NumPy Arrays', completed: false },
            { id: 202, name: 'Pandas DataFrames', completed: false },
            { id: 203, name: 'Data Manipulation', completed: false },
        ]
    },
    { id: 3, name: 'Machine Learning Basics', icon: '🤖', completed: false, progress: 0, lessons: [] },
    { id: 4, name: 'Neural Networks', icon: '🧠', completed: false, progress: 0, lessons: [] },
    { id: 5, name: 'Deep Learning', icon: '🔮', completed: false, progress: 0, lessons: [] },
    { id: 6, name: 'NLP Fundamentals', icon: '💬', completed: false, progress: 0, lessons: [] },
    { id: 7, name: 'Computer Vision', icon: '👁️', completed: false, progress: 0, lessons: [] },
    { id: 8, name: 'Reinforcement Learning', icon: '🎮', completed: false, progress: 0, lessons: [] },
];

// Default Workout Routines
const DEFAULT_WORKOUTS = [
    { id: 1, name: 'Push Day', icon: '💪', exercises: ['Bench Press', 'Shoulder Press', 'Tricep Dips'], timesCompleted: 0 },
    { id: 2, name: 'Pull Day', icon: '🏋️', exercises: ['Deadlift', 'Rows', 'Bicep Curls'], timesCompleted: 0 },
    { id: 3, name: 'Leg Day', icon: '🦵', exercises: ['Squats', 'Lunges', 'Leg Press'], timesCompleted: 0 },
    { id: 4, name: 'Cardio', icon: '🏃', exercises: ['Running', 'Cycling', 'Jump Rope'], timesCompleted: 0 },
    { id: 5, name: 'Full Body', icon: '🔥', exercises: ['Burpees', 'Mountain Climbers', 'Planks'], timesCompleted: 0 },
];

// Default goals
const DEFAULT_GOALS = [
    { id: 1, text: 'Network with 5 people this week', completed: false, createdAt: new Date().toISOString() },
    { id: 2, text: 'Attend 1 tech meetup', completed: false, createdAt: new Date().toISOString() },
    { id: 3, text: 'Post on LinkedIn', completed: true, createdAt: new Date().toISOString() },
    { id: 4, text: 'Help someone with their code', completed: false, createdAt: new Date().toISOString() },
];

// XP values
const XP_VALUES = {
    dsa: { easy: 10, medium: 25, hard: 50 },
    ai: 30,
    gym: 20,
    job: 15,
    personal: 10
};

// Default Learning Domains - unified structure for customizable domains
const DEFAULT_LEARNING_DOMAINS = [
    {
        id: 'dsa',
        name: 'Data Structures & Algorithms',
        shortName: 'DSA',
        icon: '📊',
        color: 'violet',
        type: 'problem-based', // has difficulty levels (easy/medium/hard)
        xpPerItem: { easy: 10, medium: 25, hard: 50 },
        topics: []
    },
    {
        id: 'ai',
        name: 'AI & Machine Learning',
        shortName: 'AI/ML',
        icon: '🤖',
        color: 'emerald',
        type: 'module-based', // flat XP per item
        xpPerItem: 30,
        topics: []
    },
    {
        id: 'job',
        name: 'Job Search',
        shortName: 'Jobs',
        icon: '💼',
        color: 'blue',
        type: 'module-based',
        xpPerItem: 15,
        topics: []
    }
];

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

const MAX_HISTORY = 50;

export const AppProvider = ({ children }) => {
    // Core state - initialize with defaults, will be hydrated from server
    const [user, setUser] = useState(DEFAULT_USER);
    const [activities, setActivities] = useState([]);
    const [heatmapData, setHeatmapData] = useState({});
    const [goals, setGoals] = useState(DEFAULT_GOALS);

    // Academics state
    const [dsaTopics, setDsaTopics] = useState(DEFAULT_DSA_TOPICS);
    const [aiModules, setAiModules] = useState(DEFAULT_AI_MODULES);

    // Gym state
    const [workouts, setWorkouts] = useState(DEFAULT_WORKOUTS);

    // Daily check-in tasks state (keyed by date string, e.g., "2025-12-08")
    const [dailyTasks, setDailyTasks] = useState({});

    // Learning Domains - unified customizable domains
    const [learningDomains, setLearningDomains] = useState(DEFAULT_LEARNING_DOMAINS);

    // UI state
    const [loading, setLoading] = useState(true); // Start true for initial load
    const [lastSaved, setLastSaved] = useState(new Date());
    const [notification, setNotification] = useState(null);
    const [useLocalStorage, setUseLocalStorage] = useState(false); // No localStorage

    // Auth state - only token stored in localStorage
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('ascension_token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Start false, set after checking

    // Undo/Redo state
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isUndoRedoAction = useRef(false);
    const initializedRef = useRef(false);
    const hydrationCompleteRef = useRef(false); // Prevents sync before hydration

    // Use refs to track latest data for sync (prevents stale closure issues)
    const dataRef = useRef({ user: null, dsaTopics: [], aiModules: [], workouts: [], goals: [], activities: [], learningDomains: [] });

    // API base URL
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // Helper to hydrate all state from server user data
    const hydrateFromServerData = (serverUser) => {
        console.log('🔄 HYDRATING FROM SERVER:', {
            hasUser: !!serverUser,
            workouts: serverUser?.workouts?.length || 0,
            dsaTopics: serverUser?.dsaTopics?.length || 0,
            aiModules: serverUser?.aiModules?.length || 0,
            serverData: serverUser
        });

        if (!serverUser) {
            console.error('❌ No server user data to hydrate!');
            return;
        }

        // Build user object from server data
        const hydratedUser = {
            name: serverUser.name || DEFAULT_USER.name,
            level: serverUser.level || DEFAULT_USER.level,
            xp: serverUser.xp || DEFAULT_USER.xp,
            xpToNextLevel: serverUser.xpToNextLevel || DEFAULT_USER.xpToNextLevel,
            streak: serverUser.streak || DEFAULT_USER.streak,
            stats: serverUser.stats || DEFAULT_USER.stats,
            journey: serverUser.journey || DEFAULT_USER.journey,
            settings: serverUser.settings || DEFAULT_USER.settings,
            quote: serverUser.quote || "The only way to do great work is to love what you do."
        };
        setUser(hydratedUser);

        // ALWAYS use server data for authenticated users
        // This ensures cross-device sync works correctly
        // (Server data is the source of truth, even if empty)
        const workoutsToSet = serverUser.workouts || [];
        const dsaTopicsToSet = serverUser.dsaTopics || [];
        const aiModulesToSet = serverUser.aiModules || [];
        const goalsToSet = serverUser.goals || [];
        const activitiesToSet = serverUser.activities || [];
        const dailyTasksToSet = serverUser.dailyTasks || {};
        const heatmapDataToSet = serverUser.heatmapData || {};
        const learningDomainsToSet = serverUser.learningDomains?.length > 0 ? serverUser.learningDomains : DEFAULT_LEARNING_DOMAINS;

        console.log('📊 Setting state from server:', {
            workouts: workoutsToSet.length,
            dsaTopics: dsaTopicsToSet.length,
            aiModules: aiModulesToSet.length,
            dailyTasks: Object.keys(dailyTasksToSet).length,
            heatmapData: Object.keys(heatmapDataToSet).length,
            learningDomains: learningDomainsToSet.length
        });

        setDsaTopics(dsaTopicsToSet);
        setAiModules(aiModulesToSet);
        setWorkouts(workoutsToSet);
        setGoals(goalsToSet);
        setActivities(activitiesToSet);
        setDailyTasks(dailyTasksToSet);
        setHeatmapData(heatmapDataToSet);
        setLearningDomains(learningDomainsToSet);

        // Mark hydration as complete - now safe to sync
        hydrationCompleteRef.current = true;
        console.log('✅ Hydration complete, sync enabled');
    };

    // Initialize auth state on app load - CRITICAL for cross-device sync
    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        const initializeAuth = async () => {
            console.log('🔑 Initializing auth...');
            const token = localStorage.getItem('ascension_token');

            if (!token) {
                console.log('⚠️ No token found, staying in local mode');
                setLoading(false);
                return;
            }

            try {
                console.log('📡 Fetching user from server...');
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log('✅ Got user from server:', data);
                    hydrateFromServerData(data.user);
                    setAuthToken(token);
                    setIsAuthenticated(true);
                    setUseLocalStorage(false);
                } else {
                    console.log('❌ Token invalid, clearing');
                    // Token invalid, clear it
                    localStorage.removeItem('ascension_token');
                    setAuthToken(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
                // Keep using localStorage if server is unavailable
            }

            setLoading(false);
        };

        initializeAuth();
    }, []);

    // Auth functions
    const login = async (email, password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem('ascension_token', data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
        setUseLocalStorage(false);

        // Load user data from server using hydration helper
        hydrateFromServerData(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        localStorage.setItem('ascension_token', data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
        setUseLocalStorage(false);
        if (data.user) setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('ascension_token');
        setAuthToken(null);
        setIsAuthenticated(false);
        setUseLocalStorage(true);
    };

    const syncToCloud = async () => {
        if (!authToken) return;
        // CRITICAL: Use dataRef to get latest values, not stale closure values
        const currentData = dataRef.current;
        if (!currentData.user) {
            console.log('⚠️ Sync skipped: no user data');
            return;
        }
        try {
            console.log('☁️ Syncing to cloud...', { workouts: currentData.workouts?.length || 0 });
            const response = await fetch(`${API_URL}/auth/sync`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    dsaTopics: currentData.dsaTopics,
                    aiModules: currentData.aiModules,
                    workouts: currentData.workouts,
                    goals: currentData.goals,
                    activities: currentData.activities,
                    dailyTasks: currentData.dailyTasks,
                    heatmapData: currentData.heatmapData,
                    learningDomains: currentData.learningDomains,
                    stats: currentData.user?.stats,
                    streak: currentData.user?.streak,
                    xp: currentData.user?.xp,
                    level: currentData.user?.level,
                    xpToNextLevel: currentData.user?.xpToNextLevel,
                    settings: currentData.user?.settings,
                    quote: currentData.user?.quote
                })
            });
            if (response.ok) {
                console.log('✅ Sync successful');
            } else {
                console.error('❌ Sync failed:', response.status);
            }
            setLastSaved(new Date());
        } catch (error) {
            console.error('Sync failed:', error);
        }
    };

    // Update user profile (name, etc.)
    const updateUserProfile = async (updates) => {
        if (!authToken) return;
        const currentData = dataRef.current;
        try {
            const response = await fetch(`${API_URL}/auth/sync`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    ...updates,
                    dsaTopics: currentData.dsaTopics,
                    aiModules: currentData.aiModules,
                    workouts: currentData.workouts,
                    goals: currentData.goals,
                    activities: currentData.activities,
                    stats: currentData.user?.stats,
                    streak: currentData.user?.streak,
                    xp: currentData.user?.xp,
                    level: currentData.user?.level,
                    xpToNextLevel: currentData.user?.xpToNextLevel,
                    settings: currentData.user?.settings
                })
            });
            const data = await response.json();
            if (data.user) {
                setUser(data.user);
            }
            showNotification('Profile updated!', 'success');
            setLastSaved(new Date());
        } catch (error) {
            console.error('Profile update failed:', error);
            showNotification('Failed to update profile', 'error');
        }
    };

    // Debounced cloud sync ref
    const syncTimeoutRef = useRef(null);

    // Debounced sync to cloud - syncs 2 seconds after last change
    const debouncedSyncToCloud = useCallback(() => {
        if (!authToken || !isAuthenticated) {
            console.log('🔒 Sync blocked: not authenticated');
            return;
        }
        if (!hydrationCompleteRef.current) {
            console.log('🔒 Sync blocked: hydration not complete');
            return;
        }

        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        console.log('⏳ Scheduling sync in 2s...');
        syncTimeoutRef.current = setTimeout(() => {
            syncToCloud();
        }, 2000);
    }, [authToken, isAuthenticated]);

    // Auto-sync when authenticated (periodic backup sync)
    useEffect(() => {
        if (isAuthenticated && authToken && hydrationCompleteRef.current) {
            console.log('🔄 Setting up periodic sync (every 60s)');
            const syncInterval = setInterval(syncToCloud, 60000);
            return () => clearInterval(syncInterval);
        }
    }, [isAuthenticated, authToken]);

    // Force sync function (for manual triggering)
    const forceSyncNow = async () => {
        console.log('🚨 FORCE SYNC triggered!');
        await syncToCloud();
    };

    // Keep dataRef updated with latest values (for sync to use)
    useEffect(() => {
        dataRef.current = { user, dsaTopics, aiModules, workouts, goals, activities, dailyTasks, heatmapData, learningDomains };
    }, [user, dsaTopics, aiModules, workouts, goals, activities, dailyTasks, heatmapData, learningDomains]);

    // Trigger cloud sync on data changes (no localStorage)
    useEffect(() => {
        if (user) {
            setLastSaved(new Date());
            if (hydrationCompleteRef.current) debouncedSyncToCloud();
        }
    }, [user, debouncedSyncToCloud]);

    useEffect(() => {
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [activities, debouncedSyncToCloud]);

    useEffect(() => {
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [heatmapData, debouncedSyncToCloud]);

    useEffect(() => {
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [goals, debouncedSyncToCloud]);

    useEffect(() => {
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [dsaTopics, debouncedSyncToCloud]);

    useEffect(() => {
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [aiModules, debouncedSyncToCloud]);

    useEffect(() => {
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [workouts, debouncedSyncToCloud]);

    useEffect(() => {
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [dailyTasks, debouncedSyncToCloud]);

    useEffect(() => {
        console.log('📦 learningDomains updated:', learningDomains.map(d => ({ id: d.id, name: d.shortName, topicsCount: d.topics?.length || 0, topics: d.topics?.map(t => ({ name: t.name, itemsCount: t.items?.length || 0 })) })));
        if (hydrationCompleteRef.current) debouncedSyncToCloud();
    }, [learningDomains, debouncedSyncToCloud]);

    // Save to history for undo/redo
    const saveToHistory = useCallback((action, prevState, newState) => {
        if (isUndoRedoAction.current) {
            isUndoRedoAction.current = false;
            return;
        }
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push({ action, prevState, newState, timestamp: Date.now() });
            if (newHistory.length > MAX_HISTORY) newHistory.shift();
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
    }, [historyIndex]);

    // Show notification
    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    // Undo function
    const undo = useCallback(() => {
        if (historyIndex < 0 || history.length === 0) {
            showNotification('Nothing to undo', 'info');
            return;
        }
        const entry = history[historyIndex];
        isUndoRedoAction.current = true;
        switch (entry.action) {
            case 'ADD_GOAL': case 'EDIT_GOAL': case 'DELETE_GOAL': case 'TOGGLE_GOAL':
                setGoals(entry.prevState);
                break;
            case 'LOG_ACTIVITY':
                setUser(entry.prevState.user);
                setActivities(entry.prevState.activities);
                setHeatmapData(entry.prevState.heatmap);
                break;
            case 'DSA_TOPIC': setDsaTopics(entry.prevState); break;
            case 'AI_MODULE': setAiModules(entry.prevState); break;
            case 'WORKOUT': setWorkouts(entry.prevState); break;
            default: break;
        }
        setHistoryIndex(prev => prev - 1);
        showNotification(`Undo: ${entry.action.replace(/_/g, ' ').toLowerCase()}`, 'info');
    }, [history, historyIndex, showNotification]);

    // Redo function
    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) {
            showNotification('Nothing to redo', 'info');
            return;
        }
        const entry = history[historyIndex + 1];
        isUndoRedoAction.current = true;
        switch (entry.action) {
            case 'ADD_GOAL': case 'EDIT_GOAL': case 'DELETE_GOAL': case 'TOGGLE_GOAL':
                setGoals(entry.newState);
                break;
            case 'LOG_ACTIVITY':
                setUser(entry.newState.user);
                setActivities(entry.newState.activities);
                setHeatmapData(entry.newState.heatmap);
                break;
            case 'DSA_TOPIC': setDsaTopics(entry.newState); break;
            case 'AI_MODULE': setAiModules(entry.newState); break;
            case 'WORKOUT': setWorkouts(entry.newState); break;
            default: break;
        }
        setHistoryIndex(prev => prev + 1);
        showNotification(`Redo: ${entry.action.replace(/_/g, ' ').toLowerCase()}`, 'info');
    }, [history, historyIndex, showNotification]);

    const canUndo = historyIndex >= 0;
    const canRedo = historyIndex < history.length - 1;

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) redo();
                else undo();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                e.preventDefault();
                redo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Calculate XP
    const calculateXp = (type, difficulty) => {
        if (type === 'dsa') return XP_VALUES.dsa[difficulty] || XP_VALUES.dsa.medium;
        return XP_VALUES[type] || 10;
    };

    // Check for level up
    const checkLevelUp = (currentXp, currentLevel) => {
        const xpThresholds = [0, 500, 1200, 2100, 3200, 4500, 6000, 7700, 9600, 11700];
        let newLevel = currentLevel;
        let newXpToNext = 500;
        for (let i = xpThresholds.length - 1; i >= 0; i--) {
            if (currentXp >= xpThresholds[i]) {
                newLevel = i + 1;
                newXpToNext = (xpThresholds[i + 1] || xpThresholds[i] + 2000) - currentXp;
                break;
            }
        }
        return { newLevel, newXpToNext, levelsGained: newLevel - currentLevel };
    };

    // Get IST date string
    const getISTDateString = (date = new Date()) => {
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
        const istDate = new Date(utc + IST_OFFSET);
        return istDate.toISOString().split('T')[0];
    };

    // Get current week's Monday date string in IST
    const getCurrentWeekMondayIST = () => {
        const IST_OFFSET = 5.5 * 60 * 60 * 1000;
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const istNow = new Date(utc + IST_OFFSET);
        const dayOfWeek = istNow.getDay();
        const mondayAdjust = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(istNow);
        monday.setDate(istNow.getDate() + mondayAdjust);
        return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    };

    // Dynamically compute stats from activities (source of truth)
    const computedStats = useMemo(() => {
        const todayIST = getISTDateString();
        const weekStartIST = getCurrentWeekMondayIST();

        let dsaProblemsToday = 0;
        let aiModulesToday = 0;
        const gymDaysThisWeekSet = new Set();
        let jobApplications = 0;
        let personalWins = 0;
        let dsaProblemsTotal = 0;
        let aiModulesCompleted = 0;

        activities.forEach(activity => {
            const activityDateIST = getISTDateString(new Date(activity.date));

            switch (activity.type) {
                case 'dsa':
                    dsaProblemsTotal += 1;
                    if (activityDateIST === todayIST) dsaProblemsToday += 1;
                    break;
                case 'ai':
                    aiModulesCompleted += 1;
                    if (activityDateIST === todayIST) aiModulesToday += 1;
                    break;
                case 'gym':
                    // Count unique gym days this week
                    if (activityDateIST >= weekStartIST && activityDateIST <= todayIST) {
                        gymDaysThisWeekSet.add(activityDateIST);
                    }
                    break;
                case 'job':
                    jobApplications += 1;
                    break;
                case 'personal':
                    personalWins += 1;
                    break;
            }
        });

        return {
            dsaProblemsTotal,
            dsaProblemsToday,
            aiModulesCompleted,
            aiProgress: Math.min(100, aiModulesCompleted * 5),
            gymDaysThisWeek: gymDaysThisWeekSet.size,
            jobApplications,
            personalWins
        };
    }, [activities]);

    // Update streak (using IST)
    const updateStreak = (currentStreak) => {
        const todayIST = getISTDateString();
        if (currentStreak.lastActivityDate) {
            const lastDateIST = getISTDateString(new Date(currentStreak.lastActivityDate));
            if (todayIST === lastDateIST) return currentStreak;

            // Check if yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayIST = getISTDateString(yesterday);

            if (lastDateIST === yesterdayIST) {
                const newCurrent = currentStreak.current + 1;
                return { current: newCurrent, longest: Math.max(newCurrent, currentStreak.longest), lastActivityDate: new Date().toISOString() };
            }
        }
        return { current: 1, longest: Math.max(1, currentStreak.longest), lastActivityDate: new Date().toISOString() };
    };

    // Log activity (using IST for date key)
    const logActivity = async (type, details = {}) => {
        const xpEarned = calculateXp(type, details.difficulty);
        const todayIST = getISTDateString();
        const prevState = { user: { ...user }, activities: [...activities], heatmap: { ...heatmapData } };

        const newActivity = { _id: Date.now().toString(), type, xpEarned, details, date: new Date().toISOString() };
        const newXp = user.xp + xpEarned;
        const { newLevel, newXpToNext, levelsGained } = checkLevelUp(newXp, user.level);
        const newStreak = updateStreak(user.streak);

        const newStats = { ...user.stats };
        switch (type) {
            case 'dsa': newStats.dsaProblemsTotal += 1; newStats.dsaProblemsToday += 1; break;
            case 'ai': newStats.aiModulesCompleted += 1; newStats.aiProgress = Math.min(100, newStats.aiModulesCompleted * 5); break;
            case 'gym': newStats.gymDaysThisWeek = Math.min(7, newStats.gymDaysThisWeek + 1); break;
            case 'job': newStats.jobApplications += 1; break;
            case 'personal': newStats.personalWins += 1; break;
        }

        const newUser = { ...user, xp: newXp, level: newLevel, xpToNextLevel: newXpToNext, streak: newStreak, stats: newStats };
        const newActivities = [newActivity, ...activities];
        const newHeatmap = { ...heatmapData };
        const existing = newHeatmap[todayIST] || { count: 0, totalXp: 0 };
        newHeatmap[todayIST] = { count: existing.count + 1, totalXp: existing.totalXp + xpEarned };

        setUser(newUser);
        setActivities(newActivities);
        setHeatmapData(newHeatmap);
        saveToHistory('LOG_ACTIVITY', prevState, { user: newUser, activities: newActivities, heatmap: newHeatmap });

        if (levelsGained > 0) showNotification(`🎉 Level Up! You're now Level ${newLevel}! +${xpEarned} XP`, 'success');
        else showNotification(`+${xpEarned} XP earned!`, 'success');

        return { xpEarned, activity: newActivity };
    };

    // ===== DSA TOPIC FUNCTIONS =====
    const addDsaTopic = (name, icon = '📝') => {
        const prev = [...dsaTopics];
        const newTopic = { id: Date.now(), name, icon, completed: 0, total: 0, subtopics: [] };
        const newTopics = [...dsaTopics, newTopic];
        setDsaTopics(newTopics);
        saveToHistory('DSA_TOPIC', prev, newTopics);
        showNotification(`Added topic: ${name}`, 'success');
        return newTopic;
    };

    const editDsaTopic = (topicId, updates) => {
        const prev = [...dsaTopics];
        const newTopics = dsaTopics.map(t => t.id === topicId ? { ...t, ...updates } : t);
        setDsaTopics(newTopics);
        saveToHistory('DSA_TOPIC', prev, newTopics);
        showNotification('Topic updated!', 'success');
    };

    const deleteDsaTopic = (topicId) => {
        const prev = [...dsaTopics];
        const newTopics = dsaTopics.filter(t => t.id !== topicId);
        setDsaTopics(newTopics);
        saveToHistory('DSA_TOPIC', prev, newTopics);
        showNotification('Topic deleted', 'info');
    };

    const addDsaSubtopic = (topicId, name, difficulty = 'medium') => {
        const prev = [...dsaTopics];
        const newTopics = dsaTopics.map(t => {
            if (t.id === topicId) {
                const newSubtopic = { id: Date.now(), name, difficulty, completed: false };
                return { ...t, subtopics: [...t.subtopics, newSubtopic], total: t.total + 1 };
            }
            return t;
        });
        setDsaTopics(newTopics);
        saveToHistory('DSA_TOPIC', prev, newTopics);
        showNotification(`Added problem: ${name}`, 'success');
    };

    const toggleDsaSubtopic = (topicId, subtopicId) => {
        const prev = [...dsaTopics];
        const newTopics = dsaTopics.map(t => {
            if (t.id === topicId) {
                const newSubtopics = t.subtopics.map(s =>
                    s.id === subtopicId ? { ...s, completed: !s.completed } : s
                );
                const completedCount = newSubtopics.filter(s => s.completed).length;
                const wasCompleted = t.subtopics.find(s => s.id === subtopicId)?.completed;

                // Log activity if marking as complete
                if (!wasCompleted) {
                    const subtopic = t.subtopics.find(s => s.id === subtopicId);
                    logActivity('dsa', { difficulty: subtopic?.difficulty || 'medium', notes: subtopic?.name });
                }

                return { ...t, subtopics: newSubtopics, completed: completedCount };
            }
            return t;
        });
        setDsaTopics(newTopics);
        saveToHistory('DSA_TOPIC', prev, newTopics);
    };

    const deleteDsaSubtopic = (topicId, subtopicId) => {
        const prev = [...dsaTopics];
        const newTopics = dsaTopics.map(t => {
            if (t.id === topicId) {
                const newSubtopics = t.subtopics.filter(s => s.id !== subtopicId);
                return { ...t, subtopics: newSubtopics, total: Math.max(0, t.total - 1) };
            }
            return t;
        });
        setDsaTopics(newTopics);
        saveToHistory('DSA_TOPIC', prev, newTopics);
        showNotification('Problem removed', 'info');
    };

    // ===== AI MODULE FUNCTIONS =====
    const addAiModule = (name, icon = '📚') => {
        const prev = [...aiModules];
        const newModule = { id: Date.now(), name, icon, completed: false, progress: 0, lessons: [] };
        const newModules = [...aiModules, newModule];
        setAiModules(newModules);
        saveToHistory('AI_MODULE', prev, newModules);
        showNotification(`Added module: ${name}`, 'success');
        return newModule;
    };

    const editAiModule = (moduleId, updates) => {
        const prev = [...aiModules];
        const newModules = aiModules.map(m => m.id === moduleId ? { ...m, ...updates } : m);
        setAiModules(newModules);
        saveToHistory('AI_MODULE', prev, newModules);
        showNotification('Module updated!', 'success');
    };

    const deleteAiModule = (moduleId) => {
        const prev = [...aiModules];
        const newModules = aiModules.filter(m => m.id !== moduleId);
        setAiModules(newModules);
        saveToHistory('AI_MODULE', prev, newModules);
        showNotification('Module deleted', 'info');
    };

    const addAiLesson = (moduleId, name) => {
        const prev = [...aiModules];
        const newModules = aiModules.map(m => {
            if (m.id === moduleId) {
                const newLesson = { id: Date.now(), name, completed: false };
                return { ...m, lessons: [...m.lessons, newLesson] };
            }
            return m;
        });
        setAiModules(newModules);
        saveToHistory('AI_MODULE', prev, newModules);
        showNotification(`Added lesson: ${name}`, 'success');
    };

    const toggleAiLesson = (moduleId, lessonId) => {
        const prev = [...aiModules];
        const newModules = aiModules.map(m => {
            if (m.id === moduleId) {
                const newLessons = m.lessons.map(l =>
                    l.id === lessonId ? { ...l, completed: !l.completed } : l
                );
                const completedCount = newLessons.filter(l => l.completed).length;
                const progress = m.lessons.length > 0 ? Math.round((completedCount / m.lessons.length) * 100) : 0;
                const wasCompleted = m.lessons.find(l => l.id === lessonId)?.completed;

                // Log activity if marking as complete
                if (!wasCompleted) {
                    const lesson = m.lessons.find(l => l.id === lessonId);
                    logActivity('ai', { notes: lesson?.name });
                }

                return { ...m, lessons: newLessons, progress, completed: progress === 100 };
            }
            return m;
        });
        setAiModules(newModules);
        saveToHistory('AI_MODULE', prev, newModules);
    };

    const completeAiModule = (moduleId) => {
        const prev = [...aiModules];
        const newModules = aiModules.map(m => {
            if (m.id === moduleId && !m.completed) {
                logActivity('ai', { notes: m.name });
                return { ...m, completed: true, progress: 100, lessons: m.lessons.map(l => ({ ...l, completed: true })) };
            }
            return m;
        });
        setAiModules(newModules);
        saveToHistory('AI_MODULE', prev, newModules);
    };

    // ===== LEARNING DOMAIN FUNCTIONS =====
    const addLearningDomain = (name, shortName = '', icon = '📚', color = 'blue', type = 'module-based') => {
        const prev = [...learningDomains];
        const newDomain = {
            id: `domain_${Date.now()}`,
            name,
            shortName: shortName || name.substring(0, 10),
            icon,
            color,
            type,
            xpPerItem: type === 'problem-based' ? { easy: 10, medium: 25, hard: 50 } : 30,
            topics: []
        };
        const newDomains = [...learningDomains, newDomain];
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification(`Added domain: ${name}`, 'success');
        return newDomain;
    };

    const editLearningDomain = (domainId, updates) => {
        const prev = [...learningDomains];
        const newDomains = learningDomains.map(d => d.id === domainId ? { ...d, ...updates } : d);
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification('Domain updated!', 'success');
    };

    const deleteLearningDomain = (domainId) => {
        const prev = [...learningDomains];
        const newDomains = learningDomains.filter(d => d.id !== domainId);
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification('Domain deleted', 'info');
    };

    const addDomainTopic = (domainId, name, icon = '📝') => {
        const prev = [...learningDomains];
        const newDomains = learningDomains.map(d => {
            if (d.id === domainId) {
                const newTopic = {
                    id: Date.now(),
                    name,
                    icon,
                    completed: 0,
                    total: 0,
                    items: []
                };
                return { ...d, topics: [...d.topics, newTopic] };
            }
            return d;
        });
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification(`Added topic: ${name}`, 'success');
    };

    const editDomainTopic = (domainId, topicId, updates) => {
        const prev = [...learningDomains];
        const newDomains = learningDomains.map(d => {
            if (d.id === domainId) {
                return {
                    ...d,
                    topics: d.topics.map(t => t.id === topicId ? { ...t, ...updates } : t)
                };
            }
            return d;
        });
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification('Topic updated!', 'success');
    };

    const deleteDomainTopic = (domainId, topicId) => {
        const prev = [...learningDomains];
        const newDomains = learningDomains.map(d => {
            if (d.id === domainId) {
                return { ...d, topics: d.topics.filter(t => t.id !== topicId) };
            }
            return d;
        });
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification('Topic deleted', 'info');
    };

    const addDomainItem = (domainId, topicId, name, difficulty = 'medium') => {
        const prev = [...learningDomains];
        const newDomains = learningDomains.map(d => {
            if (d.id === domainId) {
                return {
                    ...d,
                    topics: d.topics.map(t => {
                        if (t.id === topicId) {
                            const newItem = {
                                id: Date.now(),
                                name,
                                difficulty: d.type === 'problem-based' ? difficulty : undefined,
                                completed: false
                            };
                            return { ...t, items: [...t.items, newItem], total: t.total + 1 };
                        }
                        return t;
                    })
                };
            }
            return d;
        });
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification(`Added item: ${name}`, 'success');
    };

    const toggleDomainItem = (domainId, topicId, itemId) => {
        const prev = [...learningDomains];
        const domain = learningDomains.find(d => d.id === domainId);
        const topic = domain?.topics.find(t => t.id === topicId);
        const item = topic?.items.find(i => i.id === itemId);
        const wasCompleted = item?.completed;

        const newDomains = learningDomains.map(d => {
            if (d.id === domainId) {
                return {
                    ...d,
                    topics: d.topics.map(t => {
                        if (t.id === topicId) {
                            const newItems = t.items.map(i =>
                                i.id === itemId ? { ...i, completed: !i.completed } : i
                            );
                            const completedCount = newItems.filter(i => i.completed).length;
                            return { ...t, items: newItems, completed: completedCount };
                        }
                        return t;
                    })
                };
            }
            return d;
        });
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);

        // Log activity if marking as complete
        if (!wasCompleted && item) {
            const xp = domain.type === 'problem-based'
                ? (domain.xpPerItem[item.difficulty] || 25)
                : (typeof domain.xpPerItem === 'number' ? domain.xpPerItem : 30);
            logActivity('personal', { notes: `${domain.shortName}: ${item.name}`, xpOverride: xp });
        }
    };

    const deleteDomainItem = (domainId, topicId, itemId) => {
        const prev = [...learningDomains];
        const newDomains = learningDomains.map(d => {
            if (d.id === domainId) {
                return {
                    ...d,
                    topics: d.topics.map(t => {
                        if (t.id === topicId) {
                            const newItems = t.items.filter(i => i.id !== itemId);
                            return { ...t, items: newItems, total: Math.max(0, t.total - 1) };
                        }
                        return t;
                    })
                };
            }
            return d;
        });
        setLearningDomains(newDomains);
        saveToHistory('LEARNING_DOMAIN', prev, newDomains);
        showNotification('Item removed', 'info');
    };

    // ===== WORKOUT FUNCTIONS =====
    const addWorkout = (name, icon = '💪', exercises = []) => {
        const prev = [...workouts];
        const newWorkout = { id: Date.now(), name, icon, exercises, timesCompleted: 0 };
        const newWorkouts = [...workouts, newWorkout];
        setWorkouts(newWorkouts);
        saveToHistory('WORKOUT', prev, newWorkouts);
        showNotification(`Added workout: ${name}`, 'success');
        return newWorkout;
    };

    const editWorkout = (workoutId, updates) => {
        const prev = [...workouts];
        const newWorkouts = workouts.map(w => w.id === workoutId ? { ...w, ...updates } : w);
        setWorkouts(newWorkouts);
        saveToHistory('WORKOUT', prev, newWorkouts);
        showNotification('Workout updated!', 'success');
    };

    const deleteWorkout = (workoutId) => {
        const prev = [...workouts];
        const newWorkouts = workouts.filter(w => w.id !== workoutId);
        setWorkouts(newWorkouts);
        saveToHistory('WORKOUT', prev, newWorkouts);
        showNotification('Workout deleted', 'info');
    };

    const logWorkout = (workoutId) => {
        const prev = [...workouts];
        const workout = workouts.find(w => w.id === workoutId);
        if (workout) {
            logActivity('gym', { notes: workout.name });
            const newWorkouts = workouts.map(w =>
                w.id === workoutId ? { ...w, timesCompleted: w.timesCompleted + 1 } : w
            );
            setWorkouts(newWorkouts);
            saveToHistory('WORKOUT', prev, newWorkouts);
        }
    };

    // ===== GOAL FUNCTIONS =====
    const addGoal = (text) => {
        const prev = [...goals];
        const newGoal = { id: Date.now(), text, completed: false, createdAt: new Date().toISOString() };
        const newGoals = [...goals, newGoal];
        setGoals(newGoals);
        saveToHistory('ADD_GOAL', prev, newGoals);
        showNotification('Goal added!', 'success');
        return newGoal;
    };

    const editGoal = (id, newText) => {
        const prev = [...goals];
        const newGoals = goals.map(g => g.id === id ? { ...g, text: newText, updatedAt: new Date().toISOString() } : g);
        setGoals(newGoals);
        saveToHistory('EDIT_GOAL', prev, newGoals);
        showNotification('Goal updated!', 'success');
    };

    const toggleGoal = (id) => {
        const prev = [...goals];
        const newGoals = goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
        setGoals(newGoals);
        saveToHistory('TOGGLE_GOAL', prev, newGoals);
    };

    const deleteGoal = (id) => {
        const prev = [...goals];
        const newGoals = goals.filter(g => g.id !== id);
        setGoals(newGoals);
        saveToHistory('DELETE_GOAL', prev, newGoals);
        showNotification('Goal removed', 'info');
    };

    // Apply theme to document
    const applyTheme = useCallback((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ascension_theme', theme);
    }, []);

    // Initialize theme on mount - force light theme as default
    useEffect(() => {
        // Migration: Force light theme for all users
        const savedTheme = localStorage.getItem('ascension_theme');
        // Always use light theme (user can switch to dark in Settings if they want)
        const themeToApply = 'light';
        applyTheme(themeToApply);
        localStorage.setItem('ascension_theme', 'light'); // Persist light theme
    }, []);

    // Apply theme when settings change
    useEffect(() => {
        if (user?.settings?.theme) {
            applyTheme(user.settings.theme);
        }
    }, [user?.settings?.theme, applyTheme]);

    const updateSettings = async (settings) => {
        setUser(prev => {
            const updated = { ...prev, settings: { ...prev.settings, ...settings } };
            // Update dataRef immediately so sync has latest data
            dataRef.current.user = updated;
            return updated;
        });
        // Theme is applied via the useEffect above
        showNotification('Settings saved!', 'success');
        // Trigger cloud sync after state update
        if (authToken) {
            setTimeout(() => syncToCloud(), 100);
        }
    };

    const refreshData = async () => { };
    // Reset ALL data to defaults
    const resetAll = () => {
        // Reset all state to defaults
        setUser({ ...DEFAULT_USER, journey: { ...DEFAULT_USER.journey, startDate: new Date().toISOString() } });
        setActivities([]);
        setHeatmapData({});  // Empty - no fake historical data for new users
        setGoals([]);
        setDsaTopics(DEFAULT_DSA_TOPICS.map(t => ({ ...t, completed: 0, subtopics: t.subtopics.map(s => ({ ...s, completed: false })) })));
        setAiModules(DEFAULT_AI_MODULES.map(m => ({ ...m, completed: false, progress: 0, lessons: m.lessons.map(l => ({ ...l, completed: false })) })));
        setWorkouts(DEFAULT_WORKOUTS.map(w => ({ ...w, timesCompleted: 0 })));

        // Clear history
        setHistory([]);
        setHistoryIndex(-1);

        showNotification('🔄 All data reset! Fresh start!', 'success');
        
        // Sync reset to cloud
        if (authToken) {
            setTimeout(() => syncToCloud(), 100);
        }
    };

    // Build user with computed stats (always up-to-date)
    const userWithComputedStats = useMemo(() => ({
        ...user,
        stats: { ...user?.stats, ...computedStats }
    }), [user, computedStats]);

    const value = {
        // State - user now has dynamically computed stats
        user: userWithComputedStats, activities, heatmapData, goals, dsaTopics, aiModules, workouts, dailyTasks, learningDomains,
        loading, lastSaved, notification, useLocalStorage, isAuthenticated, computedStats,
        // Daily Tasks
        setDailyTasks,
        // Auth
        login, register, logout, syncToCloud, updateUserProfile, forceSyncNow,
        hydrateFromServerData, setAuthToken, setIsAuthenticated,
        // Activity
        logActivity,
        // Goals
        addGoal, editGoal, toggleGoal, deleteGoal,
        // DSA
        addDsaTopic, editDsaTopic, deleteDsaTopic, addDsaSubtopic, toggleDsaSubtopic, deleteDsaSubtopic,
        // AI
        addAiModule, editAiModule, deleteAiModule, addAiLesson, toggleAiLesson, completeAiModule,
        // Learning Domains
        addLearningDomain, editLearningDomain, deleteLearningDomain,
        addDomainTopic, editDomainTopic, deleteDomainTopic,
        addDomainItem, toggleDomainItem, deleteDomainItem,
        setLearningDomains, // Expose for bulk imports
        // Workouts
        addWorkout, editWorkout, deleteWorkout, logWorkout,
        // Settings & Utils
        updateSettings, refreshData, showNotification, resetAll,
        // Undo/Redo
        undo, redo, canUndo, canRedo
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;

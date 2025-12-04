import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../utils/api';

const AppContext = createContext();

// LocalStorage keys
const STORAGE_KEYS = {
    USER: 'ascension_user',
    ACTIVITIES: 'ascension_activities',
    HEATMAP: 'ascension_heatmap',
    GOALS: 'ascension_goals',
    DSA_TOPICS: 'ascension_dsa_topics',
    AI_MODULES: 'ascension_ai_modules',
    WORKOUTS: 'ascension_workouts'
};

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
        theme: 'dark'
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

// Generate historical heatmap data
const generateHistoricalHeatmap = () => {
    const data = {};
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        let probability = 0.4;
        if (isWeekend) probability = 0.25;
        if (i < 30) probability = 0.6;
        if (i < 7) probability = 0.8;
        if (Math.random() < probability) {
            const count = Math.floor(Math.random() * 5) + 1;
            const totalXp = count * (Math.floor(Math.random() * 30) + 10);
            data[dateStr] = { count, totalXp };
        }
    }
    return data;
};

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue) => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
        if (key === STORAGE_KEYS.HEATMAP) {
            const historical = generateHistoricalHeatmap();
            localStorage.setItem(key, JSON.stringify(historical));
            return historical;
        }
        return defaultValue;
    } catch {
        return defaultValue;
    }
};

// Helper to save to localStorage
const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

const MAX_HISTORY = 50;

export const AppProvider = ({ children }) => {
    // Core state
    const [user, setUser] = useState(() => loadFromStorage(STORAGE_KEYS.USER, DEFAULT_USER));
    const [activities, setActivities] = useState(() => loadFromStorage(STORAGE_KEYS.ACTIVITIES, []));
    const [heatmapData, setHeatmapData] = useState(() => loadFromStorage(STORAGE_KEYS.HEATMAP, generateHistoricalHeatmap()));
    const [goals, setGoals] = useState(() => loadFromStorage(STORAGE_KEYS.GOALS, DEFAULT_GOALS));

    // Academics state
    const [dsaTopics, setDsaTopics] = useState(() => loadFromStorage(STORAGE_KEYS.DSA_TOPICS, DEFAULT_DSA_TOPICS));
    const [aiModules, setAiModules] = useState(() => loadFromStorage(STORAGE_KEYS.AI_MODULES, DEFAULT_AI_MODULES));

    // Gym state
    const [workouts, setWorkouts] = useState(() => loadFromStorage(STORAGE_KEYS.WORKOUTS, DEFAULT_WORKOUTS));

    // UI state
    const [loading, setLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState(new Date());
    const [notification, setNotification] = useState(null);
    const [useLocalStorage, setUseLocalStorage] = useState(true);

    // Undo/Redo state
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isUndoRedoAction = useRef(false);

    // Save to localStorage effects
    useEffect(() => { if (user) { saveToStorage(STORAGE_KEYS.USER, user); setLastSaved(new Date()); } }, [user]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.ACTIVITIES, activities); }, [activities]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.HEATMAP, heatmapData); }, [heatmapData]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.GOALS, goals); }, [goals]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.DSA_TOPICS, dsaTopics); }, [dsaTopics]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.AI_MODULES, aiModules); }, [aiModules]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.WORKOUTS, workouts); }, [workouts]);

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

    const updateSettings = async (settings) => {
        setUser(prev => ({ ...prev, settings: { ...prev.settings, ...settings } }));
        showNotification('Settings saved!', 'success');
    };

    const refreshData = async () => { };

    // Reset ALL data to defaults
    const resetAll = () => {
        // Clear all localStorage
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));

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
    };

    const value = {
        // State
        user, activities, heatmapData, goals, dsaTopics, aiModules, workouts,
        loading, lastSaved, notification, useLocalStorage,
        // Activity
        logActivity,
        // Goals
        addGoal, editGoal, toggleGoal, deleteGoal,
        // DSA
        addDsaTopic, editDsaTopic, deleteDsaTopic, addDsaSubtopic, toggleDsaSubtopic, deleteDsaSubtopic,
        // AI
        addAiModule, editAiModule, deleteAiModule, addAiLesson, toggleAiLesson, completeAiModule,
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

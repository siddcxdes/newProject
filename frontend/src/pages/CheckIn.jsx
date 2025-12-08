import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// IST helpers
const getISTDateString = () => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + IST_OFFSET);
    return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}`;
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const CheckIn = () => {
    const { user, logActivity, dsaTopics, aiModules, toggleDsaSubtopic, toggleAiLesson, dailyTasks, setDailyTasks } = useApp();
    const todayStr = getISTDateString();

    const [dsaTasks, setDsaTasks] = useState([]);
    const [aiTasks, setAiTasks] = useState([]);
    const [otherTasks, setOtherTasks] = useState([]);

    const [newDsaTask, setNewDsaTask] = useState('');
    const [newAiTask, setNewAiTask] = useState('');
    const [newOtherTask, setNewOtherTask] = useState('');

    const [dsaDifficulty, setDsaDifficulty] = useState('medium');

    // For academic picker dropdowns
    const [showDsaPicker, setShowDsaPicker] = useState(false);
    const [showAiPicker, setShowAiPicker] = useState(false);
    const [selectedDsaTopic, setSelectedDsaTopic] = useState(null);
    const [selectedAiModule, setSelectedAiModule] = useState(null);

    // Get uncompleted subtopics from a DSA topic
    const getUncompletedDsaProblems = (topicId) => {
        const topic = dsaTopics.find(t => t.id === topicId);
        if (!topic) return [];
        return topic.subtopics.filter(s => !s.completed);
    };

    // Get uncompleted lessons from an AI module
    const getUncompletedAiLessons = (moduleId) => {
        const module = aiModules.find(m => m.id === moduleId);
        if (!module) return [];
        return module.lessons.filter(l => !l.completed);
    };

    // Get all uncompleted DSA problems across all topics
    const getAllUncompletedDsaProblems = () => {
        return dsaTopics.flatMap(topic =>
            topic.subtopics
                .filter(s => !s.completed)
                .map(s => ({ ...s, topicId: topic.id, topicName: topic.name, topicIcon: topic.icon }))
        );
    };

    // Get all uncompleted AI lessons across all modules
    const getAllUncompletedAiLessons = () => {
        return aiModules.flatMap(module =>
            module.lessons
                .filter(l => !l.completed)
                .map(l => ({ ...l, moduleId: module.id, moduleName: module.name, moduleIcon: module.icon }))
        );
    };

    // Load tasks from AppContext (synced across devices)
    useEffect(() => {
        const todayData = dailyTasks[todayStr] || {};
        setDsaTasks(todayData.dsa || []);
        setAiTasks(todayData.ai || []);
        setOtherTasks(todayData.other || []);
    }, [dailyTasks, todayStr]);

    // Save functions - update AppContext which syncs to backend
    const saveDsaTasks = (tasks) => {
        setDsaTasks(tasks);
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: { ...prev[todayStr], dsa: tasks }
        }));
    };
    const saveAiTasks = (tasks) => {
        setAiTasks(tasks);
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: { ...prev[todayStr], ai: tasks }
        }));
    };
    const saveOtherTasks = (tasks) => {
        setOtherTasks(tasks);
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: { ...prev[todayStr], other: tasks }
        }));
    };

    // Manual add DSA task
    const addDsaTask = () => {
        if (!newDsaTask.trim()) return;
        saveDsaTasks([...dsaTasks, { id: Date.now(), text: newDsaTask.trim(), difficulty: dsaDifficulty, completed: false, isManual: true }]);
        setNewDsaTask('');
    };

    // Add DSA task from Academic section
    const addDsaFromAcademic = (problem, topicId) => {
        // Check if already added today
        if (dsaTasks.some(t => t.academicId === problem.id)) return;
        saveDsaTasks([...dsaTasks, {
            id: Date.now(),
            text: problem.name,
            difficulty: problem.difficulty,
            completed: false,
            isManual: false,
            academicId: problem.id,
            topicId: topicId
        }]);
        setShowDsaPicker(false);
        setSelectedDsaTopic(null);
    };

    // Manual add AI task
    const addAiTask = () => {
        if (!newAiTask.trim()) return;
        saveAiTasks([...aiTasks, { id: Date.now(), text: newAiTask.trim(), completed: false, isManual: true }]);
        setNewAiTask('');
    };

    // Add AI task from Academic section
    const addAiFromAcademic = (lesson, moduleId) => {
        // Check if already added today
        if (aiTasks.some(t => t.academicId === lesson.id)) return;
        saveAiTasks([...aiTasks, {
            id: Date.now(),
            text: lesson.name,
            completed: false,
            isManual: false,
            academicId: lesson.id,
            moduleId: moduleId
        }]);
        setShowAiPicker(false);
        setSelectedAiModule(null);
    };

    const addOtherTask = () => {
        if (!newOtherTask.trim()) return;
        saveOtherTasks([...otherTasks, { id: Date.now(), text: newOtherTask.trim(), completed: false }]);
        setNewOtherTask('');
    };

    const toggleDsaTask = async (id) => {
        const task = dsaTasks.find(t => t.id === id);
        if (!task || task.completed) return;
        saveDsaTasks(dsaTasks.map(t => t.id === id ? { ...t, completed: true } : t));

        // If it's from Academic section, also mark it as completed there
        if (!task.isManual && task.topicId && task.academicId) {
            toggleDsaSubtopic(task.topicId, task.academicId);
        } else {
            // For manual tasks, just log activity
            await logActivity('dsa', { difficulty: task.difficulty });
        }
    };

    const toggleAiTask = async (id) => {
        const task = aiTasks.find(t => t.id === id);
        if (!task || task.completed) return;
        saveAiTasks(aiTasks.map(t => t.id === id ? { ...t, completed: true } : t));

        // If it's from Academic section, also mark it as completed there
        if (!task.isManual && task.moduleId && task.academicId) {
            toggleAiLesson(task.moduleId, task.academicId);
        } else {
            // For manual tasks, just log activity
            await logActivity('ai');
        }
    };

    const toggleOtherTask = async (id) => {
        const task = otherTasks.find(t => t.id === id);
        if (!task || task.completed) return;
        saveOtherTasks(otherTasks.map(t => t.id === id ? { ...t, completed: true } : t));
        await logActivity('personal');
    };

    const deleteDsaTask = (id) => saveDsaTasks(dsaTasks.filter(t => t.id !== id));
    const deleteAiTask = (id) => saveAiTasks(aiTasks.filter(t => t.id !== id));
    const deleteOtherTask = (id) => saveOtherTasks(otherTasks.filter(t => t.id !== id));

    const totalTasks = dsaTasks.length + aiTasks.length + otherTasks.length;
    const completedTasks = dsaTasks.filter(t => t.completed).length + aiTasks.filter(t => t.completed).length + otherTasks.filter(t => t.completed).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const getXp = (difficulty) => difficulty === 'easy' ? 10 : difficulty === 'hard' ? 50 : 25;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.picker-container')) {
                setShowDsaPicker(false);
                setShowAiPicker(false);
                setSelectedDsaTopic(null);
                setSelectedAiModule(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-white mb-0.5 sm:mb-1">Daily Check-In</h1>
                    <p className="text-xs sm:text-sm text-zinc-500">{formatDate(todayStr)} · IST</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold font-mono text-amber-400">{user?.streak?.current || 0}</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-600 uppercase">Streak</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold font-mono text-violet-400">{user?.xp || 0}</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-600 uppercase">XP</p>
                    </div>
                </div>
            </div>

            {/* Progress */}
            {totalTasks > 0 && (
                <div className="glass-card p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-zinc-400">{completedTasks}/{totalTasks} done</span>
                        {progress === 100 && <span className="text-[10px] sm:text-xs font-semibold text-emerald-400">Complete!</span>}
                    </div>
                    <div className="h-1.5 sm:h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* DSA & AI Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {/* DSA Box */}
                <div className="glass-card p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-500"></div>
                        <h3 className="text-sm sm:text-base font-semibold text-white">DSA Problems</h3>
                        <span className="text-[10px] sm:text-xs text-zinc-600 ml-auto">{dsaTasks.filter(t => t.completed).length}/{dsaTasks.length}</span>
                    </div>

                    {/* Academic Picker + Manual Add */}
                    <div className="flex gap-1.5 sm:gap-2 mb-3">
                        {/* Academic Picker Button */}
                        <div className="relative picker-container flex-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowDsaPicker(!showDsaPicker); setShowAiPicker(false); }}
                                className="w-full input-field text-xs sm:text-sm py-2 text-left flex items-center gap-2"
                            >
                                <span className="text-violet-400">📚</span>
                                <span className="text-zinc-400 truncate">Pick from Academic...</span>
                            </button>

                            {/* DSA Topic/Problem Picker Dropdown */}
                            {showDsaPicker && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f0f0f] border border-[#222] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                                    {selectedDsaTopic === null ? (
                                        // Show topics
                                        <div className="p-2">
                                            <p className="text-[10px] text-zinc-500 uppercase px-2 py-1 mb-1">Select Topic</p>
                                            {dsaTopics.filter(t => t.subtopics.some(s => !s.completed)).map(topic => (
                                                <button
                                                    key={topic.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedDsaTopic(topic.id); }}
                                                    className="w-full text-left px-3 py-2 hover:bg-[#1a1a1a] rounded-lg flex items-center gap-2"
                                                >
                                                    <span>{topic.icon}</span>
                                                    <span className="text-sm text-white flex-1 truncate">{topic.name}</span>
                                                    <span className="text-[10px] text-zinc-500">{getUncompletedDsaProblems(topic.id).length} left</span>
                                                </button>
                                            ))}
                                            {dsaTopics.filter(t => t.subtopics.some(s => !s.completed)).length === 0 && (
                                                <p className="text-center text-zinc-500 text-xs py-3">All problems completed! 🎉</p>
                                            )}
                                        </div>
                                    ) : (
                                        // Show problems from selected topic
                                        <div className="p-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedDsaTopic(null); }}
                                                className="text-[10px] text-violet-400 hover:text-violet-300 px-2 py-1 mb-1 flex items-center gap-1"
                                            >
                                                ← Back to topics
                                            </button>
                                            {getUncompletedDsaProblems(selectedDsaTopic).map(problem => (
                                                <button
                                                    key={problem.id}
                                                    onClick={(e) => { e.stopPropagation(); addDsaFromAcademic(problem, selectedDsaTopic); }}
                                                    disabled={dsaTasks.some(t => t.academicId === problem.id)}
                                                    className="w-full text-left px-3 py-2 hover:bg-[#1a1a1a] rounded-lg flex items-center gap-2 disabled:opacity-40"
                                                >
                                                    <span className="text-sm text-white flex-1 truncate">{problem.name}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${problem.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                                                        problem.difficulty === 'hard' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                                                        }`}>{problem.difficulty}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Add Row */}
                    <div className="flex gap-1.5 sm:gap-2 mb-3">
                        <input
                            type="text"
                            value={newDsaTask}
                            onChange={(e) => setNewDsaTask(e.target.value)}
                            placeholder="Or type manually..."
                            className="input-field flex-1 text-xs sm:text-sm py-2"
                            onKeyDown={(e) => e.key === 'Enter' && addDsaTask()}
                        />
                        <select
                            value={dsaDifficulty}
                            onChange={(e) => setDsaDifficulty(e.target.value)}
                            className="input-field w-16 sm:w-20 text-[10px] sm:text-xs py-2"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Med</option>
                            <option value="hard">Hard</option>
                        </select>
                        <button onClick={addDsaTask} className="px-2.5 sm:px-3 py-2 bg-violet-500 text-white rounded-lg text-xs font-semibold hover:bg-violet-600">+</button>
                    </div>

                    <div className="space-y-1.5 max-h-48 sm:max-h-64 overflow-y-auto">
                        {dsaTasks.length === 0 ? (
                            <p className="text-center text-zinc-600 text-xs py-4 sm:py-6">No problems added</p>
                        ) : (
                            dsaTasks.map((task) => (
                                <div key={task.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg group ${task.completed ? 'bg-emerald-500/5' : 'bg-[#0a0a0a]'}`}>
                                    <button
                                        onClick={() => toggleDsaTask(task.id)}
                                        disabled={task.completed}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] ${task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-zinc-700'}`}
                                    >
                                        {task.completed && '✓'}
                                    </button>
                                    <span className={`flex-1 text-xs sm:text-sm truncate ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                        {!task.isManual && <span className="text-violet-400 mr-1">📚</span>}
                                        {task.text}
                                    </span>
                                    <span className={`text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-semibold hidden sm:inline ${task.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                                        task.difficulty === 'hard' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                                        }`}>{task.difficulty === 'medium' ? 'M' : task.difficulty[0].toUpperCase()}</span>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-600">+{getXp(task.difficulty)}</span>
                                    <button onClick={() => deleteDsaTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-sm">×</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* AI Box */}
                <div className="glass-card p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500"></div>
                        <h3 className="text-sm sm:text-base font-semibold text-white">AI/ML Topics</h3>
                        <span className="text-[10px] sm:text-xs text-zinc-600 ml-auto">{aiTasks.filter(t => t.completed).length}/{aiTasks.length}</span>
                    </div>

                    {/* Academic Picker + Manual Add */}
                    <div className="flex gap-1.5 sm:gap-2 mb-3">
                        {/* Academic Picker Button */}
                        <div className="relative picker-container flex-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowAiPicker(!showAiPicker); setShowDsaPicker(false); }}
                                className="w-full input-field text-xs sm:text-sm py-2 text-left flex items-center gap-2"
                            >
                                <span className="text-emerald-400">📚</span>
                                <span className="text-zinc-400 truncate">Pick from Academic...</span>
                            </button>

                            {/* AI Module/Lesson Picker Dropdown */}
                            {showAiPicker && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f0f0f] border border-[#222] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                                    {selectedAiModule === null ? (
                                        // Show modules
                                        <div className="p-2">
                                            <p className="text-[10px] text-zinc-500 uppercase px-2 py-1 mb-1">Select Module</p>
                                            {aiModules.filter(m => m.lessons.some(l => !l.completed)).map(module => (
                                                <button
                                                    key={module.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAiModule(module.id); }}
                                                    className="w-full text-left px-3 py-2 hover:bg-[#1a1a1a] rounded-lg flex items-center gap-2"
                                                >
                                                    <span>{module.icon}</span>
                                                    <span className="text-sm text-white flex-1 truncate">{module.name}</span>
                                                    <span className="text-[10px] text-zinc-500">{getUncompletedAiLessons(module.id).length} left</span>
                                                </button>
                                            ))}
                                            {aiModules.filter(m => m.lessons.some(l => !l.completed)).length === 0 && (
                                                <p className="text-center text-zinc-500 text-xs py-3">All lessons completed! 🎉</p>
                                            )}
                                        </div>
                                    ) : (
                                        // Show lessons from selected module
                                        <div className="p-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedAiModule(null); }}
                                                className="text-[10px] text-emerald-400 hover:text-emerald-300 px-2 py-1 mb-1 flex items-center gap-1"
                                            >
                                                ← Back to modules
                                            </button>
                                            {getUncompletedAiLessons(selectedAiModule).map(lesson => (
                                                <button
                                                    key={lesson.id}
                                                    onClick={(e) => { e.stopPropagation(); addAiFromAcademic(lesson, selectedAiModule); }}
                                                    disabled={aiTasks.some(t => t.academicId === lesson.id)}
                                                    className="w-full text-left px-3 py-2 hover:bg-[#1a1a1a] rounded-lg flex items-center gap-2 disabled:opacity-40"
                                                >
                                                    <span className="text-sm text-white flex-1 truncate">{lesson.name}</span>
                                                    <span className="text-[9px] text-zinc-500">+30 XP</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Add Row */}
                    <div className="flex gap-1.5 sm:gap-2 mb-3">
                        <input
                            type="text"
                            value={newAiTask}
                            onChange={(e) => setNewAiTask(e.target.value)}
                            placeholder="Or type manually..."
                            className="input-field flex-1 text-xs sm:text-sm py-2"
                            onKeyDown={(e) => e.key === 'Enter' && addAiTask()}
                        />
                        <button onClick={addAiTask} className="px-2.5 sm:px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600">+</button>
                    </div>

                    <div className="space-y-1.5 max-h-48 sm:max-h-64 overflow-y-auto">
                        {aiTasks.length === 0 ? (
                            <p className="text-center text-zinc-600 text-xs py-4 sm:py-6">No topics added</p>
                        ) : (
                            aiTasks.map((task) => (
                                <div key={task.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg group ${task.completed ? 'bg-emerald-500/5' : 'bg-[#0a0a0a]'}`}>
                                    <button
                                        onClick={() => toggleAiTask(task.id)}
                                        disabled={task.completed}
                                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] ${task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-zinc-700'}`}
                                    >
                                        {task.completed && '✓'}
                                    </button>
                                    <span className={`flex-1 text-xs sm:text-sm truncate ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                        {!task.isManual && <span className="text-emerald-400 mr-1">📚</span>}
                                        {task.text}
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-600">+30</span>
                                    <button onClick={() => deleteAiTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-sm">×</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Other Tasks */}
            <div className="glass-card p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500"></div>
                    <h3 className="text-sm sm:text-base font-semibold text-white">Other Tasks</h3>
                    <span className="text-[10px] sm:text-xs text-zinc-500 ml-1 hidden sm:inline">Gym, Goals...</span>
                    <span className="text-[10px] sm:text-xs text-zinc-600 ml-auto">{otherTasks.filter(t => t.completed).length}/{otherTasks.length}</span>
                </div>

                <div className="flex gap-1.5 sm:gap-2 mb-3">
                    <input
                        type="text"
                        value={newOtherTask}
                        onChange={(e) => setNewOtherTask(e.target.value)}
                        placeholder="Add task..."
                        className="input-field flex-1 text-xs sm:text-sm py-2"
                        onKeyDown={(e) => e.key === 'Enter' && addOtherTask()}
                    />
                    <button onClick={addOtherTask} className="px-2.5 sm:px-3 py-2 bg-pink-500 text-white rounded-lg text-xs font-semibold hover:bg-pink-600">+</button>
                </div>

                <div className="space-y-1.5 max-h-36 sm:max-h-48 overflow-y-auto">
                    {otherTasks.length === 0 ? (
                        <p className="text-center text-zinc-600 text-xs py-4 sm:py-6">No tasks added</p>
                    ) : (
                        otherTasks.map((task) => (
                            <div key={task.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg group ${task.completed ? 'bg-emerald-500/5' : 'bg-[#0a0a0a]'}`}>
                                <button
                                    onClick={() => toggleOtherTask(task.id)}
                                    disabled={task.completed}
                                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center flex-shrink-0 text-[10px] ${task.completed ? 'bg-emerald-500 text-white' : 'border-2 border-zinc-700'}`}
                                >
                                    {task.completed && '✓'}
                                </button>
                                <span className={`flex-1 text-xs sm:text-sm truncate ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{task.text}</span>
                                <span className="text-[9px] sm:text-[10px] font-mono text-zinc-600">+10</span>
                                <button onClick={() => deleteOtherTask(task.id)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 text-sm">×</button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckIn;

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

// Domain Task Box Component
const DomainTaskBox = ({ domain, todayStr, dailyTasks, setDailyTasks, toggleDomainItem, logActivity }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [manualTask, setManualTask] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [difficulty, setDifficulty] = useState('medium');

    const domainTasks = dailyTasks[todayStr]?.[domain.id] || [];
    const completedCount = domainTasks.filter(t => t.completed).length;
    const uncompletedItems = domain.topics?.flatMap(topic =>
        (topic.items || [])
            .filter(item => !item.completed)
            .map(item => ({ ...item, topicId: topic.id, topicName: topic.name }))
    ) || [];

    // Debug: Log domain data to see what's available
    console.log(`📋 Domain "${domain.shortName}" data:`, {
        domainId: domain.id,
        topicsCount: domain.topics?.length || 0,
        topics: domain.topics?.map(t => ({ name: t.name, itemsCount: t.items?.length || 0 })),
        uncompletedItems: uncompletedItems.length
    });

    const colorClass = {
        violet: { dot: 'bg-sky-500', btn: 'bg-sky-500 hover:bg-sky-600', text: 'text-sky-400' },
        emerald: { dot: 'bg-emerald-500', btn: 'bg-emerald-500 hover:bg-emerald-600', text: 'text-emerald-400' },
        blue: { dot: 'bg-blue-500', btn: 'bg-blue-500 hover:bg-blue-600', text: 'text-blue-400' },
        amber: { dot: 'bg-amber-500', btn: 'bg-amber-500 hover:bg-amber-600', text: 'text-amber-400' },
        pink: { dot: 'bg-pink-500', btn: 'bg-pink-500 hover:bg-pink-600', text: 'text-pink-400' },
        cyan: { dot: 'bg-cyan-500', btn: 'bg-cyan-500 hover:bg-cyan-600', text: 'text-cyan-400' },
    }[domain.color] || { dot: 'bg-zinc-500', btn: 'bg-zinc-500 hover:bg-zinc-600', text: 'text-zinc-400' };

    const addFromAcademic = (item) => {
        const existingTasks = dailyTasks[todayStr]?.[domain.id] || [];
        if (existingTasks.some(t => t.academicId === item.id)) return;

        // Construct scheduledTime if provided
        let taskScheduledTime = undefined;
        if (scheduledTime) {
            taskScheduledTime = `${todayStr}T${scheduledTime}:00`;
        }

        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                [domain.id]: [...existingTasks, {
                    id: Date.now(),
                    text: item.name,
                    completed: false,
                    academicId: item.id,
                    topicId: item.topicId,
                    difficulty: item.difficulty,
                    scheduledTime: taskScheduledTime
                }]
            }
        }));
        setShowPicker(false);
        setSelectedTopic(null);
        setScheduledTime(''); // Clear time after adding
    };

    const addManualTask = () => {
        if (!manualTask.trim()) return;
        const existingTasks = dailyTasks[todayStr]?.[domain.id] || [];

        // Construct scheduledTime if provided
        let taskScheduledTime = undefined;
        if (scheduledTime) {
            // Combine today's date with the time
            // scheduledTime is HH:mm
            taskScheduledTime = `${todayStr}T${scheduledTime}:00`;
        }

        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                [domain.id]: [...existingTasks, {
                    id: Date.now(),
                    text: manualTask.trim(),
                    completed: false,
                    isManual: true,
                    difficulty: domain.type === 'problem-based' ? difficulty : undefined,
                    scheduledTime: taskScheduledTime
                }]
            }
        }));
        setManualTask('');
        setScheduledTime('');
    };

    const toggleTask = (task) => {
        if (task.completed) return;
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                [domain.id]: (prev[todayStr]?.[domain.id] || []).map(t =>
                    t.id === task.id ? { ...t, completed: true } : t
                )
            }
        }));
        if (task.topicId && task.academicId) {
            toggleDomainItem(domain.id, task.topicId, task.academicId);
        } else {
            logActivity(domain.id, task.difficulty ? { difficulty: task.difficulty } : {});
        }
    };

    const deleteTask = (taskId) => {
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                [domain.id]: (prev[todayStr]?.[domain.id] || []).filter(t => t.id !== taskId)
            }
        }));
    };

    const getXp = (diff) => diff === 'easy' ? 10 : diff === 'hard' ? 50 : 25;

    return (
        <div className="glass-card p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${colorClass.dot}`}></div>
                <h3 className="text-sm sm:text-base font-semibold text-heading">{domain.shortName || domain.name}</h3>
                <span className="text-[10px] sm:text-xs text-zinc-600 ml-auto">{completedCount}/{domainTasks.length}</span>
            </div>

            {/* Pick from Academic */}
            <div className="flex gap-1.5 sm:gap-2 mb-2">
                <div className="relative picker-container flex-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowPicker(!showPicker); }}
                        className={`w-full input-field text-xs sm:text-sm py-2 text-left flex items-center gap-2`}
                    >
                        <svg className={`w-4 h-4 ${colorClass.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        <span className="text-zinc-400 truncate">Select topic...</span>
                        <svg className="w-4 h-4 text-zinc-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {showPicker && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-elevated border border-subtle rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                            {selectedTopic === null ? (
                                <div className="p-2">
                                    <p className="text-[10px] text-zinc-500 uppercase px-2 py-1 mb-1">Select Topic</p>
                                    {domain.topics?.filter(t => t.items?.some(i => !i.completed)).length > 0 ? (
                                        domain.topics.filter(t => t.items?.some(i => !i.completed)).map(topic => (
                                            <button
                                                key={topic.id}
                                                onClick={(e) => { e.stopPropagation(); setSelectedTopic(topic.id); }}
                                                className="w-full text-left px-3 py-2 hover:bg-elevated rounded-lg flex items-center gap-2"
                                            >
                                                <span className="text-sm text-heading flex-1 truncate">{topic.name}</span>
                                                <span className="text-[10px] text-zinc-500">{topic.items?.filter(i => !i.completed).length} left</span>
                                                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-center text-zinc-500 text-xs py-3">No items available</p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedTopic(null); }}
                                        className={`text-[10px] ${colorClass.text} hover:opacity-80 px-2 py-1 mb-1 flex items-center gap-1`}
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                                        Back
                                    </button>
                                    {domain.topics?.find(t => t.id === selectedTopic)?.items?.filter(i => !i.completed).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={(e) => { e.stopPropagation(); addFromAcademic({ ...item, topicId: selectedTopic }); }}
                                            disabled={domainTasks.some(t => t.academicId === item.id)}
                                            className="w-full text-left px-3 py-2 hover:bg-elevated rounded-lg flex items-center gap-2 disabled:opacity-40"
                                        >
                                            <span className="text-sm text-heading flex-1 truncate">{item.name}</span>
                                            {item.difficulty && (
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${item.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                                                    item.difficulty === 'hard' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                                                    }`}>{item.difficulty}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Time Picker for Academic Selection */}
                <input
                    type="time"
                    value={scheduledTime} // Shared state with manual input
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="input-field w-20 text-xs py-2 px-1 text-center"
                    title="Schedule task"
                />
            </div>

            {/* Manual Add Row */}
            <div className="flex gap-1.5 sm:gap-2 mb-3">
                <input
                    type="text"
                    value={manualTask}
                    onChange={(e) => setManualTask(e.target.value)}
                    placeholder="Add manual task..."
                    className="input-field flex-1 text-xs sm:text-sm py-2"
                    onKeyDown={(e) => e.key === 'Enter' && addManualTask()}
                />

                {domain.type === 'problem-based' && (
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="input-field w-20 text-xs py-2"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                )}
                <button onClick={addManualTask} className={`px-3 py-2 ${colorClass.btn} text-heading rounded-lg text-xs font-semibold`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-1.5 max-h-48 sm:max-h-64 overflow-y-auto">
                {domainTasks.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-subtle rounded-xl">
                        <p className="text-zinc-500 text-xs">No tasks for today</p>
                    </div>
                ) : (
                    domainTasks.map((task) => (
                        <div key={task.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg group transition-all ${task.completed ? 'bg-emerald-500/5' : 'bg-elevated hover:border-zinc-600 border border-transparent'}`}>
                            <button
                                onClick={() => toggleTask(task)}
                                disabled={task.completed}
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs transition-colors ${task.completed ? 'bg-emerald-500 text-heading' : 'border-2 border-zinc-600 hover:border-zinc-400'}`}
                            >
                                {task.completed && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                            <span className={`flex-1 text-xs sm:text-sm truncate flex items-center gap-2 ${task.completed ? 'text-zinc-500 line-through' : 'text-heading'}`}>
                                {!task.isManual && <svg className={`w-3.5 h-3.5 ${colorClass.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                                {task.text}
                                {task.scheduledTime && (
                                    <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono bg-elevated px-1.5 py-0.5 rounded border border-subtle">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {new Date(task.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </span>
                            {task.difficulty && (
                                <span className={`text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${task.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                    task.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                    }`}>{task.difficulty}</span>
                            )}
                            <span className="text-[10px] font-mono text-zinc-500 bg-elevated px-1.5 py-0.5 rounded">
                                +{domain.type === 'problem-based' ? getXp(task.difficulty) : (typeof domain.xpPerItem === 'number' ? domain.xpPerItem : 30)}
                            </span>
                            <button onClick={() => deleteTask(task.id)} className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const CheckIn = () => {
    const { user, logActivity, dailyTasks, setDailyTasks, learningDomains, toggleDomainItem } = useApp();
    const todayStr = getISTDateString();

    const [otherTasks, setOtherTasks] = useState([]);
    const [newOtherTask, setNewOtherTask] = useState('');
    const [otherTaskTime, setOtherTaskTime] = useState('');

    // Load other tasks from AppContext
    useEffect(() => {
        const todayData = dailyTasks[todayStr] || {};
        setOtherTasks(todayData.other || []);
    }, [dailyTasks, todayStr]);

    // Save other tasks
    const saveOtherTasks = (tasks) => {
        setOtherTasks(tasks);
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: { ...prev[todayStr], other: tasks }
        }));
    };

    const addOtherTask = () => {
        if (!newOtherTask.trim()) return;

        let taskScheduledTime = undefined;
        if (otherTaskTime) {
            taskScheduledTime = `${todayStr}T${otherTaskTime}:00`;
        }

        saveOtherTasks([...otherTasks, {
            id: Date.now(),
            text: newOtherTask.trim(),
            completed: false,
            scheduledTime: taskScheduledTime
        }]);
        setNewOtherTask('');
        setOtherTaskTime('');
    };

    const toggleOtherTask = async (id) => {
        const task = otherTasks.find(t => t.id === id);
        if (!task || task.completed) return;
        saveOtherTasks(otherTasks.map(t => t.id === id ? { ...t, completed: true } : t));
        await logActivity('personal');
    };

    const deleteOtherTask = (id) => saveOtherTasks(otherTasks.filter(t => t.id !== id));

    // Calculate totals from all domains + other tasks
    const checkInDomains = learningDomains.filter((domain) => domain.showInCheckIn !== false);

    const domainTaskCounts = checkInDomains.reduce((acc, domain) => {
        const tasks = dailyTasks[todayStr]?.[domain.id] || [];
        return {
            total: acc.total + tasks.length,
            completed: acc.completed + tasks.filter(t => t.completed).length
        };
    }, { total: 0, completed: 0 });

    const totalTasks = domainTaskCounts.total + otherTasks.length;
    const completedTasks = domainTaskCounts.completed + otherTasks.filter(t => t.completed).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.picker-container')) {
                // Handled by individual DomainTaskBox components
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
                    <h1 className="text-xl sm:text-2xl font-semibold text-heading mb-0.5 sm:mb-1">Daily Check-In</h1>
                    <p className="text-xs sm:text-sm text-zinc-500">{formatDate(todayStr)} · IST</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold font-mono text-amber-400">{user?.streak?.current || 0}</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-600 uppercase">Streak</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold font-mono text-sky-400">{user?.xp || 0}</p>
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
                    <div className="h-1.5 sm:h-2 bg-elevated rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Dynamic Learning Domain Task Boxes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {learningDomains
                    .filter((domain) => domain.showInCheckIn !== false)
                    .map((domain) => (
                        <DomainTaskBox
                            key={domain.id}
                            domain={domain}
                            todayStr={todayStr}
                            dailyTasks={dailyTasks}
                            setDailyTasks={setDailyTasks}
                            toggleDomainItem={toggleDomainItem}
                            logActivity={logActivity}
                        />
                    ))}
            </div>

            {/* Other Tasks */}
            <div className="glass-card p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-500"></div>
                    <h3 className="text-sm sm:text-base font-semibold text-heading">Other Tasks</h3>
                    <span className="text-[10px] sm:text-xs text-zinc-600 ml-auto">{otherTasks.filter(t => t.completed).length}/{otherTasks.length}</span>
                </div>

                <div className="flex gap-1.5 sm:gap-2 mb-3">
                    <input
                        type="text"
                        value={newOtherTask}
                        onChange={(e) => setNewOtherTask(e.target.value)}
                        placeholder="Add generic task..."
                        className="input-field flex-1 text-xs sm:text-sm py-2"
                        onKeyDown={(e) => e.key === 'Enter' && addOtherTask()}
                    />
                    <input
                        type="time"
                        value={otherTaskTime}
                        onChange={(e) => setOtherTaskTime(e.target.value)}
                        className="input-field w-20 text-xs py-2 px-1 text-center"
                        title="Schedule this task"
                    />
                    <button onClick={addOtherTask} className="px-3 py-2 bg-pink-500 text-heading rounded-lg text-xs font-semibold hover:bg-pink-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>

                <div className="space-y-1.5 max-h-36 sm:max-h-48 overflow-y-auto">
                    {otherTasks.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-subtle rounded-xl">
                            <p className="text-zinc-500 text-xs">No generic tasks added</p>
                        </div>
                    ) : (
                        otherTasks.map((task) => (
                            <div key={task.id} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg group transition-all ${task.completed ? 'bg-emerald-500/5' : 'bg-elevated hover:border-zinc-600 border border-transparent'}`}>
                                <button
                                    onClick={() => toggleOtherTask(task.id)}
                                    disabled={task.completed}
                                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 text-xs transition-colors ${task.completed ? 'bg-emerald-500 text-heading' : 'border-2 border-zinc-600 hover:border-zinc-400'}`}
                                >
                                    {task.completed && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <span className={`flex-1 text-xs sm:text-sm truncate flex items-center gap-2 ${task.completed ? 'text-zinc-500 line-through' : 'text-heading'}`}>
                                    {task.text}
                                    {task.scheduledTime && (
                                        <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono bg-elevated px-1.5 py-0.5 rounded border border-subtle">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            {new Date(task.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500 bg-elevated px-1.5 py-0.5 rounded">+10</span>
                                <button onClick={() => deleteOtherTask(task.id)} className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckIn;

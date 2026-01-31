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

const getISTTime = () => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + IST_OFFSET);
    return {
        hours: istDate.getHours(),
        minutes: istDate.getMinutes(),
        timeString: `${String(istDate.getHours()).padStart(2, '0')}:${String(istDate.getMinutes()).padStart(2, '0')}`
    };
};

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

// Get task status based on time
const getTaskStatus = (task, currentTime) => {
    if (task.completed) return 'completed';
    if (!task.deadline) return 'no-deadline';

    const now = currentTime.hours * 60 + currentTime.minutes;
    const deadline = task.deadline.hours * 60 + task.deadline.minutes;

    if (now > deadline) return 'overdue';
    if (now >= deadline - 30) return 'due-soon';
    return 'pending';
};

// Calculate points based on completion time
const calculatePoints = (task, currentTime) => {
    if (!task.deadline) return task.points || 10;

    const now = currentTime.hours * 60 + currentTime.minutes;
    const deadline = task.deadline.hours * 60 + task.deadline.minutes;

    if (now <= deadline) {
        return task.points || 20;
    } else {
        return -(task.points || 10);
    }
};

const CheckIn = () => {
    const { user, dailyTasks, setDailyTasks, points, setPoints, showNotification, learningDomains } = useApp();
    const todayStr = getISTDateString();
    const [currentTime, setCurrentTime] = useState(getISTTime());

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(getISTTime());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    // Initialize today's tasks if not exists
    useEffect(() => {
        if (!dailyTasks[todayStr]) {
            setDailyTasks(prev => ({ ...prev, [todayStr]: { domains: {}, other: [] } }));
        }
    }, [todayStr]);

    // Calculate stats
    const checkInDomains = learningDomains.filter(d => d.showInCheckIn !== false);
    const allDomainTasks = checkInDomains.flatMap(domain =>
        dailyTasks[todayStr]?.domains?.[domain.id] || []
    );
    const otherTasks = dailyTasks[todayStr]?.other || [];
    const allTasks = [...allDomainTasks, ...otherTasks];
    const completedCount = allTasks.filter(t => t.completed).length;
    const totalTasks = allTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl">
            {/* Header Section */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-heading tracking-tight mb-1">Daily Check-In</h1>
                    <p className="text-sm text-zinc-500 font-medium">{formatDate(todayStr)} · IST {currentTime.timeString}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">Points</p>
                        <p className="text-2xl font-bold text-heading tabular-nums">{points}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">Streak</p>
                        <p className="text-2xl font-bold text-heading tabular-nums">{user?.streak?.current || 0}</p>
                    </div>
                </div>
            </div>

            {/* Progress Overview */}
            {totalTasks > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-sm font-semibold text-heading">{completedCount}/{totalTasks} completed</p>
                            <p className="text-xs text-zinc-600 mt-0.5">{completionRate}% completion rate</p>
                        </div>
                        {completedCount === totalTasks && totalTasks > 0 && (
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                                All Complete
                            </span>
                        )}
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${completionRate}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Domain Sections */}
            <div className="space-y-4">
                {checkInDomains.map(domain => (
                    <DomainSection
                        key={domain.id}
                        domain={domain}
                        todayStr={todayStr}
                        dailyTasks={dailyTasks}
                        setDailyTasks={setDailyTasks}
                        currentTime={currentTime}
                        points={points}
                        setPoints={setPoints}
                        showNotification={showNotification}
                    />
                ))}
            </div>

            {/* Other Tasks */}
            <OtherTasksSection
                todayStr={todayStr}
                dailyTasks={dailyTasks}
                setDailyTasks={setDailyTasks}
                currentTime={currentTime}
                points={points}
                setPoints={setPoints}
                showNotification={showNotification}
            />
        </div>
    );
};

// Domain Section Component
const DomainSection = ({ domain, todayStr, dailyTasks, setDailyTasks, currentTime, points, setPoints, showNotification }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [taskMode, setTaskMode] = useState('manual'); // 'manual' or 'pick'
    const [newTask, setNewTask] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [hours, setHours] = useState('23');
    const [minutes, setMinutes] = useState('59');
    const [taskPoints, setTaskPoints] = useState('20');

    const domainTasks = dailyTasks[todayStr]?.domains?.[domain.id] || [];
    const completedCount = domainTasks.filter(t => t.completed).length;

    const addTask = () => {
        let taskText = '';

        if (taskMode === 'manual') {
            if (!newTask.trim()) return;
            taskText = newTask.trim();
        } else if (taskMode === 'pick') {
            if (!selectedItem) return;
            const topic = domain.topics?.find(t => t.id.toString() === selectedTopic);
            const item = topic?.items?.find(i => i.id.toString() === selectedItem);
            if (!item) return;
            taskText = item.name;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            deadline: { hours: parseInt(hours), minutes: parseInt(minutes) },
            points: parseInt(taskPoints) || 20,
            createdAt: new Date().toISOString()
        };

        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                domains: {
                    ...prev[todayStr]?.domains,
                    [domain.id]: [...(prev[todayStr]?.domains?.[domain.id] || []), task]
                }
            }
        }));

        setNewTask('');
        setSelectedTopic('');
        setSelectedItem('');
        setShowAdd(false);
    };

    const completeTask = (taskId) => {
        const task = domainTasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        const earnedPoints = calculatePoints(task, currentTime);

        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                domains: {
                    ...prev[todayStr]?.domains,
                    [domain.id]: prev[todayStr]?.domains?.[domain.id]?.map(t =>
                        t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString(), earnedPoints } : t
                    )
                }
            }
        }));

        setPoints(prev => prev + earnedPoints);

        const message = earnedPoints > 0
            ? `Task completed on time (+${earnedPoints} pts)`
            : `Task completed late (${earnedPoints} pts)`;

        showNotification(message, earnedPoints > 0 ? 'success' : 'error');
    };

    const deleteTask = (taskId) => {
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                domains: {
                    ...prev[todayStr]?.domains,
                    [domain.id]: prev[todayStr]?.domains?.[domain.id]?.filter(t => t.id !== taskId)
                }
            }
        }));
    };

    // Always show domain sections so users can add tasks
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-elevated border border-subtle flex items-center justify-center">
                        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-heading">{domain.shortName || domain.name}</h3>
                        <p className="text-xs text-zinc-600 tabular-nums">{completedCount}/{domainTasks.length} completed</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-4 py-2 bg-elevated hover:bg-surface border border-subtle text-muted hover:text-heading text-xs font-medium rounded-lg transition-colors"
                >
                    + Add Task
                </button>
            </div>

            {/* Add Task Form */}
            {showAdd && (
                <div className="px-5 py-4 bg-gray-50 dark:bg-zinc-800/50 border-b border-subtle">
                    <div className="space-y-3">
                        {/* Mode Selector */}
                        <div className="flex gap-2 p-1 bg-elevated rounded-lg border border-subtle">
                            <button
                                onClick={() => setTaskMode('pick')}
                                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${taskMode === 'pick' ? 'bg-white dark:bg-zinc-700 shadow-sm text-heading' : 'text-muted hover:text-heading'
                                    }`}
                            >
                                Pick from Academic
                            </button>
                            <button
                                onClick={() => setTaskMode('manual')}
                                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${taskMode === 'manual' ? 'bg-white dark:bg-zinc-700 shadow-sm text-heading' : 'text-muted hover:text-heading'
                                    }`}
                            >
                                Manual Entry
                            </button>
                        </div>

                        {/* Pick Mode - Topic and Item Selectors */}
                        {taskMode === 'pick' && (
                            <>
                                <div>
                                    <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Select Topic</label>
                                    <select
                                        value={selectedTopic}
                                        onChange={(e) => {
                                            setSelectedTopic(e.target.value);
                                            setSelectedItem('');
                                        }}
                                        className="input-field w-full px-4 py-2.5 bg-white dark:bg-zinc-800"
                                    >
                                        <option value="">Choose a topic...</option>
                                        {domain.topics?.map(topic => (
                                            <option key={topic.id} value={topic.id}>
                                                {topic.name} ({topic.items?.length || 0} items)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedTopic && (
                                    <div>
                                        <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Select Item</label>
                                        <select
                                            value={selectedItem}
                                            onChange={(e) => setSelectedItem(e.target.value)}
                                            className="input-field w-full px-4 py-2.5 bg-white dark:bg-zinc-800"
                                        >
                                            <option value="">Choose an item...</option>
                                            {domain.topics?.find(t => t.id.toString() === selectedTopic)?.items
                                                ?.filter(item => !item.completed)
                                                ?.map(item => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name} {item.difficulty ? `(${item.difficulty})` : ''}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Manual Mode - Text Input */}
                        {taskMode === 'manual' && (
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="Task description"
                                className="input-field w-full px-4 py-2.5 bg-white dark:bg-zinc-800"
                                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            />
                        )}

                        {/* Time and Points Inputs (shared by both modes) */}
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Hour</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="input-field w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Minute</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    className="input-field w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Points</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={taskPoints}
                                    onChange={(e) => setTaskPoints(e.target.value)}
                                    className="input-field w-full px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={addTask}
                                className="flex-1 px-4 py-2 btn-primary text-sm font-medium"
                            >
                                Add Task
                            </button>
                            <button
                                onClick={() => setShowAdd(false)}
                                className="px-4 py-2 bg-elevated text-muted text-sm font-medium rounded-lg hover:bg-surface border border-subtle transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tasks List */}
            <div className="divide-y divide-zinc-800">
                {domainTasks.map(task => (
                    <TaskRow
                        key={task.id}
                        task={task}
                        currentTime={currentTime}
                        onComplete={() => completeTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                    />
                ))}
            </div>
        </div>
    );
};

// Other Tasks Section
const OtherTasksSection = ({ todayStr, dailyTasks, setDailyTasks, currentTime, points, setPoints, showNotification }) => {
    const [showAdd, setShowAdd] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [hours, setHours] = useState('23');
    const [minutes, setMinutes] = useState('59');
    const [taskPoints, setTaskPoints] = useState('10');

    const otherTasks = dailyTasks[todayStr]?.other || [];
    const completedCount = otherTasks.filter(t => t.completed).length;

    const addTask = () => {
        if (!newTask.trim()) return;

        const task = {
            id: Date.now(),
            text: newTask.trim(),
            completed: false,
            deadline: { hours: parseInt(hours), minutes: parseInt(minutes) },
            points: parseInt(taskPoints) || 10,
            createdAt: new Date().toISOString()
        };

        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                other: [...(prev[todayStr]?.other || []), task]
            }
        }));

        setNewTask('');
        setShowAdd(false);
    };

    const completeTask = (taskId) => {
        const task = otherTasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        const earnedPoints = calculatePoints(task, currentTime);

        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                other: prev[todayStr]?.other?.map(t =>
                    t.id === taskId ? { ...t, completed: true, completedAt: new Date().toISOString(), earnedPoints } : t
                )
            }
        }));

        setPoints(prev => prev + earnedPoints);

        const message = earnedPoints > 0
            ? `Task completed on time (+${earnedPoints} pts)`
            : `Task completed late (${earnedPoints} pts)`;

        showNotification(message, earnedPoints > 0 ? 'success' : 'error');
    };

    const deleteTask = (taskId) => {
        setDailyTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                other: prev[todayStr]?.other?.filter(t => t.id !== taskId)
            }
        }));
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-elevated border border-subtle flex items-center justify-center"><svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                    <div>
                        <h3 className="text-sm font-semibold text-heading">Other Tasks</h3>
                        <p className="text-xs text-zinc-600 tabular-nums">{completedCount}/{otherTasks.length} completed</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-4 py-2 bg-elevated hover:bg-surface border border-subtle text-muted hover:text-heading text-xs font-medium rounded-lg transition-colors"
                >
                    + Add Task
                </button>
            </div>

            {/* Add Task Form */}
            {showAdd && (
                <div className="px-5 py-4 bg-gray-50 dark:bg-zinc-800/50 border-b border-subtle">
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Task description"
                            className="input-field w-full px-4 py-2.5"
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        />
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Hour</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    className="input-field w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Minute</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    className="input-field w-full px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Points</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={taskPoints}
                                    onChange={(e) => setTaskPoints(e.target.value)}
                                    className="input-field w-full px-3 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={addTask}
                                className="flex-1 px-4 py-2 btn-primary text-sm font-medium"
                            >
                                Add Task
                            </button>
                            <button
                                onClick={() => setShowAdd(false)}
                                className="px-4 py-2 bg-elevated text-muted text-sm font-medium rounded-lg hover:bg-surface border border-subtle transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tasks List */}
            <div className="divide-y divide-zinc-800">
                {otherTasks.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <p className="text-sm text-zinc-600">No tasks added yet</p>
                    </div>
                ) : (
                    otherTasks.map(task => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            currentTime={currentTime}
                            onComplete={() => completeTask(task.id)}
                            onDelete={() => deleteTask(task.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Task Row Component
const TaskRow = ({ task, currentTime, onComplete, onDelete }) => {
    const status = getTaskStatus(task, currentTime);

    const getStatusBadge = () => {
        if (task.completed) {
            return (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded border border-emerald-500/20">
                    Completed
                </span>
            );
        }

        switch (status) {
            case 'overdue':
                return <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-medium rounded border border-red-500/20">Overdue</span>;
            case 'due-soon':
                return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded border border-amber-500/20">Due Soon</span>;
            case 'pending':
                return <span className="px-2 py-0.5 bg-elevated border border-subtle text-muted text-xs font-medium rounded">Pending</span>;
            default:
                return null;
        }
    };

    return (
        <div className="px-5 py-4 hover:bg-active transition-colors group">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                        <p className={`text-sm font-medium ${task.completed ? 'text-zinc-600 line-through' : 'text-heading'}`}>
                            {task.text}
                        </p>
                        {task.completed && task.earnedPoints !== undefined && (
                            <span className={`text-xs font-semibold tabular-nums ${task.earnedPoints > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {task.earnedPoints > 0 ? '+' : ''}{task.earnedPoints}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-600">
                        {task.deadline && (
                            <>
                                <span className="tabular-nums">
                                    Due {String(task.deadline.hours).padStart(2, '0')}:{String(task.deadline.minutes).padStart(2, '0')}
                                </span>
                                <span>·</span>
                            </>
                        )}
                        {!task.completed && (
                            <span className="tabular-nums">
                                {status === 'overdue' ? `-${task.points}` : `+${task.points}`} pts
                            </span>
                        )}
                        <span>·</span>
                        {getStatusBadge()}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!task.completed && (
                        <button
                            onClick={onComplete}
                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${status === 'overdue'
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                : status === 'due-soon'
                                    ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                                    : 'btn-ghost border border-subtle text-heading hover:bg-elevated'
                                }`}
                        >
                            Complete
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckIn;

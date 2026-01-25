import { useState, useEffect, useCallback } from 'react';
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
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Predefined timed tasks with schedules
const TIMED_TASK_DEFINITIONS = [
    {
        id: 'gym',
        name: 'Gym / Workout',
        icon: '',
        color: 'violet',
        startTime: { hours: 9, minutes: 0 },
        endTime: { hours: 11, minutes: 0 },
        points: 50,
        category: 'fitness'
    },
    {
        id: 'breakfast',
        name: 'Breakfast',
        icon: '',
        color: 'amber',
        startTime: { hours: 8, minutes: 0 },
        endTime: { hours: 9, minutes: 0 },
        points: 30,
        category: 'diet'
    },
    {
        id: 'lunch',
        name: 'Lunch',
        icon: '',
        color: 'emerald',
        startTime: { hours: 12, minutes: 0 },
        endTime: { hours: 13, minutes: 0 },
        points: 30,
        category: 'diet'
    },
    {
        id: 'snack',
        name: 'Snack',
        icon: '',
        color: 'pink',
        startTime: { hours: 16, minutes: 0 },
        endTime: { hours: 17, minutes: 0 },
        points: 20,
        category: 'diet'
    },
    {
        id: 'dinner',
        name: 'Dinner',
        icon: '',
        color: 'blue',
        startTime: { hours: 20, minutes: 0 },
        endTime: { hours: 21, minutes: 0 },
        points: 30,
        category: 'diet'
    }
];

const TimedTasks = () => {
    const { timedTasks, setTimedTasks, points, setPoints, showNotification } = useApp();
    const todayStr = getISTDateString();
    const [currentTime, setCurrentTime] = useState(getISTTime());
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notifiedTasks, setNotifiedTasks] = useState(new Set());

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                setNotificationsEnabled(true);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    setNotificationsEnabled(permission === 'granted');
                });
            }
        }
    }, []);

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(getISTTime());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Check for notifications
    useEffect(() => {
        if (!notificationsEnabled) return;

        TIMED_TASK_DEFINITIONS.forEach(task => {
            const taskData = timedTasks[todayStr]?.[task.id];
            if (taskData?.completed) return;

            const notificationKey = `${todayStr}-${task.id}`;
            if (notifiedTasks.has(notificationKey)) return;

            // Notify 15 minutes before start time
            const notifyTime = task.startTime.hours * 60 + task.startTime.minutes - 15;
            const currentMinutes = currentTime.hours * 60 + currentTime.minutes;

            if (currentMinutes === notifyTime) {
                new Notification(`⏰ ${task.name} in 15 minutes!`, {
                    body: `Don't forget your ${task.name.toLowerCase()} scheduled at ${String(task.startTime.hours).padStart(2, '0')}:${String(task.startTime.minutes).padStart(2, '0')}`,
                    icon: task.icon
                });
                setNotifiedTasks(prev => new Set([...prev, notificationKey]));
            }
        });
    }, [currentTime, timedTasks, todayStr, notificationsEnabled, notifiedTasks]);

    // Initialize today's tasks if not exists
    useEffect(() => {
        if (!timedTasks[todayStr]) {
            const todayTasks = {};
            TIMED_TASK_DEFINITIONS.forEach(task => {
                todayTasks[task.id] = {
                    completed: false,
                    completedAt: null
                };
            });
            setTimedTasks(prev => ({ ...prev, [todayStr]: todayTasks }));
        }
    }, [todayStr, timedTasks, setTimedTasks]);

    const getTaskStatus = (task) => {
        const taskData = timedTasks[todayStr]?.[task.id];
        if (taskData?.completed) return 'completed';

        const currentMinutes = currentTime.hours * 60 + currentTime.minutes;
        const startMinutes = task.startTime.hours * 60 + task.startTime.minutes;
        const endMinutes = task.endTime.hours * 60 + task.endTime.minutes;

        if (currentMinutes < startMinutes) return 'upcoming';
        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) return 'active';
        return 'missed';
    };

    const completeTask = (task) => {
        const status = getTaskStatus(task);
        if (status === 'completed') return;

        const currentMinutes = currentTime.hours * 60 + currentTime.minutes;
        const startMinutes = task.startTime.hours * 60 + task.startTime.minutes;
        const endMinutes = task.endTime.hours * 60 + task.endTime.minutes;

        let pointsEarned = 0;
        let message = '';

        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
            // Completed on time - positive points
            pointsEarned = task.points;
            message = ` ${task.name} completed on time! +${pointsEarned} points`;
        } else if (currentMinutes > endMinutes) {
            // Completed late - negative points
            pointsEarned = -Math.floor(task.points / 2);
            message = ` ${task.name} completed late. ${pointsEarned} points`;
        } else {
            // Completed early
            pointsEarned = Math.floor(task.points * 0.75);
            message = `⏰ ${task.name} completed early. +${pointsEarned} points`;
        }

        // Update task completion
        setTimedTasks(prev => ({
            ...prev,
            [todayStr]: {
                ...prev[todayStr],
                [task.id]: {
                    completed: true,
                    completedAt: new Date().toISOString(),
                    pointsEarned
                }
            }
        }));

        // Update points
        setPoints(prev => prev + pointsEarned);
        showNotification(message, pointsEarned > 0 ? 'success' : 'error');
    };

    const colorClasses = {
        violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', btn: 'bg-violet-500 hover:bg-violet-600' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', btn: 'bg-amber-500 hover:bg-amber-600' },
        emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', btn: 'bg-emerald-500 hover:bg-emerald-600' },
        pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', btn: 'bg-pink-500 hover:bg-pink-600' },
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', btn: 'bg-blue-500 hover:bg-blue-600' }
    };

    const todayTasks = timedTasks[todayStr] || {};
    const completedCount = Object.values(todayTasks).filter(t => t.completed).length;
    const totalTasks = TIMED_TASK_DEFINITIONS.length;

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-heading mb-0.5 sm:mb-1">Timed Tasks</h1>
                    <p className="text-xs sm:text-sm text-zinc-500">{formatDate(todayStr)} · IST · {currentTime.timeString}</p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{points}</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-600 uppercase">Points</p>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-xl sm:text-2xl font-bold font-mono text-sky-400">{completedCount}/{totalTasks}</p>
                        <p className="text-[9px] sm:text-[10px] text-zinc-600 uppercase">Done</p>
                    </div>
                </div>
            </div>

            {/* Notification Toggle */}
            {!notificationsEnabled && 'Notification' in window && Notification.permission !== 'denied' && (
                <div className="glass-card p-3 sm:p-4 border border-amber-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-heading">Enable Notifications</p>
                            <p className="text-xs text-zinc-500">Get reminders 15 minutes before each task</p>
                        </div>
                        <button
                            onClick={() => {
                                Notification.requestPermission().then(permission => {
                                    setNotificationsEnabled(permission === 'granted');
                                });
                            }}
                            className="px-3 py-2 bg-amber-500 text-heading rounded-lg text-xs font-semibold hover:bg-amber-600"
                        >
                            Enable
                        </button>
                    </div>
                </div>
            )}

            {/* Progress */}
            {totalTasks > 0 && (
                <div className="glass-card p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-zinc-400">{completedCount}/{totalTasks} completed</span>
                        {completedCount === totalTasks && <span className="text-[10px] sm:text-xs font-semibold text-emerald-400">All Done! </span>}
                    </div>
                    <div className="h-1.5 sm:h-2 bg-elevated rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${completedCount === totalTasks ? 'bg-emerald-500' : 'bg-sky-500'}`}
                            style={{ width: `${(completedCount / totalTasks) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Timed Tasks List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {TIMED_TASK_DEFINITIONS.map(task => {
                    const status = getTaskStatus(task);
                    const taskData = todayTasks[task.id];
                    const colors = colorClasses[task.color];

                    return (
                        <div
                            key={task.id}
                            className={`glass-card p-4 border ${colors.border} ${status === 'completed' ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`text-2xl ${colors.text}`}>{task.icon}</div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-semibold text-heading">{task.name}</h3>
                                        <p className="text-[10px] sm:text-xs text-zinc-500">
                                            {String(task.startTime.hours).padStart(2, '0')}:{String(task.startTime.minutes).padStart(2, '0')} - {String(task.endTime.hours).padStart(2, '0')}:{String(task.endTime.minutes).padStart(2, '0')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {status === 'completed' ? (
                                        <div>
                                            <div className="text-emerald-400 text-xl"></div>
                                            <p className={`text-[10px] font-mono ${taskData?.pointsEarned >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {taskData?.pointsEarned >= 0 ? '+' : ''}{taskData?.pointsEarned || 0}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className={`text-xs font-semibold ${colors.text}`}>
                                            {status === 'active' && ' Active'}
                                            {status === 'upcoming' && '⏰ Upcoming'}
                                            {status === 'missed' && ' Missed'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-xs text-zinc-500">
                                    {status === 'completed' && taskData?.completedAt && (
                                        <span>Completed at {new Date(taskData.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                    )}
                                    {status === 'active' && <span className="text-emerald-400 font-semibold">Complete now for +{task.points} points</span>}
                                    {status === 'upcoming' && <span>Starts in {Math.floor((task.startTime.hours * 60 + task.startTime.minutes - (currentTime.hours * 60 + currentTime.minutes)) / 60)}h {(task.startTime.hours * 60 + task.startTime.minutes - (currentTime.hours * 60 + currentTime.minutes)) % 60}m</span>}
                                    {status === 'missed' && <span className="text-red-400">Complete now for {-Math.floor(task.points / 2)} points</span>}
                                </div>
                                {status !== 'completed' && (
                                    <button
                                        onClick={() => completeTask(task)}
                                        className={`px-3 py-1.5 ${colors.btn} text-heading rounded-lg text-xs font-semibold transition-all`}
                                    >
                                        Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Points History (Today) */}
            <div className="glass-card p-4">
                <h3 className="text-sm font-semibold text-heading mb-3">Today's Points Summary</h3>
                <div className="space-y-2">
                    {TIMED_TASK_DEFINITIONS.map(task => {
                        const taskData = todayTasks[task.id];
                        if (!taskData?.completed) return null;

                        return (
                            <div key={task.id} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400">{task.icon} {task.name}</span>
                                <span className={`font-mono font-semibold ${taskData.pointsEarned >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {taskData.pointsEarned >= 0 ? '+' : ''}{taskData.pointsEarned}
                                </span>
                            </div>
                        );
                    })}
                    {completedCount === 0 && (
                        <p className="text-center text-zinc-600 text-xs py-4">No tasks completed yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimedTasks;

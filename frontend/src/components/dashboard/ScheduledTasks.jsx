import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime, getTimeUntil, getTimeStatus } from '../../utils/timeUtils';

const ScheduledTasks = () => {
    const { activities, dailyTasks } = useApp();
    const [scheduledItems, setScheduledItems] = useState([]);

    useEffect(() => {
        // 1. Get scheduled activities (like Gym, etc from logActivity)
        const scheduledActivities = activities
            .filter(a => a.scheduledTime && !a.completed);

        // 2. Get scheduled daily tasks (from CheckIn page)
        let scheduledDailyTasks = [];
        Object.keys(dailyTasks).forEach(dateKey => {
            const dayData = dailyTasks[dateKey];
            if (!dayData) return;

            // Iterate over all domains (keys in dayData)
            Object.keys(dayData).forEach(domainKey => {
                const tasks = dayData[domainKey];
                if (Array.isArray(tasks)) {
                    tasks.forEach(task => {
                        if (task.scheduledTime && !task.completed) {
                            // Map 'other' to 'personal', otherwise use domainKey (dsa, ai, etc.)
                            const type = domainKey === 'other' ? 'personal' : domainKey;

                            scheduledDailyTasks.push({
                                _id: `daily-${task.id}`,
                                type: type,
                                scheduledTime: task.scheduledTime,
                                details: { notes: task.text }
                            });
                        }
                    });
                }
            });
        });

        // 3. Merge and sort
        const allScheduled = [...scheduledActivities, ...scheduledDailyTasks]
            .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
            .slice(0, 5);

        setScheduledItems(allScheduled);
    }, [activities, dailyTasks]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'overdue': return 'text-red-400 border-red-500/30 bg-red-500/10';
            case 'urgent': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
            case 'soon': return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
            default: return 'text-zinc-400 border-zinc-700/50 bg-elevated';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'gym': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
            case 'dsa': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
            case 'ai': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
            case 'job': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
            case 'personal': return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
            default: return <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        }
    };

    if (scheduledItems.length === 0) {
        return (
            <div className="glass-card p-6 min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-16 h-16 bg-elevated rounded-full flex items-center justify-center mb-4 border border-subtle shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-base font-semibold text-heading mb-1">Clear Schedule</h3>
                <p className="text-xs text-zinc-500 max-w-[200px] text-center">Add times to your tasks to see your daily timeline here.</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-0 overflow-hidden flex flex-col h-full bg-surface">
            <div className="p-5 border-b border-subtle flex items-center justify-between bg-elevated/50">
                <div>
                    <h3 className="text-base font-semibold text-heading flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Timeline
                    </h3>
                </div>
                <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-elevated border border-subtle text-muted shadow-sm">
                    {scheduledItems.length} upcoming
                </span>
            </div>

            <div className="p-5 relative">
                {/* Connecting Line */}
                <div className="absolute left-[107px] top-6 bottom-6 w-[2px] bg-subtle hidden sm:block opacity-50"></div>

                <div className="space-y-6 relative">
                    {scheduledItems.map((item, index) => {
                        const timeUntil = getTimeUntil(item.scheduledTime);
                        const status = getTimeStatus(item.scheduledTime);
                        const date = new Date(item.scheduledTime);
                        const isNext = index === 0 && status !== 'overdue';

                        return (
                            <div key={item._id} className="relative flex flex-col sm:flex-row gap-4 sm:gap-14 group">
                                {/* Time Column */}
                                <div className="sm:w-20 flex-shrink-0 text-left sm:text-right pt-2.5 pr-4">
                                    <p className={`font-mono text-xs font-bold leading-none ${isNext ? 'text-sky-600' : 'text-zinc-500'}`}>
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 mt-1.5 uppercase tracking-wider hidden sm:block">
                                        {timeUntil.overdue ? 'Past' : 'Today'}
                                    </p>
                                </div>

                                {/* Timeline Node */}
                                <div className="hidden sm:flex flex-col items-center absolute left-[91px] top-0 h-full">
                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isNext
                                        ? 'bg-surface border-sky-500 ring-4 ring-sky-500/10 shadow-lg shadow-sky-500/20'
                                        : status === 'overdue'
                                            ? 'bg-surface border-red-500'
                                            : 'bg-surface border-subtle group-hover:border-zinc-400'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${isNext ? 'bg-sky-500 animate-pulse' :
                                            status === 'overdue' ? 'bg-red-500' : 'bg-zinc-400'
                                            }`}></div>
                                    </div>
                                </div>

                                {/* Card content */}
                                <div className={`flex-1 rounded-xl p-3 border transition-all duration-300 group-hover:-translate-y-0.5 ${isNext
                                    ? 'bg-surface border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/20'
                                    : 'bg-surface border-subtle hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
                                    }`}
                                    style={{ backgroundColor: 'var(--color-bg-card)' }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                                                isNext ? 'bg-sky-500/10 text-sky-500' : 'bg-elevated text-zinc-500'
                                                }`}>
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-semibold text-heading line-clamp-1`}>
                                                    {item.details?.notes || item.type.toUpperCase()}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${getStatusColor(status)}`}>
                                                        {status}
                                                    </span>
                                                    {isNext && (
                                                        <span className="text-[10px] text-sky-500 flex items-center gap-1 animate-pulse font-bold">
                                                            ● Next Up
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className={`text-xs font-mono font-semibold ${status === 'overdue' ? 'text-red-500' : 'text-muted'}`}>
                                                {timeUntil.overdue ? '+' : ''}{timeUntil.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Overdue Warning at bottom if any */}
            {scheduledItems.some(item => getTimeStatus(item.scheduledTime) === 'overdue') && (
                <div className="p-2 bg-red-500/10 border-t border-red-500/20 backdrop-blur-md">
                    <p className="text-[10px] text-red-400 text-center flex items-center justify-center gap-1 font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Overdue tasks detected
                    </p>
                </div>
            )}
        </div>
    );
};

export default ScheduledTasks;

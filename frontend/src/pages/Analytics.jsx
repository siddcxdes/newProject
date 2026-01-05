import { useApp } from '../context/AppContext';

const Analytics = () => {
    const { user, activities, learningDomains, workouts } = useApp();

    // Calculate domain-based stats from learningDomains
    const domainStats = learningDomains.map(domain => {
        const totalItems = domain.topics?.reduce((sum, t) => sum + (t.items?.length || 0), 0) || 0;
        const completedItems = domain.topics?.reduce((sum, t) => sum + (t.items?.filter(i => i.completed).length || 0), 0) || 0;
        return { id: domain.id, name: domain.shortName || domain.name, completed: completedItems, total: totalItems, color: domain.color };
    });

    const totalWorkouts = workouts.reduce((sum, w) => sum + w.timesCompleted, 0);
    const totalXpEarned = activities.reduce((sum, a) => sum + a.xpEarned, 0);

    const activityBreakdown = activities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
    }, {});

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayActivities = activities.filter(a => new Date(a.date).toISOString().split('T')[0] === dateStr);
        return { day: date.toLocaleDateString('en-US', { weekday: 'short' }), count: dayActivities.length, xp: dayActivities.reduce((sum, a) => sum + a.xpEarned, 0) };
    });

    const maxCount = Math.max(...last7Days.map(d => d.count), 1);

    // Dynamic color mapping for categories
    const getCategoryColor = (type) => {
        // Check if it's a learning domain
        const domain = learningDomains.find(d => d.id === type);
        if (domain) {
            const colorMap = {
                violet: 'bg-violet-500',
                emerald: 'bg-emerald-500',
                blue: 'bg-blue-500',
                amber: 'bg-amber-500',
                pink: 'bg-pink-500',
                cyan: 'bg-cyan-500',
            };
            return colorMap[domain.color] || 'bg-zinc-500';
        }
        // Fallback for legacy types
        const legacyColors = { dsa: 'bg-violet-500', ai: 'bg-emerald-500', gym: 'bg-amber-500', job: 'bg-blue-500', personal: 'bg-pink-500' };
        return legacyColors[type] || 'bg-zinc-500';
    };

    // Get display name for category
    const getCategoryName = (type) => {
        // Check if it's a learning domain
        const domain = learningDomains.find(d => d.id === type);
        if (domain) return domain.shortName || domain.name;
        // Fallback for legacy types
        const legacyNames = { dsa: 'DSA', ai: 'AI', gym: 'Gym', job: 'Job', personal: 'Personal' };
        return legacyNames[type] || type;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Analytics</h1>
                <p className="text-sm text-zinc-500">Track your progress and achievements over time</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Total XP</p>
                    <p className="stat-value text-violet-400">{user?.xp || 0}</p>
                    <p className="stat-sublabel">earned all time</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Activities</p>
                    <p className="stat-value">{activities.length}</p>
                    <p className="stat-sublabel">logged</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Current Level</p>
                    <p className="stat-value">{user?.level || 1}</p>
                    <p className="stat-sublabel">achieved</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Best Streak</p>
                    <p className="stat-value text-amber-400">{user?.streak?.longest || 0}</p>
                    <p className="stat-sublabel">days</p>
                </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-5">Last 7 Days</h3>
                <div className="flex items-end gap-3 h-40">
                    {last7Days.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-[#0a0a0a] rounded-t-lg flex flex-col justify-end" style={{ height: '120px' }}>
                                <div className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all duration-500" style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '0' }} />
                            </div>
                            <p className="text-xs font-medium text-zinc-500">{day.day}</p>
                            <p className="text-xs font-semibold text-white">{day.count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass-card p-5">
                    <h3 className="text-base font-semibold text-white mb-4">By Category</h3>
                    {Object.keys(activityBreakdown).length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-8">No activities logged yet</p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(activityBreakdown).map(([type, count]) => {
                                const total = activities.length;
                                const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
                                const displayName = getCategoryName(type);
                                const colorClass = getCategoryColor(type);
                                return (
                                    <div key={type}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-white">{displayName}</span>
                                            <span className="text-zinc-500"><span className="text-white font-semibold">{count}</span> ({percent}%)</span>
                                        </div>
                                        <div className="progress-bar h-2">
                                            <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="glass-card p-5">
                    <h3 className="text-base font-semibold text-white mb-4">Progress Overview</h3>
                    <div className="space-y-3">
                        {/* Dynamic domain stats */}
                        {domainStats.map(stat => {
                            const colorMap = {
                                violet: 'text-violet-400',
                                emerald: 'text-emerald-400',
                                blue: 'text-blue-400',
                                amber: 'text-amber-400',
                                pink: 'text-pink-400',
                                cyan: 'text-cyan-400',
                            };
                            const textColor = colorMap[stat.color] || 'text-zinc-400';
                            return (
                                <div key={stat.id} className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#111111]">
                                    <span className="text-sm text-white">{stat.name} Completed</span>
                                    <span className={`font-semibold font-mono ${textColor}`}>{stat.completed}/{stat.total}</span>
                                </div>
                            );
                        })}
                        {/* Workouts */}
                        <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#111111]">
                            <span className="text-sm text-white">Workouts Logged</span>
                            <span className="font-semibold font-mono text-amber-400">{totalWorkouts}</span>
                        </div>
                        {/* Total XP */}
                        <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-xl border border-[#111111]">
                            <span className="text-sm text-white">Total XP Earned</span>
                            <span className="font-semibold font-mono text-white">{totalXpEarned}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

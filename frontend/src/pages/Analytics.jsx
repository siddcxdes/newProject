import { useApp } from '../context/AppContext';

const Analytics = () => {
    const { user, heatmapData } = useApp();

    // Calculate some analytics
    const totalActivities = Object.values(heatmapData).reduce((sum, d) => sum + d.count, 0);
    const totalXpEarned = Object.values(heatmapData).reduce((sum, d) => sum + d.totalXp, 0);
    const activeDays = Object.keys(heatmapData).length;

    const activityBreakdown = [
        { type: 'DSA Problems', icon: '💻', count: user?.stats?.dsaProblemsTotal || 0, color: 'from-blue-500 to-cyan-500' },
        { type: 'AI Modules', icon: '🤖', count: user?.stats?.aiModulesCompleted || 0, color: 'from-purple-500 to-pink-500' },
        { type: 'Gym Sessions', icon: '🏋️', count: (user?.stats?.gymDaysThisWeek || 0) * 4, color: 'from-green-500 to-emerald-500' },
        { type: 'Job Applications', icon: '💼', count: user?.stats?.jobApplications || 0, color: 'from-orange-500 to-red-500' },
        { type: 'Personal Wins', icon: '🎉', count: user?.stats?.personalWins || 0, color: 'from-pink-500 to-rose-500' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">📈 Analytics</h1>
                <p className="text-slate-400">Insights into your progress and patterns</p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-6 text-center">
                    <p className="text-4xl font-bold gradient-text">{user?.level || 1}</p>
                    <p className="text-slate-400">Current Level</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <p className="text-4xl font-bold gradient-text">{user?.xp || 0}</p>
                    <p className="text-slate-400">Total XP</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <p className="text-4xl font-bold gradient-text">{user?.streak?.current || 0}</p>
                    <p className="text-slate-400">Current Streak</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <p className="text-4xl font-bold gradient-text">{activeDays}</p>
                    <p className="text-slate-400">Active Days</p>
                </div>
            </div>

            {/* Activity Breakdown */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Activity Breakdown</h3>

                <div className="space-y-4">
                    {activityBreakdown.map((activity) => {
                        const percentage = totalActivities > 0 ? (activity.count / totalActivities) * 100 : 0;
                        return (
                            <div key={activity.type} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{activity.icon}</span>
                                        <span className="text-white">{activity.type}</span>
                                    </div>
                                    <span className="text-slate-400">{activity.count}</span>
                                </div>
                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${activity.color} rounded-full transition-all duration-500`}
                                        style={{ width: `${Math.max(2, percentage)}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Journey Progress */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">17-Week Journey</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">Week {user?.journey?.currentWeek || 1}</p>
                        <p className="text-sm text-slate-400">Current Week</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-white">{user?.journey?.totalWeeks || 17}</p>
                        <p className="text-sm text-slate-400">Total Weeks</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">
                            {Math.round(((user?.journey?.currentWeek || 1) / (user?.journey?.totalWeeks || 17)) * 100)}%
                        </p>
                        <p className="text-sm text-slate-400">Complete</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-purple-400">
                            {(user?.journey?.totalWeeks || 17) - (user?.journey?.currentWeek || 1)}
                        </p>
                        <p className="text-sm text-slate-400">Weeks Left</p>
                    </div>
                </div>

                {/* Progress visualization */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Start</span>
                        <span>Goal</span>
                    </div>
                    <div className="h-6 bg-slate-700/50 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all flex items-center justify-end pr-2"
                            style={{ width: `${((user?.journey?.currentWeek || 1) / (user?.journey?.totalWeeks || 17)) * 100}%` }}
                        >
                            <span className="text-xs text-white font-medium">🚀</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Streak History */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Streak Stats</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
                        <span className="text-4xl block mb-2">🔥</span>
                        <p className="text-3xl font-bold text-orange-400">{user?.streak?.current || 0}</p>
                        <p className="text-sm text-slate-400">Current Streak</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 text-center">
                        <span className="text-4xl block mb-2">🏆</span>
                        <p className="text-3xl font-bold text-purple-400">{user?.streak?.longest || 0}</p>
                        <p className="text-sm text-slate-400">Longest Streak</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

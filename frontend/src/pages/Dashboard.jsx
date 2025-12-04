import Greeting from '../components/dashboard/Greeting';
import MetricCard from '../components/dashboard/MetricCard';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import QuickActions from '../components/dashboard/QuickActions';
import LevelCard from '../components/dashboard/LevelCard';
import StreakCard from '../components/dashboard/StreakCard';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
    const { user, activities, notification } = useApp();
    const stats = user?.stats || {};

    const recentActivities = activities.slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-16 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in ${notification.type === 'success' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                        notification.type === 'error' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                            'bg-[#111111] text-white border border-[#222222]'
                    }`}>
                    {notification.message}
                </div>
            )}

            <Greeting />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard
                    title="DSA Problems"
                    value={stats.dsaProblemsTotal || 0}
                    subtitle={`${stats.dsaProblemsToday || 0} today`}
                    type="violet"
                />
                <MetricCard
                    title="AI Progress"
                    value={`${stats.aiProgress || 0}%`}
                    subtitle={`${stats.aiModulesCompleted || 0} modules`}
                    type="emerald"
                />
                <MetricCard
                    title="Gym Sessions"
                    value={`${stats.gymDaysThisWeek || 0}/7`}
                    subtitle="This week"
                    type="amber"
                />
                <MetricCard
                    title="Applications"
                    value={stats.jobApplications || 0}
                    subtitle="Total sent"
                    type="blue"
                />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <ActivityHeatmap />
                </div>
                <div className="space-y-5">
                    <LevelCard />
                    <StreakCard />
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Recent Activity</h3>
                {recentActivities.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-8">No activities yet. Start logging to build your streak!</p>
                ) : (
                    <div className="space-y-2">
                        {recentActivities.map((activity) => (
                            <div
                                key={activity._id}
                                className="flex items-center justify-between py-3 px-4 rounded-lg bg-[#0a0a0a] border border-[#111111] hover:border-[#1a1a1a] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${activity.type === 'dsa' ? 'bg-violet-400' :
                                            activity.type === 'ai' ? 'bg-emerald-400' :
                                                activity.type === 'gym' ? 'bg-amber-400' :
                                                    activity.type === 'job' ? 'bg-blue-400' :
                                                        'bg-pink-400'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-white capitalize">{activity.type}</p>
                                        <p className="text-xs text-zinc-500">
                                            {new Date(activity.date).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZone: 'Asia/Kolkata'
                                            })} IST
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold font-mono text-emerald-400">+{activity.xpEarned} XP</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

import { useApp } from '../context/AppContext';
import Greeting from '../components/dashboard/Greeting';
import MetricCard from '../components/dashboard/MetricCard';
import StreakCard from '../components/dashboard/StreakCard';
import LevelCard from '../components/dashboard/LevelCard';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';

const Dashboard = () => {
    const { user, activities } = useApp();

    const stats = user?.stats || {};

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <Greeting userName={user?.name} />

            {/* Top Row - Level & Streak */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <LevelCard level={user?.level} xp={user?.xp} xpToNextLevel={user?.xpToNextLevel} />
                <StreakCard streak={user?.streak} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                    label="DSA Solved"
                    value={stats.dsaProblemsToday || 0}
                    sublabel="today"
                    color="violet"
                />
                <MetricCard
                    label="AI Modules"
                    value={stats.aiModulesCompleted || 0}
                    sublabel="completed"
                    color="emerald"
                />
                <MetricCard
                    label="Gym Days"
                    value={stats.gymDaysThisWeek || 0}
                    sublabel="this week"
                    total={7}
                    color="amber"
                />
                <MetricCard
                    label="Applications"
                    value={stats.jobApplications || 0}
                    sublabel="sent"
                    color="blue"
                />
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Activity Heatmap */}
            <ActivityHeatmap activities={activities} />
        </div>
    );
};

export default Dashboard;

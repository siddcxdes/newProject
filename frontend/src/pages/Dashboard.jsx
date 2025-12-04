import { useApp } from '../context/AppContext';
import Greeting from '../components/dashboard/Greeting';
import LevelCard from '../components/dashboard/LevelCard';
import StreakCard from '../components/dashboard/StreakCard';
import MetricCard from '../components/dashboard/MetricCard';
import ProgressTracker from '../components/dashboard/ProgressTracker';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';

const Dashboard = () => {
    const { user } = useApp();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your journey...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Greeting */}
            <Greeting userName={user?.name || 'Champion'} />

            {/* Level & Streak Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LevelCard />
                <StreakCard />
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon="💻"
                    title="DSA Problems Solved"
                    value={user?.stats?.dsaProblemsTotal || 0}
                    subtitle={`${user?.stats?.dsaProblemsToday || 0} today • Goal: ${user?.settings?.dailyDsaGoal || 3}/day`}
                    progress={((user?.stats?.dsaProblemsToday || 0) / (user?.settings?.dailyDsaGoal || 3)) * 100}
                    link="/academics"
                    color="blue"
                />
                <MetricCard
                    icon="🤖"
                    title="AI/ML Progress"
                    value={`${user?.stats?.aiProgress || 0}%`}
                    subtitle={`${user?.stats?.aiModulesCompleted || 0} modules completed`}
                    progress={user?.stats?.aiProgress || 0}
                    link="/academics"
                    color="purple"
                />
                <MetricCard
                    icon="🏋️"
                    title="Gym This Week"
                    value={`${user?.stats?.gymDaysThisWeek || 0}/${user?.settings?.weeklyGymGoal || 5}`}
                    subtitle={`Goal: ${user?.settings?.weeklyGymGoal || 5} days/week`}
                    progress={((user?.stats?.gymDaysThisWeek || 0) / (user?.settings?.weeklyGymGoal || 5)) * 100}
                    link="/gym"
                    color="green"
                />
                <MetricCard
                    icon="🔥"
                    title="Current Streak"
                    value={`${user?.streak?.current || 0} days`}
                    subtitle={user?.streak?.current > 0 ? 'Keep it going!' : 'Start today!'}
                    progress={Math.min(100, (user?.streak?.current || 0) * 10)}
                    link="/analytics"
                    color="orange"
                />
            </div>

            {/* Progress Tracker */}
            <ProgressTracker />

            {/* Quick Actions */}
            <QuickActions />

            {/* Activity Heatmap */}
            <ActivityHeatmap />
        </div>
    );
};

export default Dashboard;

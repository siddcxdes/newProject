import { useApp } from '../context/AppContext';
import Greeting from '../components/dashboard/Greeting';
import MetricCard from '../components/dashboard/MetricCard';
import StreakCard from '../components/dashboard/StreakCard';
import LevelCard from '../components/dashboard/LevelCard';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import ScheduledTasks from '../components/dashboard/ScheduledTasks';

const Dashboard = () => {
    const { user, activities } = useApp();

    const stats = user?.stats || {};

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <Greeting userName={user?.name} />

            {/* Top Row - Level & Streak */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Level Card */}
                <LevelCard level={user?.level} xp={user?.xp} xpToNextLevel={user?.xpToNextLevel} />

                {/* Streak Card */}
                <StreakCard streak={user?.streak} />
            </div>



            {/* Scheduled Tasks Widget */}
            <ScheduledTasks />

            {/* Activity Heatmap */}
            <ActivityHeatmap activities={activities} />
        </div>
    );
};

export default Dashboard;

import { getGreeting } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';

const Greeting = () => {
    const { user } = useApp();
    const greeting = getGreeting();

    return (
        <div className="mb-2">
            <h1 className="text-2xl font-semibold text-white mb-1">
                {greeting.text}, {user?.name || 'Champion'}
            </h1>
            <p className="text-sm text-zinc-500">
                Level <span className="text-zinc-300 font-medium">{user?.level || 1}</span> ·
                <span className="text-zinc-300 font-medium font-mono"> {user?.xp || 0}</span> XP ·
                Week <span className="text-zinc-300 font-medium">{user?.journey?.currentWeek || 1}</span> of {user?.journey?.totalWeeks || 17}
            </p>
        </div>
    );
};

export default Greeting;

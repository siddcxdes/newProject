import { getGreeting } from '../../utils/dateUtils';
import { useApp } from '../../context/AppContext';

const Greeting = () => {
    const { user } = useApp();
    const greeting = getGreeting();

    return (
        <div className="mb-2">
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-1">
                {greeting.text}, {user?.name || 'Champion'}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)]">
                Level <span className="text-[var(--color-text-secondary)] font-medium">{user?.level || 1}</span> ·
                <span className="text-[var(--color-text-secondary)] font-medium font-mono"> {user?.xp || 0}</span> XP ·
                Week <span className="text-[var(--color-text-secondary)] font-medium">{user?.journey?.currentWeek || 1}</span> of {user?.journey?.totalWeeks || 17}
            </p>
        </div>
    );
};

export default Greeting;

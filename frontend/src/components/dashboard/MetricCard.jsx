import { useApp } from '../../context/AppContext';

const MetricCard = ({ title, value, subtitle, type = 'default' }) => {
    const colorClasses = {
        default: 'text-white',
        violet: 'text-violet-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        blue: 'text-blue-400',
        red: 'text-red-400',
    };

    return (
        <div className="glass-card p-5">
            <p className="stat-label mb-2">{title}</p>
            <p className={`stat-value ${colorClasses[type]}`}>{value}</p>
            {subtitle && <p className="stat-sublabel mt-1">{subtitle}</p>}
        </div>
    );
};

export default MetricCard;

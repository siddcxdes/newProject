const MetricCard = ({ label, value, sublabel, total, color = 'default' }) => {
    const colorClasses = {
        default: 'text-heading',
        violet: 'text-sky-400',
        sky: 'text-sky-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        blue: 'text-blue-400',
        red: 'text-red-400',
        pink: 'text-pink-400',
    };

    return (
        <div className="glass-card p-3 sm:p-4">
            <p className="stat-label mb-1 sm:mb-2 text-[9px] sm:text-[10px]">{label}</p>
            <p className={`text-xl sm:text-2xl font-bold font-mono ${colorClasses[color]}`}>
                {value}{total && <span className="text-zinc-600">/{total}</span>}
            </p>
            {sublabel && <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-0.5 sm:mt-1">{sublabel}</p>}
        </div>
    );
};

export default MetricCard;

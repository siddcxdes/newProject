import { Link } from 'react-router-dom';

const MetricCard = ({
    icon,
    title,
    value,
    subtitle,
    progress = 0,
    link = '#',
    color = 'purple'
}) => {
    const colors = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-red-500',
    };

    const glowColors = {
        purple: 'shadow-purple-500/20',
        blue: 'shadow-blue-500/20',
        green: 'shadow-green-500/20',
        orange: 'shadow-orange-500/20',
    };

    return (
        <Link to={link} className="block">
            <div className="metric-card hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors[color]}`}></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-xl shadow-lg ${glowColors[color]}`}>
                        {icon}
                    </div>
                    <span className="text-slate-400 group-hover:text-white transition-colors">→</span>
                </div>

                {/* Content */}
                <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
                <p className="text-2xl font-bold text-white mb-1">{value}</p>
                <p className="text-xs text-slate-500 mb-4">{subtitle}</p>

                {/* Progress bar */}
                <div className="progress-bar">
                    <div
                        className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                    ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">{Math.round(progress)}%</p>
            </div>
        </Link>
    );
};

export default MetricCard;

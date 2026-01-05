import { useState, useEffect } from 'react';

// Cal.com style stacked cards with CSS animation - Compact version
const HeroScene3D = ({ height = 140 }) => {
    const [toggles, setToggles] = useState({
        mon: true,
        tue: false,
    });

    // Auto-animate toggles like cal.com
    useEffect(() => {
        const interval = setInterval(() => {
            setToggles(prev => ({
                mon: prev.tue,
                tue: !prev.tue,
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const scheduleData = [
        { day: 'Mon', start: '8:30 am', end: '5:00 pm', key: 'mon' },
        { day: 'Tue', start: '9:00 am', end: '6:30 pm', key: 'tue' },
    ];

    return (
        <div
            className="relative overflow-hidden rounded-xl w-full h-full"
            style={{ height, background: 'transparent' }}
        >
            {/* Stacked Cards Container */}
            <div className="absolute inset-0 flex items-center justify-center perspective-1000">
                <div className="relative" style={{ transform: 'rotateX(6deg) rotateY(-4deg)', transformStyle: 'preserve-3d' }}>

                    {/* Back Card */}
                    <div
                        className="absolute bg-white rounded-xl shadow-sm border border-gray-100 animate-float-slow"
                        style={{
                            width: '240px',
                            height: '100px',
                            transform: 'translateZ(-15px) translateY(-8px) translateX(8px)',
                            animationDelay: '0s',
                        }}
                    />

                    {/* Middle Card */}
                    <div
                        className="absolute bg-white rounded-xl shadow-md border border-gray-100 animate-float-slow"
                        style={{
                            width: '240px',
                            height: '100px',
                            transform: 'translateZ(-8px) translateY(-4px) translateX(4px)',
                            animationDelay: '0.2s',
                        }}
                    />

                    {/* Front Card - Main content */}
                    <div
                        className="relative bg-white rounded-xl shadow-lg border border-gray-100 animate-float-slow"
                        style={{
                            width: '240px',
                            height: '100px',
                            animationDelay: '0.4s',
                        }}
                    >
                        <div className="p-3">
                            {/* Schedule Rows */}
                            <div className="space-y-2">
                                {scheduleData.map((row) => (
                                    <div key={row.key} className="flex items-center gap-2">
                                        {/* Toggle Switch */}
                                        <button
                                            onClick={() => setToggles(prev => ({ ...prev, [row.key]: !prev[row.key] }))}
                                            className={`relative w-8 h-5 rounded-full transition-colors duration-300 flex-shrink-0 ${toggles[row.key] ? 'bg-gray-900' : 'bg-gray-200'
                                                }`}
                                        >
                                            <div
                                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${toggles[row.key] ? 'translate-x-3.5' : 'translate-x-0.5'
                                                    }`}
                                            />
                                        </button>

                                        {/* Day */}
                                        <span className={`w-7 text-xs font-medium ${toggles[row.key] ? 'text-gray-900' : 'text-gray-400'}`}>
                                            {row.day}
                                        </span>

                                        {/* Start Time */}
                                        <div className={`px-2 py-1 rounded border text-[10px] ${toggles[row.key]
                                                ? 'bg-white border-gray-200 text-gray-700'
                                                : 'bg-gray-50 border-gray-100 text-gray-400'
                                            }`}>
                                            {row.start}
                                        </div>

                                        <span className="text-gray-300 text-xs">–</span>

                                        {/* End Time */}
                                        <div className={`px-2 py-1 rounded border text-[10px] ${toggles[row.key]
                                                ? 'bg-white border-gray-200 text-gray-700'
                                                : 'bg-gray-50 border-gray-100 text-gray-400'
                                            }`}>
                                            {row.end}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes float-slow {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-4px);
                    }
                }
                .animate-float-slow {
                    animation: float-slow 3s ease-in-out infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
};

export default HeroScene3D;

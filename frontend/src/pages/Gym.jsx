import { useState } from 'react';
import { useApp } from '../context/AppContext';

// IST Date helpers
const getISTDate = () => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    return new Date(utc + IST_OFFSET);
};

const getISTDateString = (date = new Date()) => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + IST_OFFSET);
    return `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}`;
};

const getCurrentWeekDays = () => {
    const istNow = getISTDate();
    const dayOfWeek = istNow.getDay();
    const mondayAdjust = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(istNow);
    monday.setDate(istNow.getDate() + mondayAdjust);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayStr = getISTDateString();

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = getISTDateString(date);
        days.push({ name: dayNames[i], dateString: dateStr, isToday: dateStr === todayStr, isFuture: dateStr > todayStr });
    }
    return days;
};

const Gym = () => {
    const { user, workouts, activities, logActivity, addWorkout, editWorkout, deleteWorkout, logWorkout } = useApp();
    const [showAddWorkout, setShowAddWorkout] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [newExercises, setNewExercises] = useState('');
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [expandedWorkout, setExpandedWorkout] = useState(null);

    const handleAddWorkout = () => {
        if (!newWorkoutName.trim()) return;
        addWorkout(newWorkoutName.trim(), '💪', newExercises.split(',').map(e => e.trim()).filter(Boolean));
        setNewWorkoutName(''); setNewExercises(''); setShowAddWorkout(false);
    };

    const saveWorkoutEdit = (workoutId) => {
        editWorkout(workoutId, { name: newWorkoutName, exercises: newExercises.split(',').map(e => e.trim()).filter(Boolean) });
        setEditingWorkout(null); setNewWorkoutName(''); setNewExercises('');
    };

    const weekDays = getCurrentWeekDays();

    const getGymDaysThisWeek = () => {
        const weekStart = weekDays[0].dateString;
        const weekEnd = weekDays[6].dateString;
        const gymDates = new Set();
        activities.forEach(activity => {
            if (activity.type === 'gym') {
                const activityDate = getISTDateString(new Date(activity.date));
                if (activityDate >= weekStart && activityDate <= weekEnd) gymDates.add(activityDate);
            }
        });
        return gymDates;
    };

    const gymDaysSet = getGymDaysThisWeek();
    const gymGoal = user?.settings?.weeklyGymGoal || 5;
    const gymDaysCount = gymDaysSet.size;
    const progressPercent = Math.min(100, (gymDaysCount / gymGoal) * 100);
    const totalSessions = workouts.reduce((sum, w) => sum + w.timesCompleted, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Gym & Health</h1>
                <p className="text-sm text-zinc-500">Track your fitness journey and workout routines</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">This Week</p>
                    <p className="stat-value text-amber-400">{gymDaysCount}<span className="text-zinc-500 text-lg">/{gymGoal}</span></p>
                    <p className="stat-sublabel">sessions</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Routines</p>
                    <p className="stat-value">{workouts.length}</p>
                    <p className="stat-sublabel">created</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Total Sessions</p>
                    <p className="stat-value text-emerald-400">{totalSessions}</p>
                    <p className="stat-sublabel">completed</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Progress</p>
                    <p className="stat-value">{Math.round(progressPercent)}%</p>
                    <p className="stat-sublabel">weekly goal</p>
                </div>
            </div>

            {/* Weekly Overview */}
            <div className="glass-card p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-base font-semibold text-white">Weekly Goal</h3>
                        <p className="text-xs text-zinc-500">{gymDaysCount} of {gymGoal} sessions this week</p>
                    </div>
                    <button onClick={() => logActivity('gym', { notes: 'Gym session' })} className="btn-primary text-sm w-full sm:w-auto">Log Session +20 XP</button>
                </div>

                <div className="progress-bar h-2.5 mb-5">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {weekDays.map((day, index) => {
                        const hasGym = gymDaysSet.has(day.dateString);
                        return (
                            <div key={index} className={`p-2 sm:p-3 rounded-lg text-center transition-all relative ${hasGym ? 'bg-emerald-500/10 border border-emerald-500/30' : day.isFuture ? 'bg-[#0a0a0a] border border-[#111111] opacity-40' : 'bg-[#0a0a0a] border border-[#111111]'} ${day.isToday ? 'ring-2 ring-violet-500/50' : ''}`}>
                                <p className="text-[10px] sm:text-xs font-medium text-zinc-500 mb-1 sm:mb-2">{day.name}</p>
                                <div className={`w-3 h-3 sm:w-4 sm:h-4 mx-auto rounded-full ${hasGym ? 'bg-emerald-500' : 'bg-[#1a1a1a]'}`}></div>
                                {day.isToday && <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full"></span>}
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-zinc-600 mt-4 text-center">IST · Today: <span className="text-violet-400 font-medium">{weekDays.find(d => d.isToday)?.name}</span> · {gymDaysCount >= gymGoal ? <span className="text-emerald-400">Goal reached!</span> : `${gymGoal - gymDaysCount} more to goal`}</p>
            </div>

            {/* Workout Routines */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-base font-semibold text-white">Workout Routines</h3>
                        <p className="text-xs text-zinc-500">{workouts.length} routines · {totalSessions} total sessions</p>
                    </div>
                    <button onClick={() => setShowAddWorkout(true)} className="btn-secondary text-xs">+ Add Routine</button>
                </div>

                {showAddWorkout && (
                    <div className="mb-5 p-4 bg-[#0a0a0a] rounded-lg border border-[#1a1a1a] space-y-3">
                        <input type="text" value={newWorkoutName} onChange={(e) => setNewWorkoutName(e.target.value)} placeholder="Routine name (e.g., Push Day, HIIT)" className="input-field" />
                        <input type="text" value={newExercises} onChange={(e) => setNewExercises(e.target.value)} placeholder="Exercises (comma-separated)" className="input-field" />
                        <div className="flex gap-2">
                            <button onClick={handleAddWorkout} className="btn-primary text-xs">Add Routine</button>
                            <button onClick={() => setShowAddWorkout(false)} className="btn-secondary text-xs">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {workouts.map((workout) => (
                        <div key={workout.id} className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#111111] hover:border-[#1a1a1a] transition-all">
                            {editingWorkout === workout.id ? (
                                <div className="p-4 space-y-3">
                                    <input type="text" value={newWorkoutName} onChange={(e) => setNewWorkoutName(e.target.value)} className="input-field" placeholder="Routine name" />
                                    <input type="text" value={newExercises} onChange={(e) => setNewExercises(e.target.value)} className="input-field" placeholder="Exercises" />
                                    <div className="flex gap-2">
                                        <button onClick={() => saveWorkoutEdit(workout.id)} className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold">Save</button>
                                        <button onClick={() => setEditingWorkout(null)} className="flex-1 py-2 bg-[#111111] text-zinc-400 rounded-lg text-xs">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 cursor-pointer" onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-sm font-semibold text-white">{workout.name}</h4>
                                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => { setEditingWorkout(workout.id); setNewWorkoutName(workout.name); setNewExercises(workout.exercises.join(', ')); }} className="text-xs text-zinc-600 hover:text-white font-medium">Edit</button>
                                                <button onClick={() => deleteWorkout(workout.id)} className="text-xs text-zinc-600 hover:text-red-400 font-medium">Del</button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-zinc-500"><span className="text-white font-medium">{workout.exercises.length}</span> exercises · <span className="text-amber-400 font-medium">{workout.timesCompleted}</span> times</p>
                                    </div>

                                    {expandedWorkout === workout.id && (
                                        <div className="border-t border-[#111111] p-4 bg-black space-y-2">
                                            {workout.exercises.length === 0 ? (
                                                <p className="text-xs text-zinc-600 text-center py-2">No exercises added</p>
                                            ) : (
                                                workout.exercises.map((exercise, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-sm">
                                                        <span className="w-6 h-6 bg-[#111111] text-zinc-500 rounded flex items-center justify-center text-xs font-semibold">{i + 1}</span>
                                                        <span className="text-white">{exercise}</span>
                                                    </div>
                                                ))
                                            )}
                                            <button onClick={() => logWorkout(workout.id)} className="w-full mt-3 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition-all">Complete Workout +20 XP</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {workouts.length === 0 && <p className="text-center text-zinc-600 py-8 text-sm">No routines yet. Create your first workout routine above.</p>}
            </div>

            {/* Quick Log */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Quick Log</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[{ label: 'Cardio', notes: 'Cardio session' }, { label: 'Weights', notes: 'Weight training' }, { label: 'Yoga', notes: 'Yoga session' }, { label: 'Swimming', notes: 'Swimming workout' }].map((item) => (
                        <button key={item.label} onClick={() => logActivity('gym', { notes: item.notes })} className="glass-card-hover p-4 text-center">
                            <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                            <p className="text-xs font-semibold font-mono text-emerald-400">+20 XP</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gym;

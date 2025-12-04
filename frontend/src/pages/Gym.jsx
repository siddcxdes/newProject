import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Gym = () => {
    const { user, workouts, logActivity, addWorkout, editWorkout, deleteWorkout, logWorkout } = useApp();

    const [showAddWorkout, setShowAddWorkout] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [newWorkoutIcon, setNewWorkoutIcon] = useState('💪');
    const [newExercises, setNewExercises] = useState('');
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [expandedWorkout, setExpandedWorkout] = useState(null);

    const icons = ['💪', '🏋️', '🦵', '🏃', '🔥', '🧘', '🚴', '🏊', '⚡', '🎯'];

    const handleAddWorkout = () => {
        if (!newWorkoutName.trim()) return;
        const exercises = newExercises.split(',').map(e => e.trim()).filter(Boolean);
        addWorkout(newWorkoutName.trim(), newWorkoutIcon, exercises);
        setNewWorkoutName('');
        setNewExercises('');
        setShowAddWorkout(false);
    };

    const handleEditWorkout = (workout) => {
        if (editingWorkout === workout.id) {
            setEditingWorkout(null);
        } else {
            setEditingWorkout(workout.id);
            setNewWorkoutName(workout.name);
            setNewWorkoutIcon(workout.icon);
            setNewExercises(workout.exercises.join(', '));
        }
    };

    const saveWorkoutEdit = (workoutId) => {
        const exercises = newExercises.split(',').map(e => e.trim()).filter(Boolean);
        editWorkout(workoutId, { name: newWorkoutName, icon: newWorkoutIcon, exercises });
        setEditingWorkout(null);
        setNewWorkoutName('');
        setNewExercises('');
    };

    // Get this week's days
    const getWeekDays = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date().getDay();
        const adjustedToday = today === 0 ? 6 : today - 1; // Adjust for Monday start

        return days.map((day, index) => ({
            name: day,
            active: index < (user?.stats?.gymDaysThisWeek || 0),
            isToday: index === adjustedToday
        }));
    };

    const weekDays = getWeekDays();
    const gymGoal = user?.settings?.weeklyGymGoal || 5;
    const gymDays = user?.stats?.gymDaysThisWeek || 0;
    const progressPercent = Math.min(100, (gymDays / gymGoal) * 100);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">🏋️ Gym & Health</h1>
                <p className="text-slate-400">Track your fitness journey and workout routines</p>
            </div>

            {/* Weekly Overview */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Weekly Goal</h3>
                        <p className="text-slate-400">{gymDays}/{gymGoal} gym sessions this week</p>
                    </div>
                    <button
                        onClick={() => logActivity('gym', { notes: 'Quick gym session' })}
                        className="btn-primary"
                    >
                        Log Gym Session +20 XP
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="progress-bar h-4">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                        {gymDays >= gymGoal
                            ? '🎉 Weekly goal achieved!'
                            : `${gymGoal - gymDays} more sessions to hit your goal`}
                    </p>
                </div>

                {/* Week Visualization */}
                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-xl text-center transition-all ${day.active
                                    ? 'bg-green-500/20 border-2 border-green-500'
                                    : 'bg-white/5 border-2 border-transparent'
                                } ${day.isToday ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                        >
                            <p className="text-xs text-slate-400 mb-1">{day.name}</p>
                            <span className="text-lg">{day.active ? '✅' : '⚪'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Workout Routines */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Workout Routines</h3>
                        <p className="text-slate-400">Manage your workout plans</p>
                    </div>
                    <button
                        onClick={() => setShowAddWorkout(true)}
                        className="btn-secondary"
                    >
                        + Add Routine
                    </button>
                </div>

                {/* Add Workout Form */}
                {showAddWorkout && (
                    <div className="mb-6 p-4 bg-white/5 rounded-xl space-y-4">
                        <h4 className="text-white font-medium">New Workout Routine</h4>

                        {/* Icon Selection */}
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Choose Icon</label>
                            <div className="flex gap-2 flex-wrap">
                                {icons.map(icon => (
                                    <button
                                        key={icon}
                                        onClick={() => setNewWorkoutIcon(icon)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${newWorkoutIcon === icon
                                                ? 'bg-purple-500 ring-2 ring-purple-300'
                                                : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Input */}
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Routine Name</label>
                            <input
                                type="text"
                                value={newWorkoutName}
                                onChange={(e) => setNewWorkoutName(e.target.value)}
                                placeholder="e.g., Upper Body, HIIT Training"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Exercises Input */}
                        <div>
                            <label className="text-sm text-slate-400 block mb-2">Exercises (comma-separated)</label>
                            <input
                                type="text"
                                value={newExercises}
                                onChange={(e) => setNewExercises(e.target.value)}
                                placeholder="e.g., Bench Press, Skull Crushers, Lateral Raises"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleAddWorkout} className="btn-primary">Add Routine</button>
                            <button onClick={() => setShowAddWorkout(false)} className="btn-secondary">Cancel</button>
                        </div>
                    </div>
                )}

                {/* Workouts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workouts.map((workout) => (
                        <div
                            key={workout.id}
                            className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all"
                        >
                            {editingWorkout === workout.id ? (
                                // Edit Mode
                                <div className="p-4 space-y-3">
                                    <div className="flex gap-2 flex-wrap">
                                        {icons.map(icon => (
                                            <button
                                                key={icon}
                                                onClick={() => setNewWorkoutIcon(icon)}
                                                className={`w-8 h-8 rounded flex items-center justify-center ${newWorkoutIcon === icon ? 'bg-purple-500' : 'bg-white/10'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={newWorkoutName}
                                        onChange={(e) => setNewWorkoutName(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                        placeholder="Routine name"
                                    />
                                    <input
                                        type="text"
                                        value={newExercises}
                                        onChange={(e) => setNewExercises(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                                        placeholder="Exercises (comma-separated)"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveWorkoutEdit(workout.id)}
                                            className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingWorkout(null)}
                                            className="flex-1 py-2 bg-slate-500/20 text-slate-400 rounded-lg text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div
                                        className="p-4 cursor-pointer hover:bg-white/5"
                                        onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{workout.icon}</span>
                                                <div>
                                                    <h4 className="text-white font-medium">{workout.name}</h4>
                                                    <p className="text-xs text-slate-400">
                                                        {workout.exercises.length} exercises • Done {workout.timesCompleted}x
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditWorkout(workout);
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-purple-400"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteWorkout(workout.id);
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-red-400"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Exercises */}
                                    {expandedWorkout === workout.id && (
                                        <div className="border-t border-white/10 p-4 bg-black/20 space-y-2">
                                            <p className="text-sm text-slate-300 font-medium mb-2">Exercises:</p>
                                            {workout.exercises.length === 0 ? (
                                                <p className="text-sm text-slate-500">No exercises added yet</p>
                                            ) : (
                                                workout.exercises.map((exercise, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm">
                                                        <span className="w-5 h-5 bg-purple-500/20 text-purple-400 rounded flex items-center justify-center text-xs">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-white">{exercise}</span>
                                                    </div>
                                                ))
                                            )}
                                            <button
                                                onClick={() => logWorkout(workout.id)}
                                                className="w-full mt-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all"
                                            >
                                                ✓ Complete Workout (+20 XP)
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {workouts.length === 0 && (
                    <div className="text-center py-8">
                        <span className="text-4xl mb-4 block">🏋️</span>
                        <p className="text-slate-500">No workout routines yet. Add your first one!</p>
                    </div>
                )}
            </div>

            {/* Quick Log */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Log</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: '🏃', label: 'Cardio', notes: 'Cardio session' },
                        { icon: '🏋️', label: 'Weights', notes: 'Weight training' },
                        { icon: '🧘', label: 'Yoga', notes: 'Yoga session' },
                        { icon: '🏊', label: 'Swimming', notes: 'Swimming workout' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => logActivity('gym', { notes: item.notes })}
                            className="glass-card-hover p-4 text-center"
                        >
                            <span className="text-3xl block mb-2">{item.icon}</span>
                            <span className="text-sm text-white">{item.label}</span>
                            <span className="text-xs text-green-400 block">+20 XP</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gym;

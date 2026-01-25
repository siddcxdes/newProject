import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatTime, getTimeStatus } from '../utils/timeUtils';

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
    const {
        user, workouts, activities, logActivity, addWorkout, editWorkout,
        deleteWorkout, logWorkout, recipes, updateSettings, nutritionLogs, updateNutritionLog, showNotification
    } = useApp();

    const [activeTab, setActiveTab] = useState('gym');
    const [showAddWorkout, setShowAddWorkout] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [newExercises, setNewExercises] = useState('');
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [expandedWorkout, setExpandedWorkout] = useState(null);

    // Scheduling state
    const [scheduledTime, setScheduledTime] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedWorkoutForSchedule, setSelectedWorkoutForSchedule] = useState(null);

    // Nutrition Goals
    const [goals, setGoalsState] = useState({
        calories: user?.settings?.dailyCalorieGoal || 2200,
        protein: user?.settings?.dailyProteinGoal || 160
    });

    const todayStr = getISTDateString();

    // Nutrition State - map recipes to daily slots
    const [nutrition, setNutrition] = useState(() => {
        // Hydrate from context if available
        if (nutritionLogs && nutritionLogs[todayStr]) {
            return nutritionLogs[todayStr];
        }

        const getMeal = (cat) => {
            const r = recipes.find(rec => rec.category?.toLowerCase() === cat.toLowerCase());
            return r ? {
                name: r.name,
                cals: Number(r.calories || r.cals || 0),
                prot: Number(r.protein || r.prot || 0),
                completed: false
            } : { name: 'No Meal Set', cals: 0, prot: 0, completed: false };
        };

        return {
            calories: 0,
            protein: 0,
            meals: {
                breakfast: getMeal('breakfast'),
                lunch: getMeal('lunch'),
                'pre-gym': getMeal('pre-gym'),
                dinner: getMeal('dinner'),
            }
        };
    });

    // Helper to update both local and global state
    const updateNutritionAndPersist = (newNutrition) => {
        setNutrition(newNutrition);
        updateNutritionLog(todayStr, newNutrition);
    };

    const assignRecipe = (recipe) => {
        const category = recipe.category?.toLowerCase() || 'other';
        const recipeCals = Number(recipe.calories || recipe.cals || 0);
        const recipeProt = Number(recipe.protein || recipe.prot || 0);

        const currentItem = nutrition.meals[category];
        const wasCompleted = currentItem?.completed || false;
        const newMeals = { ...nutrition.meals };

        newMeals[category] = {
            name: recipe.name,
            cals: recipeCals,
            prot: recipeProt,
            completed: false
        };

        const newNutrition = {
            ...nutrition,
            calories: Math.max(0, nutrition.calories - (wasCompleted ? (currentItem?.cals || 0) : 0)),
            protein: Math.max(0, nutrition.protein - (wasCompleted ? (currentItem?.prot || 0) : 0)),
            meals: newMeals
        };

        updateNutritionAndPersist(newNutrition);
        showNotification(`Assigned to ${recipe.category}`, 'success');
    };

    const removeRecipe = (e, category) => {
        e.stopPropagation();
        const currentItem = nutrition.meals[category];
        const wasCompleted = currentItem?.completed || false;
        const newMeals = { ...nutrition.meals };

        newMeals[category] = { name: 'No Meal Set', cals: 0, prot: 0, completed: false };

        const newNutrition = {
            ...nutrition,
            calories: Math.max(0, nutrition.calories - (wasCompleted ? (currentItem?.cals || 0) : 0)),
            protein: Math.max(0, nutrition.protein - (wasCompleted ? (currentItem?.prot || 0) : 0)),
            meals: newMeals
        };

        updateNutritionAndPersist(newNutrition);
    };

    const toggleMeal = (mealType) => {
        const meal = nutrition.meals[mealType];
        if (!meal || meal.name === 'No Meal Set') return;

        const isCompleting = !meal.completed;
        const mealCals = Number(meal.cals || 0);
        const mealProt = Number(meal.prot || 0);

        const newNutrition = {
            ...nutrition,
            calories: Math.max(0, nutrition.calories + (isCompleting ? mealCals : -mealCals)),
            protein: Math.max(0, nutrition.protein + (isCompleting ? mealProt : -mealProt)),
            meals: {
                ...nutrition.meals,
                [mealType]: { ...meal, completed: isCompleting }
            }
        };

        updateNutritionAndPersist(newNutrition);

        if (!meal.completed) {
            logActivity('diet', {
                mealType,
                notes: `${meal.name}`
            });
        }
    };

    const handleAddWorkout = () => {
        if (!newWorkoutName.trim()) return;
        addWorkout(newWorkoutName.trim(), '💪', newExercises.split(',').map(e => e.trim()).filter(Boolean));
        setNewWorkoutName(''); setNewExercises(''); setShowAddWorkout(false);
    };

    const saveWorkoutEdit = (workoutId) => {
        editWorkout(workoutId, { name: newWorkoutName, exercises: newExercises.split(',').map(e => e.trim()).filter(Boolean) });
        setEditingWorkout(null); setNewWorkoutName(''); setNewExercises('');
    };

    const handleScheduleWorkout = (workout) => {
        setSelectedWorkoutForSchedule(workout);
        setShowScheduleModal(true);
    };

    const confirmSchedule = () => {
        if (!scheduledTime || !selectedWorkoutForSchedule) return;

        logWorkout(selectedWorkoutForSchedule.id);
        logActivity('gym', {
            notes: selectedWorkoutForSchedule.name,
            scheduledTime: new Date(scheduledTime).toISOString()
        });

        setShowScheduleModal(false);
        setScheduledTime('');
        setSelectedWorkoutForSchedule(null);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-heading mb-1">Gym & Diet</h1>
                    <p className="text-sm text-muted">Manage your physical health and nutrition</p>
                </div>

                <div className="flex p-1 bg-elevated rounded-xl border border-subtle w-fit">
                    <button
                        onClick={() => setActiveTab('gym')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'gym' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-heading'}`}
                    >
                        Workout
                    </button>
                    <button
                        onClick={() => setActiveTab('diet')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === 'diet' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-heading'}`}
                    >
                        Diet
                    </button>
                </div>
            </div>

            {activeTab === 'gym' ? (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                    </div>

                    {/* Weekly Overview */}
                    <div className="glass-card p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-heading">Weekly Goal</h3>
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
                                    <div key={index} className={`p-2 sm:p-3 rounded-lg text-center transition-all relative ${hasGym ? 'bg-emerald-500/10 border border-emerald-500/30' : day.isFuture ? 'bg-elevated border border-subtle opacity-40' : 'bg-elevated border border-subtle'} ${day.isToday ? 'ring-2 ring-sky-500/50' : ''}`}>
                                        <p className="text-[10px] sm:text-xs font-medium text-zinc-500 mb-1 sm:mb-2">{day.name}</p>
                                        <div className={`w-3 h-3 sm:w-4 sm:h-4 mx-auto rounded-full ${hasGym ? 'bg-emerald-500' : 'bg-elevated'}`}></div>
                                        {day.isToday && <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full"></span>}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-zinc-600 mt-4 text-center">IST · Today: <span className="text-sky-400 font-medium">{weekDays.find(d => d.isToday)?.name}</span> · {gymDaysCount >= gymGoal ? <span className="text-emerald-400">Goal reached!</span> : `${gymGoal - gymDaysCount} more to goal`}</p>
                    </div>

                    {/* Workout Routines */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-semibold text-heading">Workout Routines</h3>
                                <p className="text-xs text-zinc-500">{workouts.length} routines · {totalSessions} total sessions</p>
                            </div>
                            <button onClick={() => setShowAddWorkout(true)} className="btn-secondary text-xs">+ Add Routine</button>
                        </div>

                        {showAddWorkout && (
                            <div className="mb-5 p-4 bg-elevated rounded-lg border border-subtle space-y-3">
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
                                <div key={workout.id} className="bg-elevated rounded-xl overflow-hidden border border-subtle hover:border-subtle transition-all">
                                    {editingWorkout === workout.id ? (
                                        <div className="p-4 space-y-3">
                                            <input type="text" value={newWorkoutName} onChange={(e) => setNewWorkoutName(e.target.value)} className="input-field" placeholder="Routine name" />
                                            <input type="text" value={newExercises} onChange={(e) => setNewExercises(e.target.value)} className="input-field" placeholder="Exercises" />
                                            <div className="flex gap-2">
                                                <button onClick={() => saveWorkoutEdit(workout.id)} className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold">Save</button>
                                                <button onClick={() => setEditingWorkout(null)} className="flex-1 py-2 bg-elevated text-zinc-400 rounded-lg text-xs">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 cursor-pointer" onClick={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-semibold text-heading">{workout.name}</h4>
                                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button onClick={() => { setEditingWorkout(workout.id); setNewWorkoutName(workout.name); setNewExercises(workout.exercises.join(', ')); }} className="text-xs text-zinc-600 hover:text-heading font-medium">Edit</button>
                                                        <button onClick={() => deleteWorkout(workout.id)} className="text-xs text-zinc-600 hover:text-red-400 font-medium">Del</button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-zinc-500"><span className="text-heading font-medium">{workout.exercises.length}</span> exercises · <span className="text-amber-400 font-medium">{workout.timesCompleted}</span> times</p>
                                            </div>

                                            {expandedWorkout === workout.id && (
                                                <div className="border-t border-subtle p-4 bg-elevated space-y-2">
                                                    {workout.exercises.length === 0 ? (
                                                        <p className="text-xs text-zinc-600 text-center py-2">No exercises added</p>
                                                    ) : (
                                                        workout.exercises.map((exercise, i) => (
                                                            <div key={i} className="flex items-center gap-3 text-sm">
                                                                <span className="w-6 h-6 bg-elevated text-zinc-500 rounded flex items-center justify-center text-xs font-semibold">{i + 1}</span>
                                                                <span className="text-heading">{exercise}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                        <button onClick={() => logWorkout(workout.id)} className="py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition-all">Complete Now +20 XP</button>
                                                        <button onClick={() => handleScheduleWorkout(workout)} className="py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg text-xs font-semibold transition-all">Schedule</button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {workouts.length === 0 && <p className="text-center text-zinc-600 py-8 text-sm">No routines yet. Create your first workout routine above.</p>}
                </>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Nutrition Overview */}
                    <div className="glass-card p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-semibold text-heading">Daily Totals</h3>
                                <p className="text-xs text-zinc-500">Tracked for today</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500">Calories</p>
                                    <div className="flex items-center justify-end gap-1.5">
                                        <p className="text-sm font-semibold text-orange-400">{Math.round(nutrition.calories)}</p>
                                        <span className="text-zinc-600 text-sm">/</span>
                                        <input
                                            type="number"
                                            value={goals.calories}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setGoalsState(prev => ({ ...prev, calories: val }));
                                                updateSettings({ dailyCalorieGoal: val });
                                            }}
                                            className="w-14 bg-transparent border-b border-transparent hover:border-subtle focus:border-sky-500 text-sm font-semibold text-zinc-400 outline-none transition-all text-center"
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500">Protein</p>
                                    <div className="flex items-center justify-end gap-1.5">
                                        <p className="text-sm font-semibold text-blue-400">{Math.round(nutrition.protein)}g</p>
                                        <span className="text-zinc-600 text-sm">/</span>
                                        <input
                                            type="number"
                                            value={goals.protein}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setGoalsState(prev => ({ ...prev, protein: val }));
                                                updateSettings({ dailyProteinGoal: val });
                                            }}
                                            className="w-10 bg-transparent border-b border-transparent hover:border-subtle focus:border-sky-500 text-sm font-semibold text-zinc-400 outline-none transition-all text-center"
                                        />
                                        <span className="text-zinc-600 text-sm font-semibold -ml-1">g</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(nutrition.meals).map(([type, meal]) => (
                                <div key={type} onClick={() => toggleMeal(type)} className={`p-4 rounded-xl border transition-all group relative ${meal.name === 'No Meal Set' ? 'bg-elevated/50 border-dashed border-subtle' : meal.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-elevated border-subtle hover:border-zinc-600 cursor-pointer'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{type}</p>
                                        <div className="flex items-center gap-2">
                                            {meal.completed && <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1">✓ EATEN</span>}
                                            {meal.name !== 'No Meal Set' && (
                                                <button onClick={(e) => removeRecipe(e, type)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded transition-all text-zinc-500 hover:text-red-400">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-sm font-medium ${meal.name === 'No Meal Set' ? 'text-zinc-600' : meal.completed ? 'text-emerald-300 line-through' : 'text-heading'}`}>{meal.name}</h4>
                                        <div className="text-right">
                                            <p className="text-[10px] text-zinc-500">{meal.cals > 0 ? `${meal.cals} kcal` : ' '}</p>
                                            <p className="text-[10px] text-zinc-600">{meal.prot > 0 ? `${meal.prot}g prot` : ' '}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recipe Quick List */}
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-4">Your Recipes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {recipes.map(recipe => (
                                <div
                                    key={recipe.id}
                                    onClick={() => assignRecipe(recipe)}
                                    className="p-3 bg-elevated rounded-lg border border-subtle hover:border-zinc-500 hover:bg-zinc-800/50 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-medium text-heading group-hover:text-white">{recipe.name}</h4>
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 group-hover:text-zinc-300 font-bold uppercase tracking-wider">{recipe.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-zinc-500">{recipe.calories} kcal · {recipe.protein}g protein</p>
                                        <span className="opacity-0 group-hover:opacity-100 text-sky-400 text-[10px] font-bold">+ ADD</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-heading mb-4">Schedule Workout</h3>
                        <p className="text-sm text-zinc-400 mb-4">When do you plan to do <span className="text-heading font-medium">{selectedWorkoutForSchedule?.name}</span>?</p>

                        <input
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="input-field mb-4"
                        />

                        <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3 mb-4">
                            <p className="text-xs text-sky-400">
                                ⏰ Complete on time: <span className="font-semibold">+20 XP</span>
                            </p>
                            <p className="text-xs text-orange-400 mt-1">
                                ⚠️ Complete late: <span className="font-semibold">+10 XP (50% penalty)</span>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={confirmSchedule} disabled={!scheduledTime} className="flex-1 btn-primary text-sm">Schedule</button>
                            <button onClick={() => { setShowScheduleModal(false); setScheduledTime(''); setSelectedWorkoutForSchedule(null); }} className="flex-1 btn-secondary text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gym;

import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Admin = () => {
    const {
        user, activities, learningDomains, workouts, recipes, goals, settings,
        setLearningDomains, setRecipes, setWorkouts, updateSettings, showNotification, resetAll, forceSyncNow
    } = useApp();

    const [activeTab, setActiveTab] = useState('overview');
    const [jsonInput, setJsonInput] = useState('');
    const [recipeJsonInput, setRecipeJsonInput] = useState('');
    const [workoutJsonInput, setWorkoutJsonInput] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isImportingRecipes, setIsImportingRecipes] = useState(false);
    const [isImportingWorkouts, setIsImportingWorkouts] = useState(false);

    // Timed Tasks Settings State
    const [timedTasksConfig, setTimedTasksConfig] = useState(settings?.timedTasks || {
        gym: { startHour: 9, startMinute: 0, endHour: 11, endMinute: 0, points: 30 },
        breakfast: { startHour: 8, startMinute: 0, endHour: 9, endMinute: 0, points: 20 },
        lunch: { startHour: 12, startMinute: 0, endHour: 13, endMinute: 0, points: 20 },
        snack: { startHour: 16, startMinute: 0, endHour: 17, endMinute: 0, points: 15 },
        dinner: { startHour: 20, startMinute: 0, endHour: 21, endMinute: 0, points: 20 },
    });

    const saveTimedTasksConfig = () => {
        const newSettings = { ...settings, timedTasks: timedTasksConfig };
        updateSettings(newSettings);
        showNotification('Timed tasks settings saved!', 'success');
        if (typeof forceSyncNow === 'function') {
            forceSyncNow();
        }
    };

    const updateTaskTime = (taskName, field, value) => {
        setTimedTasksConfig(prev => ({
            ...prev,
            [taskName]: {
                ...prev[taskName],
                [field]: parseInt(value) || 0
            }
        }));
    };

    const handleExport = () => {
        const data = {
            user, activities, learningDomains, workouts, goals,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascension_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully');
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                JSON.parse(event.target?.result);
                showNotification('Data imported! Refresh to see changes.');
            } catch {
                showNotification('Failed to import data', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleBulkJsonImport = () => {
        if (isImporting) return;
        setIsImporting(true);

        try {
            let parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) {
                parsed = [parsed];
            }

            let newDomains = [...learningDomains];
            let totalItems = 0;
            let newDomainsCount = 0;

            for (const item of parsed) {
                const domainName = item.domain || item.subject;
                const shortName = item.shortName || item['short name'] || domainName;

                if (!domainName) {
                    throw new Error('Missing "domain" field');
                }

                let domainIndex = newDomains.findIndex(d =>
                    d.name.toLowerCase() === domainName.toLowerCase() ||
                    d.shortName.toLowerCase() === shortName.toLowerCase()
                );

                if (domainIndex === -1) {
                    const type = /dsa|data.?struct|algorithm|leetcode|array|tree|graph/i.test(domainName)
                        ? 'problem-based' : 'module-based';

                    const newDomain = {
                        id: `domain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: domainName,
                        shortName: shortName,
                        icon: '',
                        color: 'violet',
                        type: type,
                        xpPerItem: type === 'problem-based' ? { easy: 10, medium: 25, hard: 50 } : 30,
                        topics: []
                    };
                    newDomains.push(newDomain);
                    domainIndex = newDomains.length - 1;
                    newDomainsCount++;
                }

                const topicsArray = Array.isArray(item.topics) ? item.topics : (item.topics ? [item.topics] : []);

                for (const topicName of topicsArray) {
                    if (!topicName) continue;

                    let topicIndex = newDomains[domainIndex].topics.findIndex(t =>
                        t.name.toLowerCase() === topicName.toLowerCase()
                    );

                    if (topicIndex === -1) {
                        const newTopic = {
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            name: topicName,
                            icon: '',
                            completed: 0,
                            total: 0,
                            items: []
                        };
                        newDomains[domainIndex].topics.push(newTopic);
                        topicIndex = newDomains[domainIndex].topics.length - 1;
                    }

                    const subtopicsArray = Array.isArray(item.subtopics) ? item.subtopics : (item.subtopics ? [item.subtopics] : []);

                    for (const itemName of subtopicsArray) {
                        if (!itemName) continue;

                        const itemExists = newDomains[domainIndex].topics[topicIndex].items.some(i =>
                            i.name.toLowerCase() === itemName.toLowerCase()
                        );

                        if (!itemExists) {
                            const newItem = {
                                id: Date.now() + Math.floor(Math.random() * 10000),
                                name: itemName,
                                difficulty: newDomains[domainIndex].type === 'problem-based' ? 'medium' : undefined,
                                completed: false
                            };
                            newDomains[domainIndex].topics[topicIndex].items.push(newItem);
                            newDomains[domainIndex].topics[topicIndex].total++;
                            totalItems++;
                        }
                    }
                }
            }

            setLearningDomains(newDomains);

            if (typeof forceSyncNow === 'function') {
                forceSyncNow();
            }

            setJsonInput('');
            showNotification(`Imported ${totalItems} items across ${newDomainsCount} new domains!`, 'success');
        } catch (error) {
            console.error('Import error:', error);
            showNotification(`${error.message}`, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const handleBulkRecipeImport = () => {
        if (isImportingRecipes) return;
        setIsImportingRecipes(true);

        try {
            let parsed = JSON.parse(recipeJsonInput);
            if (!Array.isArray(parsed)) {
                parsed = [parsed];
            }

            let newRecipes = [...recipes];
            let addedCount = 0;

            for (const item of parsed) {
                const name = item.name || item.recipe;
                const category = (item.category || item.meal || 'breakfast').toLowerCase();
                const calories = parseInt(item.calories || item.cal || 0);
                const protein = parseInt(item.protein || item.prot || 0);

                if (!name) {
                    throw new Error('Missing "name" field in recipe');
                }

                if (!['breakfast', 'lunch', 'snack', 'dinner'].includes(category)) {
                    throw new Error(`Invalid category "${category}". Must be: breakfast, lunch, snack, or dinner`);
                }

                const exists = newRecipes.some(r => r.name.toLowerCase() === name.toLowerCase());

                if (!exists) {
                    const newRecipe = {
                        id: Date.now() + Math.floor(Math.random() * 10000),
                        name,
                        category,
                        calories,
                        protein
                    };
                    newRecipes.push(newRecipe);
                    addedCount++;
                }
            }

            setRecipes(newRecipes);

            if (typeof forceSyncNow === 'function') {
                forceSyncNow();
            }

            setRecipeJsonInput('');
            showNotification(`Imported ${addedCount} recipes!`, 'success');
        } catch (error) {
            console.error('Recipe import error:', error);
            showNotification(`${error.message}`, 'error');
        } finally {
            setIsImportingRecipes(false);
        }
    };

    const handleBulkWorkoutImport = () => {
        if (isImportingWorkouts) return;
        setIsImportingWorkouts(true);

        try {
            let parsed = JSON.parse(workoutJsonInput);
            if (!Array.isArray(parsed)) {
                parsed = [parsed];
            }

            let newWorkouts = [...workouts];
            let addedCount = 0;

            for (const item of parsed) {
                const name = item.name || item.workout;

                if (!name) {
                    throw new Error('Missing "name" field in workout');
                }

                // Check if workout already exists
                const exists = newWorkouts.some(w => w.name.toLowerCase() === name.toLowerCase());

                if (!exists) {
                    // Handle both simple and complex workout formats
                    let exercises = [];

                    // Simple format: just an array of exercise names
                    if (Array.isArray(item.exercises) && typeof item.exercises[0] === 'string') {
                        exercises = item.exercises;
                    }
                    // Complex format: exercises with muscle groups
                    else if (Array.isArray(item.exercises) && typeof item.exercises[0] === 'object') {
                        // Flatten the complex structure for display
                        exercises = item.exercises.flatMap(group =>
                            group.movements || []
                        );
                    }
                    // String format: comma-separated
                    else if (typeof item.exercises === 'string') {
                        exercises = item.exercises.split(',').map(e => e.trim());
                    }

                    const newWorkout = {
                        id: Date.now() + Math.floor(Math.random() * 10000),
                        name,
                        icon: '',
                        exercises: exercises || [],
                        timesCompleted: 0,
                        // Store the full complex structure if available
                        ...(item.pre_workout_warmup && { preWorkoutWarmup: item.pre_workout_warmup }),
                        ...(item.post_workout_stretch && { postWorkoutStretch: item.post_workout_stretch }),
                        ...(item.exercises && typeof item.exercises[0] === 'object' && {
                            exerciseGroups: item.exercises
                        })
                    };
                    newWorkouts.push(newWorkout);
                    addedCount++;
                }
            }

            // Update state
            setWorkouts(newWorkouts);

            // Try to sync, but don't crash if it fails
            setTimeout(() => {
                try {
                    if (typeof forceSyncNow === 'function') {
                        forceSyncNow();
                    }
                } catch (syncError) {
                    console.error('Sync error:', syncError);
                    showNotification('Workouts imported but sync failed. Try manual sync.', 'warning');
                }
            }, 100);

            setWorkoutJsonInput('');
            showNotification(`Imported ${addedCount} workouts!`, 'success');
        } catch (error) {
            console.error('Workout import error:', error);
            showNotification(`Import failed: ${error.message}`, 'error');
        } finally {
            setIsImportingWorkouts(false);
        }
    };

    const exampleJson = `[
  {
    "domain": "Data Structures",
    "shortName": "DSA",
    "topics": "Array",
    "subtopics": ["Two Sum", "Best Time to Buy Stock"]
  },
  {
    "domain": "AI/ML",
    "shortName": "AI",
    "topics": "RAG",
    "subtopics": "RAG Architecture"
  }
]`;

    const exampleRecipeJson = `[
  {
    "name": "Protein Oatmeal",
    "category": "breakfast",
    "calories": 350,
    "protein": 20
  },
  {
    "name": "Grilled Chicken Bowl",
    "category": "lunch",
    "calories": 520,
    "protein": 45
  }
]`;

    const exampleWorkoutJson = `[
  {
    "name": "Push Day",
    "pre_workout_warmup": ["Arm circles – 30 sec", "Band pull-aparts – 15 reps"],
    "exercises": [
      {
        "muscle_group": "Chest",
        "movements": ["Barbell Bench Press – 4×4–6", "Incline Dumbbell Press – 3×8–10"]
      },
      {
        "muscle_group": "Shoulders",
        "movements": ["Barbell Shoulder Press – 4×5", "Dumbbell Lateral Raises – 3×12–15"]
      }
    ],
    "post_workout_stretch": ["Doorway chest stretch – 45 sec", "Overhead tricep stretch – 45 sec"]
  },
  {
    "name": "Simple Workout",
    "exercises": ["Squats", "Deadlifts", "Lunges"]
  }
]`;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'timed', label: 'Timed Tasks' },
        { id: 'bulk', label: 'Learning Import' },
        { id: 'recipes', label: 'Recipe Import' },
        { id: 'workouts', label: 'Workout Import' },
    ];

    const taskLabels = {
        gym: 'Gym / Workout',
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        snack: 'Snack',
        dinner: 'Dinner'
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-heading mb-1">Admin</h1>
                    <p className="text-sm text-zinc-500">Manage data, bulk import, and configure settings</p>
                </div>
                <button onClick={() => setShowResetConfirm(true)} className="btn-danger text-xs">Reset All Data</button>
            </div>

            {showResetConfirm && (
                <div className="fixed inset-0 bg-elevated/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-3">Reset All Data?</h3>
                        <p className="text-sm text-zinc-400 mb-5">This will permanently delete all your progress. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => { resetAll(); setShowResetConfirm(false); }} className="flex-1 py-2.5 bg-red-500 text-heading rounded-lg text-sm font-semibold hover:bg-red-600 transition-all">Reset Everything</button>
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-elevated text-zinc-400 rounded-lg text-sm font-medium hover:bg-elevated transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-1 p-1.5 bg-elevated rounded-xl border border-subtle overflow-x-auto">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-heading'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Level</p>
                        <p className="stat-value">{user?.level || 1}</p>
                        <p className="stat-sublabel text-sky-400 font-semibold">{user?.xp || 0} XP</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Learning Domains</p>
                        <p className="stat-value">{learningDomains.length}</p>
                        <p className="stat-sublabel">{learningDomains.reduce((s, d) => s + (d.topics?.length || 0), 0)} topics</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Total Items</p>
                        <p className="stat-value">{learningDomains.reduce((s, d) => s + d.topics?.reduce((ts, t) => ts + (t.items?.length || 0), 0), 0)}</p>
                        <p className="stat-sublabel">problems/modules</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Workouts</p>
                        <p className="stat-value">{workouts.length}</p>
                        <p className="stat-sublabel">{workouts.reduce((s, w) => s + w.timesCompleted, 0)} sessions</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Activities</p>
                        <p className="stat-value">{activities.length}</p>
                        <p className="stat-sublabel">logged</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Goals</p>
                        <p className="stat-value">{goals.length}</p>
                        <p className="stat-sublabel">{goals.filter(g => g.completed).length} done</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Streak</p>
                        <p className="stat-value text-amber-400">{user?.streak?.current || 0}d</p>
                        <p className="stat-sublabel">Best: {user?.streak?.longest || 0}d</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Week</p>
                        <p className="stat-value">{user?.journey?.currentWeek || 1}</p>
                        <p className="stat-sublabel">of {user?.journey?.totalWeeks || 17}</p>
                    </div>
                </div>
            )}

            {activeTab === 'timed' && (
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-2">Timed Tasks Configuration</h3>
                        <p className="text-sm text-zinc-500 mb-6">Set custom time windows and points for gym and meal tasks</p>

                        <div className="space-y-4">
                            {Object.keys(timedTasksConfig).map(taskName => (
                                <div key={taskName} className="p-4 bg-elevated rounded-lg border border-subtle">
                                    <h4 className="text-sm font-semibold text-heading mb-3">{taskLabels[taskName]}</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        <div>
                                            <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Start Hour</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={timedTasksConfig[taskName].startHour}
                                                onChange={(e) => updateTaskTime(taskName, 'startHour', e.target.value)}
                                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-heading focus:outline-none focus:border-zinc-600 transition-colors tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Start Min</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={timedTasksConfig[taskName].startMinute}
                                                onChange={(e) => updateTaskTime(taskName, 'startMinute', e.target.value)}
                                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-heading focus:outline-none focus:border-zinc-600 transition-colors tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-600 mb-1.5 block font-medium">End Hour</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={timedTasksConfig[taskName].endHour}
                                                onChange={(e) => updateTaskTime(taskName, 'endHour', e.target.value)}
                                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-heading focus:outline-none focus:border-zinc-600 transition-colors tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-600 mb-1.5 block font-medium">End Min</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={timedTasksConfig[taskName].endMinute}
                                                onChange={(e) => updateTaskTime(taskName, 'endMinute', e.target.value)}
                                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-heading focus:outline-none focus:border-zinc-600 transition-colors tabular-nums"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-600 mb-1.5 block font-medium">Points</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={timedTasksConfig[taskName].points}
                                                onChange={(e) => updateTaskTime(taskName, 'points', e.target.value)}
                                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-heading focus:outline-none focus:border-zinc-600 transition-colors tabular-nums"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-600 mt-2">
                                        Time window: {String(timedTasksConfig[taskName].startHour).padStart(2, '0')}:{String(timedTasksConfig[taskName].startMinute).padStart(2, '0')} - {String(timedTasksConfig[taskName].endHour).padStart(2, '0')}:{String(timedTasksConfig[taskName].endMinute).padStart(2, '0')} · {timedTasksConfig[taskName].points} points
                                    </p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={saveTimedTasksConfig}
                            className="mt-6 px-6 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-colors"
                        >
                            Save Timed Tasks Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Rest of the tabs remain the same... */}
            {activeTab === 'bulk' && (
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-2">Bulk JSON Import</h3>
                        <p className="text-sm text-zinc-500 mb-4">Import domains, topics, and subtopics. They sync to Academics and CheckIn.</p>

                        <div className="mb-4 p-3 bg-elevated rounded-lg border border-subtle">
                            <p className="text-xs text-zinc-500 mb-2">Required format:</p>
                            <pre className="text-xs text-emerald-400 font-mono overflow-auto">{exampleJson}</pre>
                        </div>

                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Paste your JSON here..."
                            className="input-field resize-none mb-4 font-mono text-sm"
                            rows={12}
                            disabled={isImporting}
                        />
                        <button
                            onClick={handleBulkJsonImport}
                            className="btn-primary text-sm"
                            disabled={!jsonInput.trim() || isImporting}
                        >
                            {isImporting ? 'Importing...' : 'Import JSON'}
                        </button>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-4">Current Learning Domains ({learningDomains.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-auto">
                            {learningDomains.map(domain => (
                                <div key={domain.id} className="p-3 bg-elevated rounded-lg border border-subtle">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-heading">{domain.name} ({domain.shortName})</span>
                                        <span className="text-xs text-zinc-500">{domain.topics?.length || 0} topics</span>
                                    </div>
                                    {domain.topics?.slice(0, 5).map(topic => (
                                        <div key={topic.id} className="ml-4 text-xs text-zinc-400">
                                            {topic.name} ({topic.items?.length || 0} items)
                                        </div>
                                    ))}
                                    {domain.topics?.length > 5 && (
                                        <div className="ml-4 text-xs text-zinc-600 italic">...and {domain.topics.length - 5} more topics</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'recipes' && (
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-2">Bulk Recipe Import</h3>
                        <p className="text-sm text-zinc-500 mb-4">Import recipes for diet tracking. Recipes sync to Gym page.</p>

                        <div className="mb-4 p-3 bg-elevated rounded-lg border border-subtle">
                            <p className="text-xs text-zinc-500 mb-2">Required format:</p>
                            <pre className="text-xs text-emerald-400 font-mono overflow-auto">{exampleRecipeJson}</pre>
                        </div>

                        <textarea
                            value={recipeJsonInput}
                            onChange={(e) => setRecipeJsonInput(e.target.value)}
                            placeholder="Paste your recipe JSON here..."
                            className="input-field resize-none mb-4 font-mono text-sm"
                            rows={12}
                            disabled={isImportingRecipes}
                        />
                        <button
                            onClick={handleBulkRecipeImport}
                            className="btn-primary text-sm"
                            disabled={!recipeJsonInput.trim() || isImportingRecipes}
                        >
                            {isImportingRecipes ? 'Importing...' : 'Import Recipes'}
                        </button>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-4">Current Recipes ({recipes.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-auto">
                            {recipes.map(recipe => (
                                <div key={recipe.id} className="p-3 bg-elevated rounded-lg border border-subtle">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-semibold text-heading">{recipe.name}</span>
                                            <span className="text-xs text-zinc-500 ml-2 capitalize">({recipe.category})</span>
                                        </div>
                                        <div className="flex gap-3 text-xs">
                                            <span className="text-amber-400">{recipe.calories} kcal</span>
                                            <span className="text-emerald-400">{recipe.protein}g protein</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'workouts' && (
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-2">Bulk Workout Import</h3>
                        <p className="text-sm text-zinc-500 mb-4">Import workout routines. Workouts sync to Gym page.</p>

                        <div className="mb-4 p-3 bg-elevated rounded-lg border border-subtle">
                            <p className="text-xs text-zinc-500 mb-2">Required format:</p>
                            <pre className="text-xs text-emerald-400 font-mono overflow-auto">{exampleWorkoutJson}</pre>
                        </div>

                        <textarea
                            value={workoutJsonInput}
                            onChange={(e) => setWorkoutJsonInput(e.target.value)}
                            placeholder="Paste your workout JSON here..."
                            className="input-field resize-none mb-4 font-mono text-sm"
                            rows={12}
                            disabled={isImportingWorkouts}
                        />
                        <button
                            onClick={handleBulkWorkoutImport}
                            className="btn-primary text-sm"
                            disabled={!workoutJsonInput.trim() || isImportingWorkouts}
                        >
                            {isImportingWorkouts ? 'Importing...' : 'Import Workouts'}
                        </button>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-4">Current Workouts ({workouts.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-auto">
                            {workouts.map(workout => (
                                <div key={workout.id} className="p-3 bg-elevated rounded-lg border border-subtle">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-heading">{workout.name}</span>
                                        <span className="text-xs text-zinc-500">{workout.exercises.length} exercises</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {workout.exercises.slice(0, 3).map((exercise, idx) => (
                                            <span key={idx} className="text-xs px-2 py-0.5 bg-elevated border border-subtle rounded text-zinc-400">
                                                {exercise}
                                            </span>
                                        ))}
                                        {workout.exercises.length > 3 && (
                                            <span className="text-xs px-2 py-0.5 text-zinc-600">
                                                +{workout.exercises.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;

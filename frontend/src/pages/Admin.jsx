import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Admin = () => {
    const {
        user, activities, learningDomains, workouts, goals,
        setLearningDomains, showNotification, resetAll, forceSyncNow,
        addWorkout, addRecipe, updateTimedConfig
    } = useApp();

    const [activeTab, setActiveTab] = useState('overview');
    const [jsonInput, setJsonInput] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

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

            // Build entire new domains array in memory
            let newDomains = [...learningDomains];
            let totalItems = 0;
            let newDomainsCount = 0;

            for (const item of parsed) {
                const domainName = item.domain || item.subject;
                const shortName = item.shortName || item['short name'] || domainName;

                if (!domainName) {
                    throw new Error('Missing "domain" field');
                }

                // Find existing domain
                let domainIndex = newDomains.findIndex(d =>
                    d.name.toLowerCase() === domainName.toLowerCase() ||
                    d.shortName.toLowerCase() === shortName.toLowerCase()
                );

                // Create domain if not exists
                if (domainIndex === -1) {
                    const type = /dsa|data.?struct|algorithm|leetcode|array|tree|graph/i.test(domainName)
                        ? 'problem-based' : 'module-based';

                    const newDomain = {
                        id: `domain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: domainName,
                        shortName: shortName,
                        icon: '📚',
                        color: 'violet',
                        type: type,
                        xpPerItem: type === 'problem-based' ? { easy: 10, medium: 25, hard: 50 } : 30,
                        topics: []
                    };
                    newDomains.push(newDomain);
                    domainIndex = newDomains.length - 1;
                    newDomainsCount++;
                }

                // Handle topics
                const topicsArray = Array.isArray(item.topics) ? item.topics : (item.topics ? [item.topics] : []);

                for (const topicName of topicsArray) {
                    if (!topicName) continue;

                    // Find existing topic
                    let topicIndex = newDomains[domainIndex].topics.findIndex(t =>
                        t.name.toLowerCase() === topicName.toLowerCase()
                    );

                    // Create topic if not exists
                    if (topicIndex === -1) {
                        const newTopic = {
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            name: topicName,
                            icon: '📝',
                            completed: 0,
                            total: 0,
                            items: []
                        };
                        newDomains[domainIndex].topics.push(newTopic);
                        topicIndex = newDomains[domainIndex].topics.length - 1;
                    }

                    // Handle subtopics/items
                    const subtopicsArray = Array.isArray(item.subtopics) ? item.subtopics : (item.subtopics ? [item.subtopics] : []);

                    for (const itemName of subtopicsArray) {
                        if (!itemName) continue;

                        // Check if item exists
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

            // Single state update with all changes
            setLearningDomains(newDomains);

            // Persist immediately so a refresh right after import doesn't lose the data
            if (typeof forceSyncNow === 'function') {
                forceSyncNow();
            }

            setJsonInput('');
            showNotification(`✅ Imported ${totalItems} items across ${newDomainsCount} new domains!`, 'success');
        } catch (error) {
            console.error('Import error:', error);
            showNotification(`❌ ${error.message}`, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const handleWorkoutImport = () => {
        if (isImporting) return;
        setIsImporting(true);
        try {
            const parsed = JSON.parse(jsonInput);
            const items = Array.isArray(parsed) ? parsed : [parsed];

            let count = 0;
            items.forEach(w => {
                if (!w.name) return;

                let exerciseList = [];

                // Add pre-workout if exists
                if (Array.isArray(w.pre_workout_warmup)) {
                    exerciseList.push(...w.pre_workout_warmup.map(ex => `Warmup: ${ex}`));
                } else if (Array.isArray(w.pre_workout)) {
                    exerciseList.push(...w.pre_workout.map(ex => `Warmup: ${ex}`));
                }

                // Handle exercises (can be array of strings OR array of objects)
                if (Array.isArray(w.exercises)) {
                    w.exercises.forEach(ex => {
                        if (typeof ex === 'string') {
                            exerciseList.push(ex);
                        } else if (typeof ex === 'object' && ex !== null && Array.isArray(ex.movements)) {
                            const groupPrefix = ex.muscle_group ? `[${ex.muscle_group}] ` : '';
                            ex.movements.forEach(m => exerciseList.push(`${groupPrefix}${m}`));
                        }
                    });
                }

                // Add post-workout if exists
                if (Array.isArray(w.post_workout_stretch)) {
                    exerciseList.push(...w.post_workout_stretch.map(ex => `Stretch: ${ex}`));
                }

                if (exerciseList.length > 0) {
                    addWorkout(w.name, w.icon || '💪', exerciseList);
                    count++;
                }
            });

            if (count > 0) {
                showNotification(`✅ Successfully imported ${count} workouts!`, 'success');
                setJsonInput('');
                if (typeof forceSyncNow === 'function') forceSyncNow();
            } else {
                showNotification('No valid workouts found in JSON', 'error');
            }
        } catch (e) {
            showNotification(`Invalid JSON: ${e.message}`, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const handleRecipeImport = () => {
        if (isImporting) return;
        setIsImporting(true);
        try {
            const parsed = JSON.parse(jsonInput);
            const items = Array.isArray(parsed) ? parsed : [parsed];

            let count = 0;
            items.forEach(recipe => {
                if (!recipe.name || !recipe.calories || !recipe.protein) {
                    console.warn('Skipping invalid recipe:', recipe);
                    return;
                }
                addRecipe(recipe);
                count++;
            });

            if (count > 0) {
                showNotification(`✅ Successfully imported ${count} recipes!`, 'success');
                setJsonInput('');
                if (typeof forceSyncNow === 'function') forceSyncNow();
            } else {
                showNotification('No valid recipes found in JSON', 'error');
            }
        } catch (e) {
            showNotification(`Invalid Recipe JSON: ${e.message}`, 'error');
        } finally {
            setIsImporting(false);
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

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'timed-tasks', label: 'Timed Tasks' },
        { id: 'import-learning', label: 'Learning Import' },
        { id: 'import-recipes', label: 'Recipe Import' },
        { id: 'import-workouts', label: 'Workout Import' },
    ];

    // Initialize timedConfig from user settings or defaults
    const [timedConfig, setTimedConfig] = useState(user?.settings?.timedTasks || {
        gym: { startH: 9, startM: 0, endH: 11, endM: 0, points: 30 },
        breakfast: { startH: 8, startM: 0, endH: 9, endM: 0, points: 20 },
        lunch: { startH: 12, startM: 0, endH: 13, endM: 0, points: 20 },
    });

    const handleTimedConfigChange = (task, field, value) => {
        setTimedConfig(prev => ({
            ...prev,
            [task]: { ...prev[task], [field]: parseInt(value) || 0 }
        }));
    };

    const saveTimedConfig = () => {
        updateTimedConfig(timedConfig);
        showNotification('Timed tasks configuration applied!', 'success');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-heading mb-1">Admin</h1>
                    <p className="text-sm text-zinc-500">Manage data, configurations, and imports</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="btn-secondary text-xs">Export Backup</button>
                    <label className="btn-secondary text-xs cursor-pointer">
                        Import File
                        <input type="file" onChange={handleImport} className="hidden" accept=".json" />
                    </label>
                    <button onClick={() => setShowResetConfirm(true)} className="btn-danger text-xs">Reset All</button>
                </div>
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

            <div className="flex overflow-x-auto gap-1 p-1.5 bg-elevated rounded-xl border border-subtle no-scrollbar">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-heading'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* ... stats cards ... (kept same as before, abbreviated here for brevity if replace_file content logic allows) */}
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

            {activeTab === 'timed-tasks' && (
                <div className="glass-card p-5 max-w-3xl">
                    <h3 className="text-lg font-semibold text-heading mb-4">Timed Tasks Configuration</h3>
                    <p className="text-sm text-zinc-500 mb-6">Set time windows and XP points for your daily routine tasks.</p>

                    <div className="space-y-6">
                        {['gym', 'breakfast', 'lunch'].map((task) => (
                            <div key={task} className="p-4 bg-elevated rounded-xl border border-subtle">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-base font-semibold text-heading capitalize">{task === 'gym' ? 'Gym / Workout' : task}</h4>
                                    <span className="text-xs font-mono text-zinc-500">
                                        {String(timedConfig[task].startH).padStart(2, '0')}:{String(timedConfig[task].startM).padStart(2, '0')} -
                                        {String(timedConfig[task].endH).padStart(2, '0')}:{String(timedConfig[task].endM).padStart(2, '0')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-end">
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Start Hour</label>
                                        <input type="number" min="0" max="23" value={timedConfig[task].startH} onChange={(e) => handleTimedConfigChange(task, 'startH', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Start Min</label>
                                        <input type="number" min="0" max="59" value={timedConfig[task].startM} onChange={(e) => handleTimedConfigChange(task, 'startM', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">End Hour</label>
                                        <input type="number" min="0" max="23" value={timedConfig[task].endH} onChange={(e) => handleTimedConfigChange(task, 'endH', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">End Min</label>
                                        <input type="number" min="0" max="59" value={timedConfig[task].endM} onChange={(e) => handleTimedConfigChange(task, 'endM', e.target.value)} className="input-field" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 block mb-1">Points</label>
                                        <input type="number" value={timedConfig[task].points} onChange={(e) => handleTimedConfigChange(task, 'points', e.target.value)} className="input-field" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={saveTimedConfig} className="btn-primary">Save Configuration</button>
                    </div>
                </div>
            )}

            {activeTab === 'import-learning' && (
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-2">Learning Import</h3>
                        <p className="text-sm text-zinc-500 mb-4">Bulk import domains, topics, and subtopics.</p>
                        <div className="mb-4 p-3 bg-elevated rounded-lg border border-subtle">
                            <p className="text-xs text-zinc-500 mb-2">Required format:</p>
                            <pre className="text-xs text-emerald-400 font-mono overflow-auto">{exampleJson}</pre>
                        </div>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Paste your JSON here..."
                            className="input-field resize-none mb-4 font-mono text-sm"
                            rows={10}
                            disabled={isImporting}
                        />
                        <button onClick={handleBulkJsonImport} className="btn-primary text-sm" disabled={!jsonInput.trim() || isImporting}>
                            {isImporting ? 'Importing...' : 'Import Data'}
                        </button>
                    </div>
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-4">Current Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-elevated rounded-lg border border-subtle">
                                <p className="text-xs text-zinc-500 mb-1">Learning Domains</p>
                                <p className="text-lg font-bold text-heading">{learningDomains.length}</p>
                            </div>
                            <div className="p-3 bg-elevated rounded-lg border border-subtle">
                                <p className="text-xs text-zinc-500 mb-1">Workout Routines</p>
                                <p className="text-lg font-bold text-heading">{workouts.length}</p>
                            </div>
                            <div className="p-3 bg-elevated rounded-lg border border-subtle">
                                <p className="text-xs text-zinc-500 mb-1">Stored Recipes</p>
                                <p className="text-lg font-bold text-heading">{recipes.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'import-recipes' && (
                <div className="glass-card p-5">
                    <h3 className="text-base font-semibold text-heading mb-2">Recipe Import</h3>
                    <p className="text-sm text-zinc-500 mb-4">Import recipes for diet tracking.</p>
                    <div className="mb-4 p-3 bg-elevated rounded-lg border border-subtle">
                        <p className="text-xs text-zinc-500 mb-2">Required format:</p>
                        <pre className="text-xs text-amber-400 font-mono overflow-auto">{`[
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
]`}</pre>
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste recipe JSON here..."
                        className="input-field resize-none mb-4 font-mono text-sm"
                        rows={8}
                        disabled={isImporting}
                    />
                    <button
                        onClick={handleRecipeImport}
                        className="btn-primary text-sm"
                        disabled={!jsonInput.trim() || isImporting}
                    >
                        {isImporting ? 'Importing...' : 'Import Recipes'}
                    </button>
                </div>
            )}

            {activeTab === 'import-workouts' && (
                <div className="glass-card p-5">
                    <h3 className="text-base font-semibold text-heading mb-2">Workout Import</h3>
                    <p className="text-sm text-zinc-500 mb-4">Import workout routines with exercises.</p>
                    <div className="mb-4 p-3 bg-elevated rounded-lg border border-subtle">
                        <p className="text-xs text-zinc-500 mb-2">Required format:</p>
                        <pre className="text-xs text-sky-400 font-mono overflow-auto">{`[
  {
    "name": "Push Day",
    "pre_workout_warmup": ["Arm circles – 30 sec"],
    "exercises": [
      {
        "muscle_group": "Chest",
        "movements": ["Barbell Bench Press – 4×4–6"]
      }
    ],
    "post_workout_stretch": ["Doorway chest stretch – 45 sec"]
  },
  {
    "name": "Simple Workout",
    "exercises": ["Squats", "Deadlifts"]
  }
]`}</pre>
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste workout JSON here..."
                        className="input-field resize-none mb-4 font-mono text-sm"
                        rows={8}
                        disabled={isImporting}
                    />
                    <button
                        onClick={handleWorkoutImport}
                        className="btn-primary text-sm"
                        disabled={!jsonInput.trim() || isImporting}
                    >
                        {isImporting ? 'Importing...' : 'Import Workouts'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Admin;

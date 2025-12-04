import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Social = () => {
    const { goals, addGoal, editGoal, toggleGoal, deleteGoal } = useApp();
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [newGoalText, setNewGoalText] = useState('');
    const [newGoalCategory, setNewGoalCategory] = useState('general');
    const [editingGoal, setEditingGoal] = useState(null);

    const categories = [
        { value: 'general', label: 'General' },
        { value: 'dsa', label: 'DSA' },
        { value: 'ai', label: 'AI/ML' },
        { value: 'gym', label: 'Fitness' },
        { value: 'career', label: 'Career' },
        { value: 'personal', label: 'Personal' },
    ];

    const handleAddGoal = () => {
        if (!newGoalText.trim()) return;
        addGoal(newGoalText.trim(), newGoalCategory);
        setNewGoalText(''); setNewGoalCategory('general'); setShowAddGoal(false);
    };

    const handleSaveEdit = (goalId, newText) => {
        editGoal(goalId, { text: newText });
        setEditingGoal(null);
    };

    const activeGoals = goals.filter(g => !g.completed);
    const completedGoals = goals.filter(g => g.completed);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white mb-1">Goals</h1>
                    <p className="text-sm text-zinc-500">Set and track your personal objectives</p>
                </div>
                <button onClick={() => setShowAddGoal(true)} className="btn-primary text-sm">+ Add Goal</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Active</p>
                    <p className="stat-value text-amber-400">{activeGoals.length}</p>
                    <p className="stat-sublabel">in progress</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Completed</p>
                    <p className="stat-value text-emerald-400">{completedGoals.length}</p>
                    <p className="stat-sublabel">achieved</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Total</p>
                    <p className="stat-value">{goals.length}</p>
                    <p className="stat-sublabel">all goals</p>
                </div>
                <div className="glass-card p-4">
                    <p className="stat-label mb-1">Completion</p>
                    <p className="stat-value">{goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0}%</p>
                    <p className="stat-sublabel">rate</p>
                </div>
            </div>

            {/* Add Goal Form */}
            {showAddGoal && (
                <div className="glass-card p-5 space-y-4">
                    <h3 className="text-base font-semibold text-white">New Goal</h3>
                    <input type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} placeholder="What do you want to achieve?" className="input-field" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()} />
                    <div>
                        <label className="text-xs font-medium text-zinc-500 block mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button key={cat.value} onClick={() => setNewGoalCategory(cat.value)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${newGoalCategory === cat.value ? 'bg-white text-black' : 'bg-[#111111] text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'}`}>
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleAddGoal} className="btn-primary text-sm">Add Goal</button>
                        <button onClick={() => setShowAddGoal(false)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                </div>
            )}

            {/* Active Goals */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Active Goals</h3>
                {activeGoals.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-500 mb-2">No active goals</p>
                        <p className="text-xs text-zinc-600">Set your first goal above to get started</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activeGoals.map((goal) => (
                            <div key={goal.id} className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-xl border border-[#111111] hover:border-[#1a1a1a] transition-all group">
                                <button onClick={() => toggleGoal(goal.id)} className="w-5 h-5 rounded-md border-2 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 flex items-center justify-center flex-shrink-0 transition-all"></button>
                                {editingGoal === goal.id ? (
                                    <input type="text" defaultValue={goal.text} className="flex-1 bg-[#111111] px-3 py-2 rounded-lg text-white text-sm" autoFocus onBlur={(e) => handleSaveEdit(goal.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(goal.id, e.target.value); else if (e.key === 'Escape') setEditingGoal(null); }} />
                                ) : (
                                    <span className="flex-1 text-sm text-white">{goal.text}</span>
                                )}
                                <span className="tag">{goal.category || 'general'}</span>
                                <button onClick={() => setEditingGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-xs text-zinc-600 hover:text-white font-medium transition-all">Edit</button>
                                <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-xs text-zinc-600 hover:text-red-400 font-medium transition-all">Del</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
                <div className="glass-card p-5">
                    <h3 className="text-base font-semibold text-white mb-4">Completed</h3>
                    <div className="space-y-2">
                        {completedGoals.map((goal) => (
                            <div key={goal.id} className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group">
                                <button onClick={() => toggleGoal(goal.id)} className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">✓</button>
                                <span className="flex-1 text-sm text-emerald-400 line-through">{goal.text}</span>
                                <span className="tag">{goal.category || 'general'}</span>
                                <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-xs text-zinc-600 hover:text-red-400 font-medium transition-all">Del</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Social;

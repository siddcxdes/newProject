import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Social = () => {
    const { goals, addGoal, editGoal, toggleGoal, deleteGoal, logActivity } = useApp();
    const [newGoal, setNewGoal] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (!newGoal.trim()) return;
        addGoal(newGoal.trim());
        setNewGoal('');
    };

    const startEditing = (goal) => {
        setEditingId(goal.id);
        setEditText(goal.text);
    };

    const saveEdit = () => {
        if (editText.trim() && editingId) {
            editGoal(editingId, editText.trim());
        }
        setEditingId(null);
        setEditText('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const handleLogWin = async (label) => {
        await logActivity('personal', { notes: label });
    };

    const personalWins = [
        { icon: '🎉', label: 'Achieved a milestone' },
        { icon: '🏆', label: 'Won a competition' },
        { icon: '📚', label: 'Learned something new' },
        { icon: '🤝', label: 'Made a new connection' },
        { icon: '💡', label: 'Had a breakthrough' },
        { icon: '🎯', label: 'Hit a goal' },
    ];

    const completedCount = goals.filter(g => g.completed).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">🎯 Social & Goals</h1>
                <p className="text-slate-400">Set goals and celebrate your wins</p>
            </div>

            {/* Personal Goals */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Personal Goals</h3>
                    <span className="text-sm text-slate-400">
                        💡 Tip: Use Ctrl+Z to undo, Ctrl+Shift+Z to redo
                    </span>
                </div>

                <form onSubmit={handleAddGoal} className="flex gap-3 mb-6">
                    <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Add a new goal..."
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button type="submit" className="btn-primary">Add</button>
                </form>

                <div className="space-y-3">
                    {goals.map((goal) => (
                        <div
                            key={goal.id}
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${goal.completed
                                    ? 'bg-green-500/10 border border-green-500/30'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleGoal(goal.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${goal.completed
                                        ? 'bg-green-500 text-white'
                                        : 'border-2 border-slate-500 hover:border-purple-500'
                                    }`}
                            >
                                {goal.completed && '✓'}
                            </button>

                            {/* Goal text or edit input */}
                            {editingId === goal.id ? (
                                <div className="flex-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                        className="flex-1 px-3 py-1 bg-white/10 border border-purple-500 rounded-lg text-white focus:outline-none"
                                        autoFocus
                                    />
                                    <button
                                        onClick={saveEdit}
                                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="px-3 py-1 bg-slate-500/20 text-slate-400 rounded-lg hover:bg-slate-500/30 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className={`flex-1 ${goal.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                        {goal.text}
                                    </span>

                                    {/* Edit button */}
                                    <button
                                        onClick={() => startEditing(goal)}
                                        className="text-slate-500 hover:text-purple-400 transition-colors p-1"
                                        title="Edit goal"
                                    >
                                        ✏️
                                    </button>

                                    {/* Delete button */}
                                    <button
                                        onClick={() => deleteGoal(goal.id)}
                                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                        title="Delete goal"
                                    >
                                        🗑️
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                    {goals.length === 0 && (
                        <p className="text-center text-slate-500 py-4">No goals yet. Add your first goal above!</p>
                    )}
                </div>
            </div>

            {/* Log Personal Win */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Log a Personal Win 🎉</h3>
                <p className="text-slate-400 mb-4">Celebrate your achievements and earn +10 XP!</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {personalWins.map((win) => (
                        <button
                            key={win.label}
                            onClick={() => handleLogWin(win.label)}
                            className="glass-card-hover p-4 text-center"
                        >
                            <span className="text-3xl block mb-2">{win.icon}</span>
                            <span className="text-sm text-white">{win.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Completion Stats */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Goal Progress</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="progress-bar h-4">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                style={{ width: `${goals.length > 0 ? (completedCount / goals.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                    <span className="text-white font-semibold">
                        {completedCount}/{goals.length}
                    </span>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                    {completedCount === goals.length && goals.length > 0
                        ? '🎉 All goals completed! Great work!'
                        : `${goals.length - completedCount} goals remaining`}
                </p>
            </div>
        </div>
    );
};

export default Social;
